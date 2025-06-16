# Trae Backend

This is the backend server for the Trae application, built with Node.js, Express, and SQLite.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory (already created with basic configuration)

3. Start the development server:
```bash
npm run dev
```

The server will start on port 5000 by default.

## Project Structure

- `server.js` - Main application file
- `db/` - Database files and migrations
- `routes/` - API route definitions
- `models/` - Database models
- `.env` - Environment variables

## API Endpoints

- `GET /api/test` - Test endpoint to verify the server is running
- More endpoints will be added as needed

## Development

- The server uses nodemon for development, which automatically restarts when files change
- SQLite database is stored in `db/database.sqlite`
- CORS is enabled for development purposes 