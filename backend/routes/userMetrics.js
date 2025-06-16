const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { authenticateToken } = require('./auth');

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
    res.json(metrics);
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

module.exports = router; 