const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Import routes
const { router: authRoutes } = require('./routes/auth');
const learningPathRoutes = require('./routes/learningPaths');
const userMetricsRoutes = require('./routes/userMetrics');

const app = express();
const PORT = process.env.PORT || 5000;

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url} - Origin: ${req.headers.origin}`);
  next();
});

// Middleware
app.use(cors({
  origin: [
    'https://plp-generator.vercel.app',
    
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// Ensure db directory exists
const dbDir = path.resolve(__dirname, 'db');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Initialize database
const db = require('./db/database');
db.serialize(() => {
  // Users table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Learning paths table
  db.run(`CREATE TABLE IF NOT EXISTS learning_paths (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    topic TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`);

  // Levels table
  db.run(`CREATE TABLE IF NOT EXISTS levels (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    learning_path_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    order_index INTEGER NOT NULL,
    FOREIGN KEY (learning_path_id) REFERENCES learning_paths(id) ON DELETE CASCADE
  )`);

  // Modules table
  db.run(`CREATE TABLE IF NOT EXISTS modules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    level_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    youtube_url TEXT,
    github_url TEXT,
    is_completed BOOLEAN DEFAULT 0,
    notes TEXT,
    order_index INTEGER NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (level_id) REFERENCES levels(id) ON DELETE CASCADE
  )`);

  // Projects table
  db.run(`CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    level_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    github_url TEXT,
    order_index INTEGER NOT NULL,
    FOREIGN KEY (level_id) REFERENCES levels(id) ON DELETE CASCADE
  )`);

  // User metrics table
  db.run(`CREATE TABLE IF NOT EXISTS user_metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    total_paths INTEGER DEFAULT 0,
    completed_paths INTEGER DEFAULT 0,
    total_modules INTEGER DEFAULT 0,
    completed_modules INTEGER DEFAULT 0,
    average_completion_rate INTEGER DEFAULT 0,
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`);

  console.log('Database tables initialized');
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/learning-paths', learningPathRoutes);
app.use('/api/user-metrics', userMetricsRoutes);

// Basic test route with logging
app.get('/api/test', (req, res) => {
  console.log('Test endpoint hit');
  res.json({ message: 'Backend is working!' });
});

// Error handling middleware with more details
app.use((err, req, res, next) => {
  console.error('Error details:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    headers: req.headers
  });
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: err.message
  });
});

// Start server with more detailed logging
const startServer = (port) => {
  try {
    const server = app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
      console.log(`Test the server at http://localhost:${port}/api/test`);
    });

    server.on('error', (err) => {
      console.error('Server error details:', {
        code: err.code,
        message: err.message,
        stack: err.stack
      });
      
      if (err.code === 'EADDRINUSE') {
        console.log(`Port ${port} is busy, trying ${port + 1}`);
        startServer(port + 1);
      } else {
        console.error('Server error:', err);
      }
    });

    server.on('listening', () => {
      const address = server.address();
      console.log('Server listening on:', address);
    });

  } catch (err) {
    console.error('Failed to start server:', err);
  }
};

startServer(PORT); 