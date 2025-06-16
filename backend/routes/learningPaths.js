const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { authenticateToken } = require('./auth');

// Get all learning paths for a user
router.get('/', authenticateToken, (req, res) => {
  const userId = req.user.id;

  db.all(`
    SELECT lp.*, 
           COUNT(DISTINCT l.id) as level_count,
           COUNT(DISTINCT m.id) as module_count,
           SUM(CASE WHEN m.is_completed = 1 THEN 1 ELSE 0 END) as completed_modules
    FROM learning_paths lp
    LEFT JOIN levels l ON l.learning_path_id = lp.id
    LEFT JOIN modules m ON m.level_id = l.id
    WHERE lp.user_id = ?
    GROUP BY lp.id
    ORDER BY lp.created_at DESC
  `, [userId], (err, paths) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(paths);
  });
});

// Get a single learning path with all details
router.get('/:id', authenticateToken, (req, res) => {
  const pathId = req.params.id;
  const userId = req.user.id;

  // First verify the path belongs to the user
  db.get('SELECT * FROM learning_paths WHERE id = ? AND user_id = ?', 
    [pathId, userId],
    (err, path) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (!path) {
        return res.status(404).json({ error: 'Learning path not found' });
      }

      // Get all levels with their modules and projects
      db.all(`
        SELECT l.*, 
               json_group_array(
                 json_object(
                   'id', m.id,
                   'title', m.title,
                   'description', m.description,
                   'youtube_url', m.youtube_url,
                   'github_url', m.github_url,
                   'is_completed', m.is_completed,
                   'notes', m.notes,
                   'order_index', m.order_index
                 )
               ) as modules,
               json_group_array(
                 json_object(
                   'id', p.id,
                   'title', p.title,
                   'description', p.description,
                   'github_url', p.github_url,
                   'order_index', p.order_index
                 )
               ) as projects
        FROM levels l
        LEFT JOIN modules m ON m.level_id = l.id
        LEFT JOIN projects p ON p.level_id = l.id
        WHERE l.learning_path_id = ?
        GROUP BY l.id
        ORDER BY l.order_index
      `, [pathId], (err, levels) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }

        // Parse JSON strings in modules and projects
        const formattedLevels = levels.map(level => ({
          ...level,
          modules: JSON.parse(level.modules).filter(m => m.id !== null),
          projects: JSON.parse(level.projects).filter(p => p.id !== null)
        }));

        res.json({
          ...path,
          levels: formattedLevels
        });
      });
    }
  );
});

// Create a new learning path
router.post('/', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const { topic, levels } = req.body;

  db.run('INSERT INTO learning_paths (user_id, topic) VALUES (?, ?)',
    [userId, topic],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Error creating learning path' });
      }

      const pathId = this.lastID;
      let completedLevels = 0;
      let completedModules = 0;

      // Insert levels and their modules/projects
      const insertLevel = (level, levelIndex) => {
        return new Promise((resolve, reject) => {
          db.run('INSERT INTO levels (learning_path_id, name, order_index) VALUES (?, ?, ?)',
            [pathId, level.name, levelIndex],
            function(err) {
              if (err) {
                reject(err);
                return;
              }

              const levelId = this.lastID;
              const modulePromises = level.modules.map((module, moduleIndex) => {
                return new Promise((resolve, reject) => {
                  db.run(`
                    INSERT INTO modules 
                    (level_id, title, description, youtube_url, github_url, is_completed, notes, order_index)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                  `, [
                    levelId,
                    module.title,
                    module.description,
                    module.youtubeUrl,
                    module.githubUrl,
                    module.isCompleted ? 1 : 0,
                    module.notes,
                    moduleIndex
                  ], function(err) {
                    if (err) {
                      reject(err);
                      return;
                    }
                    if (module.isCompleted) {
                      completedModules++;
                    }
                    resolve();
                  });
                });
              });

              const projectPromises = level.projects.map((project, projectIndex) => {
                return new Promise((resolve, reject) => {
                  db.run(`
                    INSERT INTO projects 
                    (level_id, title, description, github_url, order_index)
                    VALUES (?, ?, ?, ?, ?)
                  `, [
                    levelId,
                    project.title,
                    project.description,
                    project.githubUrl,
                    projectIndex
                  ], (err) => {
                    if (err) {
                      reject(err);
                      return;
                    }
                    resolve();
                  });
                });
              });

              Promise.all([...modulePromises, ...projectPromises])
                .then(() => {
                  completedLevels++;
                  resolve();
                })
                .catch(reject);
            }
          );
        });
      };

      // Insert all levels sequentially
      const insertAllLevels = async () => {
        try {
          for (let i = 0; i < levels.length; i++) {
            await insertLevel(levels[i], i);
          }

          // Update user metrics
          db.run(`
            UPDATE user_metrics 
            SET total_paths = total_paths + 1,
                total_modules = total_modules + ?,
                completed_modules = completed_modules + ?,
                average_completion_rate = CASE 
                  WHEN total_modules + ? > 0 
                  THEN ((completed_modules + ?) * 100) / (total_modules + ?)
                  ELSE 0
                END
            WHERE user_id = ?
          `, [
            completedModules,
            completedModules,
            completedModules,
            completedModules,
            completedModules,
            userId
          ]);

          res.status(201).json({ id: pathId, message: 'Learning path created successfully' });
        } catch (error) {
          res.status(500).json({ error: 'Error creating learning path details' });
        }
      };

      insertAllLevels();
    }
  );
});

// Update a learning path
router.put('/:id', authenticateToken, (req, res) => {
  const pathId = req.params.id;
  const userId = req.user.id;
  const { topic, levels } = req.body;

  // First verify the path belongs to the user
  db.get('SELECT * FROM learning_paths WHERE id = ? AND user_id = ?',
    [pathId, userId],
    (err, path) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (!path) {
        return res.status(404).json({ error: 'Learning path not found' });
      }

      // Update the path topic
      db.run('UPDATE learning_paths SET topic = ? WHERE id = ?',
        [topic, pathId],
        (err) => {
          if (err) {
            return res.status(500).json({ error: 'Error updating learning path' });
          }

          // Delete existing levels (cascade will delete modules and projects)
          db.run('DELETE FROM levels WHERE learning_path_id = ?', [pathId], (err) => {
            if (err) {
              return res.status(500).json({ error: 'Error updating learning path' });
            }

            // Recreate levels with new data
            let completedModules = 0;

            const insertLevel = (level, levelIndex) => {
              return new Promise((resolve, reject) => {
                db.run('INSERT INTO levels (learning_path_id, name, order_index) VALUES (?, ?, ?)',
                  [pathId, level.name, levelIndex],
                  function(err) {
                    if (err) {
                      reject(err);
                      return;
                    }

                    const levelId = this.lastID;
                    const modulePromises = level.modules.map((module, moduleIndex) => {
                      return new Promise((resolve, reject) => {
                        db.run(`
                          INSERT INTO modules 
                          (level_id, title, description, youtube_url, github_url, is_completed, notes, order_index)
                          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                        `, [
                          levelId,
                          module.title,
                          module.description,
                          module.youtubeUrl,
                          module.githubUrl,
                          module.isCompleted ? 1 : 0,
                          module.notes,
                          moduleIndex
                        ], function(err) {
                          if (err) {
                            reject(err);
                            return;
                          }
                          if (module.isCompleted) {
                            completedModules++;
                          }
                          resolve();
                        });
                      });
                    });

                    const projectPromises = level.projects.map((project, projectIndex) => {
                      return new Promise((resolve, reject) => {
                        db.run(`
                          INSERT INTO projects 
                          (level_id, title, description, github_url, order_index)
                          VALUES (?, ?, ?, ?, ?)
                        `, [
                          levelId,
                          project.title,
                          project.description,
                          project.githubUrl,
                          projectIndex
                        ], (err) => {
                          if (err) {
                            reject(err);
                            return;
                          }
                          resolve();
                        });
                      });
                    });

                    Promise.all([...modulePromises, ...projectPromises])
                      .then(resolve)
                      .catch(reject);
                  }
                );
              });
            };

            // Insert all levels sequentially
            const insertAllLevels = async () => {
              try {
                for (let i = 0; i < levels.length; i++) {
                  await insertLevel(levels[i], i);
                }

                // Update user metrics
                db.run(`
                  UPDATE user_metrics 
                  SET total_modules = ?,
                      completed_modules = ?,
                      average_completion_rate = CASE 
                        WHEN ? > 0 
                        THEN (? * 100) / ?
                        ELSE 0
                      END
                  WHERE user_id = ?
                `, [
                  completedModules,
                  completedModules,
                  completedModules,
                  completedModules,
                  completedModules,
                  userId
                ]);

                res.json({ message: 'Learning path updated successfully' });
              } catch (error) {
                res.status(500).json({ error: 'Error updating learning path details' });
              }
            };

            insertAllLevels();
          });
        }
      );
    }
  );
});

// Delete a learning path
router.delete('/:id', authenticateToken, (req, res) => {
  const pathId = req.params.id;
  const userId = req.user.id;

  // First verify the path belongs to the user
  db.get('SELECT * FROM learning_paths WHERE id = ? AND user_id = ?',
    [pathId, userId],
    (err, path) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (!path) {
        return res.status(404).json({ error: 'Learning path not found' });
      }

      // Get module counts before deletion for metrics update
      db.get(`
        SELECT COUNT(*) as total_modules,
               SUM(CASE WHEN m.is_completed = 1 THEN 1 ELSE 0 END) as completed_modules
        FROM learning_paths lp
        JOIN levels l ON l.learning_path_id = lp.id
        JOIN modules m ON m.level_id = l.id
        WHERE lp.id = ?
      `, [pathId], (err, counts) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }

        // Delete the path (cascade will delete levels, modules, and projects)
        db.run('DELETE FROM learning_paths WHERE id = ?', [pathId], (err) => {
          if (err) {
            return res.status(500).json({ error: 'Error deleting learning path' });
          }

          // Update user metrics
          db.run(`
            UPDATE user_metrics 
            SET total_paths = total_paths - 1,
                total_modules = total_modules - ?,
                completed_modules = completed_modules - ?,
                average_completion_rate = CASE 
                  WHEN total_modules - ? > 0 
                  THEN ((completed_modules - ?) * 100) / (total_modules - ?)
                  ELSE 0
                END
            WHERE user_id = ?
          `, [
            counts.total_modules || 0,
            counts.completed_modules || 0,
            counts.total_modules || 0,
            counts.completed_modules || 0,
            counts.total_modules || 0,
            userId
          ]);

          res.json({ message: 'Learning path deleted successfully' });
        });
      });
    }
  );
});

// Toggle module completion
router.patch('/:pathId/modules/:moduleId/complete', authenticateToken, (req, res) => {
  const { pathId, moduleId } = req.params;
  const userId = req.user.id;
  const { isCompleted } = req.body;

  // Verify the module belongs to the user's path
  db.get(`
    SELECT m.* 
    FROM modules m
    JOIN levels l ON l.id = m.level_id
    JOIN learning_paths lp ON lp.id = l.learning_path_id
    WHERE m.id = ? AND lp.id = ? AND lp.user_id = ?
  `, [moduleId, pathId, userId], (err, module) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!module) {
      return res.status(404).json({ error: 'Module not found' });
    }

    // Update module completion status
    db.run('UPDATE modules SET is_completed = ? WHERE id = ?',
      [isCompleted ? 1 : 0, moduleId],
      (err) => {
        if (err) {
          return res.status(500).json({ error: 'Error updating module' });
        }

        // Update user metrics
        db.run(`
          UPDATE user_metrics 
          SET completed_modules = completed_modules + ?,
              average_completion_rate = CASE 
                WHEN total_modules > 0 
                THEN (completed_modules * 100) / total_modules
                ELSE 0
              END
          WHERE user_id = ?
        `, [isCompleted ? 1 : -1, userId]);

        res.json({ message: 'Module updated successfully' });
      }
    );
  });
});

// Update module notes
router.patch('/:pathId/modules/:moduleId/notes', authenticateToken, (req, res) => {
  const { pathId, moduleId } = req.params;
  const userId = req.user.id;
  const { notes } = req.body;

  // Verify the module belongs to the user's path
  db.get(`
    SELECT m.* 
    FROM modules m
    JOIN levels l ON l.id = m.level_id
    JOIN learning_paths lp ON lp.id = l.learning_path_id
    WHERE m.id = ? AND lp.id = ? AND lp.user_id = ?
  `, [moduleId, pathId, userId], (err, module) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!module) {
      return res.status(404).json({ error: 'Module not found' });
    }

    // Update module notes
    db.run('UPDATE modules SET notes = ? WHERE id = ?',
      [notes, moduleId],
      (err) => {
        if (err) {
          return res.status(500).json({ error: 'Error updating module notes' });
        }
        res.json({ message: 'Module notes updated successfully' });
      }
    );
  });
});

module.exports = router; 