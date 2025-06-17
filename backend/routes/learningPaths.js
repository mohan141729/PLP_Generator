const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { authenticateToken } = require('./auth');

// Get all learning paths for a user
router.get('/', authenticateToken, (req, res) => {
  const userId = req.user.id;

  console.log('Getting learning paths for user:', userId);

  // First get all learning paths for the user
  db.all('SELECT * FROM learning_paths WHERE user_id = ? ORDER BY created_at DESC', [userId], (err, paths) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    console.log('Found', paths.length, 'learning paths');

    if (paths.length === 0) {
      return res.json([]);
    }

    // For each path, get its levels and modules
    const getPathWithDetails = (path) => {
      return new Promise((resolve, reject) => {
        // First get all levels for this path
        db.all('SELECT * FROM levels WHERE learning_path_id = ? ORDER BY order_index', [path.id], (err, levels) => {
          if (err) {
            reject(err);
            return;
          }

          // For each level, get its modules and projects
          const getLevelDetails = (level) => {
            return new Promise((resolve, reject) => {
              // Get modules for this level
              db.all('SELECT * FROM modules WHERE level_id = ? ORDER BY order_index', [level.id], (err, modules) => {
                if (err) {
                  reject(err);
                  return;
                }

                // Get projects for this level
                db.all('SELECT * FROM projects WHERE level_id = ? ORDER BY order_index', [level.id], (err, projects) => {
                  if (err) {
                    reject(err);
                    return;
                  }

                  resolve({
                    ...level,
                    modules: modules,
                    projects: projects
                  });
                });
              });
            });
          };

          // Get details for all levels
          Promise.all(levels.map(getLevelDetails))
            .then(levelsWithDetails => {
              const totalModules = levelsWithDetails.reduce((sum, level) => sum + level.modules.length, 0);
              console.log(`Path ${path.id} (${path.topic}): ${levelsWithDetails.length} levels, ${totalModules} modules`);

              resolve({
                ...path,
                levels: levelsWithDetails
              });
            })
            .catch(reject);
        });
      });
    };

    // Get details for all paths
    Promise.all(paths.map(getPathWithDetails))
      .then(pathsWithDetails => {
        const totalModules = pathsWithDetails.reduce((sum, path) => 
          sum + path.levels.reduce((levelSum, level) => levelSum + level.modules.length, 0), 0
        );
        console.log(`Total modules across all paths: ${totalModules}`);
        res.json(pathsWithDetails);
      })
      .catch(err => {
        console.error('Error getting path details:', err);
        res.status(500).json({ error: 'Database error' });
      });
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

      // Get all levels for this path
      db.all('SELECT * FROM levels WHERE learning_path_id = ? ORDER BY order_index', [pathId], (err, levels) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }

        // For each level, get its modules and projects
        const getLevelDetails = (level) => {
          return new Promise((resolve, reject) => {
            // Get modules for this level
            db.all('SELECT * FROM modules WHERE level_id = ? ORDER BY order_index', [level.id], (err, modules) => {
              if (err) {
                reject(err);
                return;
              }

              // Get projects for this level
              db.all('SELECT * FROM projects WHERE level_id = ? ORDER BY order_index', [level.id], (err, projects) => {
                if (err) {
                  reject(err);
                  return;
                }

                resolve({
                  ...level,
                  modules: modules,
                  projects: projects
                });
              });
            });
          });
        };

        // Get details for all levels
        Promise.all(levels.map(getLevelDetails))
          .then(levelsWithDetails => {
            res.json({
              ...path,
              levels: levelsWithDetails
            });
          })
          .catch(err => {
            console.error('Error getting level details:', err);
            res.status(500).json({ error: 'Database error' });
          });
      });
    }
  );
});

// Create a new learning path
router.post('/', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const { topic, levels } = req.body;

  console.log('Creating learning path for user:', userId);
  console.log('Topic:', topic);
  console.log('Number of levels:', levels ? levels.length : 0);
  
  if (levels) {
    levels.forEach((level, index) => {
      console.log(`Level ${index}: ${level.name} - ${level.modules ? level.modules.length : 0} modules`);
    });
  }

  const createdAt = new Date().toISOString();
  console.log('Created at:', createdAt);

  db.run('INSERT INTO learning_paths (user_id, topic, created_at) VALUES (?, ?, ?)',
    [userId, topic, createdAt],
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
              console.log(`Inserted level ${levelIndex}: ${level.name} with ID ${levelId}`);
              
              const modulePromises = level.modules.map((module, moduleIndex) => {
                return new Promise((resolve, reject) => {
                  console.log(`Module ${moduleIndex}:`, {
                    title: module.title,
                    description: module.description,
                    youtubeUrl: module.youtubeUrl,
                    githubUrl: module.githubUrl,
                    isCompleted: module.isCompleted,
                    notes: module.notes
                  });
                  
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
                      console.error('Error inserting module:', err);
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
                  console.log(`Completed inserting level ${levelIndex} with ${level.modules.length} modules`);
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

          console.log(`Total levels inserted: ${completedLevels}`);
          console.log(`Total modules inserted: ${completedModules}`);

          // Update user metrics
          recalculateUserMetrics(userId, (err) => {
            if (err) {
              console.error('Error recalculating user metrics:', err);
              res.status(500).json({ error: 'Error recalculating user metrics' });
            } else {
              res.status(201).json({ id: pathId, message: 'Learning path created successfully' });
            }
          });
        } catch (error) {
          console.error('Error in insertAllLevels:', error);
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
                        console.log(`Module ${moduleIndex}:`, {
                          title: module.title,
                          description: module.description,
                          youtubeUrl: module.youtubeUrl,
                          githubUrl: module.githubUrl,
                          isCompleted: module.isCompleted,
                          notes: module.notes
                        });
                        
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
                            console.error('Error inserting module:', err);
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
                recalculateUserMetrics(userId, (err) => {
                  if (err) {
                    console.error('Error recalculating user metrics:', err);
                    res.status(500).json({ error: 'Error recalculating user metrics' });
                  } else {
                    res.json({ message: 'Learning path updated successfully' });
                  }
                });
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
          recalculateUserMetrics(userId, (err) => {
            if (err) {
              console.error('Error recalculating user metrics:', err);
              res.status(500).json({ error: 'Error recalculating user metrics' });
            } else {
              res.json({ message: 'Learning path deleted successfully' });
            }
          });
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
    db.run('UPDATE modules SET is_completed = ?, updated_at = COALESCE(CURRENT_TIMESTAMP, datetime("now")) WHERE id = ?',
      [isCompleted ? 1 : 0, moduleId],
      (err) => {
        if (err) {
          // If updated_at column doesn't exist, try without it
          db.run('UPDATE modules SET is_completed = ? WHERE id = ?',
            [isCompleted ? 1 : 0, moduleId],
            (err2) => {
              if (err2) {
                return res.status(500).json({ error: 'Error updating module' });
              }

              // Update user metrics
              recalculateUserMetrics(userId, (err) => {
                if (err) {
                  console.error('Error recalculating user metrics:', err);
                  res.status(500).json({ error: 'Error recalculating user metrics' });
                } else {
                  res.json({ message: 'Module updated successfully' });
                }
              });
            }
          );
        } else {
          // Update user metrics
          recalculateUserMetrics(userId, (err) => {
            if (err) {
              console.error('Error recalculating user metrics:', err);
              res.status(500).json({ error: 'Error recalculating user metrics' });
            } else {
              res.json({ message: 'Module updated successfully' });
            }
          });
        }
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

// Function to recalculate user metrics (imported from userMetrics)
const recalculateUserMetrics = (userId, callback) => {
  // Get all learning paths for the user
  db.all(`
    SELECT lp.id, lp.topic,
           COUNT(DISTINCT l.id) as level_count,
           COUNT(m.id) as total_modules,
           SUM(CASE WHEN m.is_completed = 1 THEN 1 ELSE 0 END) as completed_modules
    FROM learning_paths lp
    LEFT JOIN levels l ON l.learning_path_id = lp.id
    LEFT JOIN modules m ON m.level_id = l.id
    WHERE lp.user_id = ?
    GROUP BY lp.id
  `, [userId], (err, paths) => {
    if (err) {
      return callback(err);
    }

    const totalPaths = paths.length;
    const totalModules = paths.reduce((sum, path) => sum + (path.total_modules || 0), 0);
    const completedModules = paths.reduce((sum, path) => sum + (path.completed_modules || 0), 0);
    
    // Calculate completed paths (paths where all modules are completed)
    const completedPaths = paths.filter(path => 
      path.total_modules > 0 && path.total_modules === path.completed_modules
    ).length;
    
    const averageCompletionRate = totalModules > 0 ? Math.round((completedModules * 100) / totalModules) : 0;

    console.log(`Recalculated metrics for user ${userId}:`, {
      totalPaths,
      completedPaths,
      totalModules,
      completedModules,
      averageCompletionRate
    });

    // Update user metrics
    db.run(`
      UPDATE user_metrics 
      SET total_paths = ?,
          completed_paths = ?,
          total_modules = ?,
          completed_modules = ?,
          average_completion_rate = ?,
          last_updated = CURRENT_TIMESTAMP
      WHERE user_id = ?
    `, [
      totalPaths,
      completedPaths,
      totalModules,
      completedModules,
      averageCompletionRate,
      userId
    ], function(err) {
      if (err) {
        return callback(err);
      }
      
      if (this.changes === 0) {
        // Create metrics record if it doesn't exist
        db.run(`
          INSERT INTO user_metrics 
          (user_id, total_paths, completed_paths, total_modules, completed_modules, average_completion_rate)
          VALUES (?, ?, ?, ?, ?, ?)
        `, [userId, totalPaths, completedPaths, totalModules, completedModules, averageCompletionRate], callback);
      } else {
        callback(null);
      }
    });
  });
};

module.exports = router; 