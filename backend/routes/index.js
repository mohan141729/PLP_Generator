const express = require('express');
const router = express.Router();

// Import route modules here
// Example: const userRoutes = require('./userRoutes');

// Use route modules here
// Example: router.use('/users', userRoutes);

// Basic test route
router.get('/test', (req, res) => {
  res.json({ message: 'API routes are working!' });
});

module.exports = router; 