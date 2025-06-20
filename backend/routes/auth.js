const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db/database');
const cors = require('cors');

// Middleware to authenticate JWT token from cookies
const authenticateToken = (req, res, next) => {
  const token = req.cookies.jwt;

  if (!token) {
    return res.status(401).json({ error: 'Access denied' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Register new user
router.post('/register', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user already exists
    db.get('SELECT id FROM users WHERE email = ?', [email], async (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (user) {
        return res.status(400).json({ error: 'User already exists' });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      // Create user
      db.run('INSERT INTO users (email, password_hash) VALUES (?, ?)', 
        [email, passwordHash],
        function(err) {
          if (err) {
            return res.status(500).json({ error: 'Error creating user' });
          }

          // Create initial user metrics
          db.run('INSERT INTO user_metrics (user_id) VALUES (?)', [this.lastID]);

          // Generate JWT
          const token = jwt.sign(
            { id: this.lastID, email },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
          );

          // Set JWT as HTTP-only cookie
          res.cookie('jwt', token, {
            httpOnly: true,
            secure: true, // in production
            sameSite: 'none', // in production
            domain: process.env.NODE_ENV === 'production' ? '.onrender.com' : undefined, // Set domain for production
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
          });

          res.status(201).json({
            user: { id: this.lastID, email }
          });
        }
      );
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (!user) {
        return res.status(400).json({ error: 'Invalid credentials' });
      }

      // Verify password
      const validPassword = await bcrypt.compare(password, user.password_hash);
      if (!validPassword) {
        return res.status(400).json({ error: 'Invalid credentials' });
      }

      // Generate JWT
      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      // Set JWT as HTTP-only cookie
      res.cookie('jwt', token, {
        httpOnly: true,
        secure: true, // in production
        sameSite: 'none', // in production
        domain: process.env.NODE_ENV === 'production' ? '.onrender.com' : undefined, // Set domain for production
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      });

      res.json({
        user: { id: user.id, email: user.email }
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Logout user
router.post('/logout', (req, res) => {
  // Clear the JWT cookie
  res.clearCookie('jwt', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    domain: process.env.NODE_ENV === 'production' ? '.onrender.com' : undefined // Set domain for production
  });
  
  res.json({ message: 'Logged out successfully' });
});

// Get current user
router.get('/me', authenticateToken, (req, res) => {
  db.get('SELECT id, email, created_at FROM users WHERE id = ?', 
    [req.user.id],
    (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(user);
    }
  );
});

module.exports = {
  router,
  authenticateToken
}; 