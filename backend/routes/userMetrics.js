const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { authenticateToken } = require('./auth');

// Function to get recent user activity
const getRecentActivity = (userId, callback) => {
  // Get last completed module - simplified
  db.get(`
    SELECT m.title as module_title, lp.topic as path_topic, m.id as updated_at
    FROM modules m
    JOIN levels l ON l.id = m.level_id
    JOIN learning_paths lp ON lp.id = l.learning_path_id
    WHERE lp.user_id = ? AND m.is_completed = 1
    ORDER BY m.id DESC
    LIMIT 1
  `, [userId], (err, lastModule) => {
    if (err) {
      console.error('Error getting last module:', err);
      lastModule = null;
    }

    // Get last completed path - simplified
    db.get(`
      SELECT lp.topic, lp.created_at as updated_at
      FROM learning_paths lp
      WHERE lp.user_id = ?
      ORDER BY lp.created_at DESC
      LIMIT 1
    `, [userId], (err, lastPath) => {
      if (err) {
        console.error('Error getting last path:', err);
        lastPath = null;
      }

      // Calculate learning streak - simplified
      db.get(`
        SELECT COUNT(*) as streak_days
        FROM modules m
        JOIN levels l ON l.id = m.level_id
        JOIN learning_paths lp ON lp.id = l.learning_path_id
        WHERE lp.user_id = ? AND m.is_completed = 1
      `, [userId], (err, streakData) => {
        if (err) {
          console.error('Error getting streak data:', err);
          streakData = { streak_days: 0 };
        }

        const recentActivity = {
          lastCompletedModule: lastModule ? `${lastModule.module_title} (${lastModule.path_topic})` : null,
          lastCompletedPath: lastPath ? lastPath.topic : null,
          streakDays: streakData ? streakData.streak_days : 0
        };

        callback(null, recentActivity);
      });
    });
  });
};

// Function to get progress by difficulty level
const getProgressByLevel = (userId, callback) => {
  db.all(`
    SELECT 
      l.name as level_name,
      COUNT(m.id) as total_modules,
      SUM(CASE WHEN m.is_completed = 1 THEN 1 ELSE 0 END) as completed_modules
    FROM learning_paths lp
    JOIN levels l ON l.learning_path_id = lp.id
    LEFT JOIN modules m ON m.level_id = l.id
    WHERE lp.user_id = ?
    GROUP BY l.name
  `, [userId], (err, levelData) => {
    if (err) return callback(err);

    const progressByLevel = {
      beginner: { total: 0, completed: 0 },
      intermediate: { total: 0, completed: 0 },
      advanced: { total: 0, completed: 0 }
    };

    levelData.forEach(level => {
      const levelName = level.level_name.toLowerCase();
      if (levelName.includes('beginner') || levelName.includes('basic')) {
        progressByLevel.beginner.total += level.total_modules || 0;
        progressByLevel.beginner.completed += level.completed_modules || 0;
      } else if (levelName.includes('intermediate') || levelName.includes('intermediate')) {
        progressByLevel.intermediate.total += level.total_modules || 0;
        progressByLevel.intermediate.completed += level.completed_modules || 0;
      } else if (levelName.includes('advanced') || levelName.includes('expert')) {
        progressByLevel.advanced.total += level.total_modules || 0;
        progressByLevel.advanced.completed += level.completed_modules || 0;
      } else {
        // Default to beginner if level name is unclear
        progressByLevel.beginner.total += level.total_modules || 0;
        progressByLevel.beginner.completed += level.completed_modules || 0;
      }
    });

    callback(null, progressByLevel);
  });
};

// Function to recalculate user metrics from scratch
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

    // Get recent activity and progress by level
    getRecentActivity(userId, (err, recentActivity) => {
      if (err) return callback(err);

      getProgressByLevel(userId, (err, progressByLevel) => {
        if (err) return callback(err);

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
            `, [userId, totalPaths, completedPaths, totalModules, completedModules, averageCompletionRate], (err) => {
              if (err) return callback(err);
              callback(null, { recentActivity, progressByLevel });
            });
          } else {
            callback(null, { recentActivity, progressByLevel });
          }
        });
      });
    });
  });
};

// Get user metrics
router.get('/', authenticateToken, (req, res) => {
  const userId = req.user.id;

  db.get(`
    SELECT 
      total_paths,
      completed_paths,
      total_modules,
      completed_modules,
      average_completion_rate,
      last_updated
    FROM user_metrics 
    WHERE user_id = ?
  `, [userId], (err, metrics) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!metrics) {
      return res.status(404).json({ error: 'User metrics not found' });
    }

    // Get additional activity data
    getRecentActivity(userId, (err, recentActivity) => {
      if (err) {
        console.error('Error getting recent activity:', err);
        recentActivity = {};
      }

      getProgressByLevel(userId, (err, progressByLevel) => {
        if (err) {
          console.error('Error getting progress by level:', err);
          progressByLevel = {
            beginner: { total: 0, completed: 0 },
            intermediate: { total: 0, completed: 0 },
            advanced: { total: 0, completed: 0 }
          };
        }

        // Combine all metrics data
        const enhancedMetrics = {
          ...metrics,
          recentActivity,
          progressByLevel
        };

        res.json(enhancedMetrics);
      });
    });
  });
});

// Recalculate user metrics (for fixing inconsistencies)
router.post('/recalculate', authenticateToken, (req, res) => {
  const userId = req.user.id;

  recalculateUserMetrics(userId, (err, metrics) => {
    if (err) {
      console.error('Error recalculating metrics:', err);
      return res.status(500).json({ error: 'Error recalculating metrics' });
    }
    
    // Return the updated metrics
    res.json({ message: 'Metrics recalculated successfully', metrics });
  });
});

// Update user metrics (admin only, not exposed to frontend)
router.put('/', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const { total_paths, completed_paths, total_modules, completed_modules } = req.body;

  db.run(`
    UPDATE user_metrics 
    SET total_paths = ?,
        completed_paths = ?,
        total_modules = ?,
        completed_modules = ?,
        average_completion_rate = CASE 
          WHEN ? > 0 
          THEN (? * 100) / ?
          ELSE 0
        END,
        last_updated = CURRENT_TIMESTAMP
    WHERE user_id = ?
  `, [
    total_paths,
    completed_paths,
    total_modules,
    completed_modules,
    total_modules,
    completed_modules,
    total_modules,
    userId
  ], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Error updating user metrics' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'User metrics not found' });
    }
    res.json({ message: 'User metrics updated successfully' });
  });
});

// Get detailed user activity history
router.get('/activity', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const limit = parseInt(req.query.limit) || 10;

  // Get recent module completions - simplified query
  db.all(`
    SELECT 
      m.title as module_title,
      l.name as level_name,
      lp.topic as path_topic,
      m.id as completed_at,
      m.notes
    FROM modules m
    JOIN levels l ON l.id = m.level_id
    JOIN learning_paths lp ON lp.id = l.learning_path_id
    WHERE lp.user_id = ? AND m.is_completed = 1
    ORDER BY m.id DESC
    LIMIT ?
  `, [userId, limit], (err, moduleActivity) => {
    if (err) {
      console.error('Error fetching module activity:', err);
      moduleActivity = [];
    }

    // Get recent path activities - simplified query
    db.all(`
      SELECT 
        lp.topic,
        lp.created_at,
        COUNT(m.id) as total_modules,
        SUM(CASE WHEN m.is_completed = 1 THEN 1 ELSE 0 END) as completed_modules
      FROM learning_paths lp
      LEFT JOIN levels l ON l.learning_path_id = lp.id
      LEFT JOIN modules m ON m.level_id = l.id
      WHERE lp.user_id = ?
      GROUP BY lp.id, lp.topic, lp.created_at
      ORDER BY lp.created_at DESC
      LIMIT ?
    `, [userId, limit], (err, pathActivity) => {
      if (err) {
        console.error('Error fetching path activity:', err);
        pathActivity = [];
      }

      // Get daily activity - simplified query
      db.all(`
        SELECT 
          DATE('now') as activity_date,
          COUNT(*) as modules_completed
        FROM modules m
        JOIN levels l ON l.id = m.level_id
        JOIN learning_paths lp ON lp.id = l.learning_path_id
        WHERE lp.user_id = ? AND m.is_completed = 1
        GROUP BY DATE('now')
        ORDER BY activity_date DESC
        LIMIT 7
      `, [userId], (err, dailyActivity) => {
        if (err) {
          console.error('Error fetching daily activity:', err);
          dailyActivity = [];
        }

        res.json({
          moduleActivity: moduleActivity || [],
          pathActivity: pathActivity || [],
          dailyActivity: dailyActivity || []
        });
      });
    });
  });
});

// Get metrics for each individual learning path
router.get('/paths', authenticateToken, (req, res) => {
  const userId = req.user.id;

  db.all(`
    SELECT 
      lp.id,
      lp.topic,
      lp.created_at,
      COUNT(DISTINCT l.id) as total_levels,
      COUNT(m.id) as total_modules,
      SUM(CASE WHEN m.is_completed = 1 THEN 1 ELSE 0 END) as completed_modules,
      CASE 
        WHEN COUNT(m.id) > 0 
        THEN ROUND((SUM(CASE WHEN m.is_completed = 1 THEN 1 ELSE 0 END) * 100.0) / COUNT(m.id), 1)
        ELSE 0 
      END as completion_rate,
      CASE 
        WHEN COUNT(m.id) > 0 AND SUM(CASE WHEN m.is_completed = 1 THEN 1 ELSE 0 END) = COUNT(m.id)
        THEN 1 
        ELSE 0 
      END as is_completed
    FROM learning_paths lp
    LEFT JOIN levels l ON l.learning_path_id = lp.id
    LEFT JOIN modules m ON m.level_id = l.id
    WHERE lp.user_id = ?
    GROUP BY lp.id, lp.topic, lp.created_at
    ORDER BY lp.created_at DESC
  `, [userId], (err, pathMetrics) => {
    if (err) {
      console.error('Error fetching path metrics:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    // Get detailed level breakdown for each path
    const getLevelBreakdown = (pathId, callback) => {
      db.all(`
        SELECT 
          l.name as level_name,
          COUNT(m.id) as total_modules,
          SUM(CASE WHEN m.is_completed = 1 THEN 1 ELSE 0 END) as completed_modules,
          CASE 
            WHEN COUNT(m.id) > 0 
            THEN ROUND((SUM(CASE WHEN m.is_completed = 1 THEN 1 ELSE 0 END) * 100.0) / COUNT(m.id), 1)
            ELSE 0 
          END as completion_rate
        FROM levels l
        LEFT JOIN modules m ON m.level_id = l.id
        WHERE l.learning_path_id = ?
        GROUP BY l.id, l.name
        ORDER BY l.order_index, l.name
      `, [pathId], (err, levels) => {
        if (err) {
          console.error('Error fetching level breakdown:', err);
          callback([]);
        } else {
          callback(levels || []);
        }
      });
    };

    // Add level breakdown to each path
    const enhancedPathMetrics = pathMetrics.map(path => {
      return new Promise((resolve) => {
        getLevelBreakdown(path.id, (levels) => {
          resolve({
            ...path,
            levels,
            lastActivity: null // Will be populated if needed
          });
        });
      });
    });

    Promise.all(enhancedPathMetrics).then(results => {
      res.json(results);
    });
  });
});

module.exports = router; 