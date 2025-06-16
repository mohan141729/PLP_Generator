#  Personalized Learning Path Generator

PLP generator is a full-stack web application that helps users create personalized learning paths for any topic using AI. The application consists of a React frontend and a Node.js backend.

## Project Overview

PLP Generator uses the Google Gemini API to generate comprehensive, multi-level learning paths tailored to users' needs. Each learning path includes:
- Beginner, Intermediate, and Advanced levels
- Curated modules with learning resources
- Practical projects
- Progress tracking
- User metrics and analytics

## Project Structure

The project is divided into two main directories:

- `frontend/` - React TypeScript application with Tailwind CSS
- `backend/` - Node.js Express server with SQLite database

## Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Google Gemini API key

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Set up your Google Gemini API key as an environment variable named `API_KEY`

4. Start the development server:
```bash
npm start
```

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file with necessary configuration

4. Start the development server:
```bash
npm run dev
```

The backend server will run on port 5000 by default.

## Detailed Documentation

For more detailed information about each component:

- [Frontend Documentation](./frontend/README.md)
- [Backend Documentation](./backend/README.md)

## Features

- 🤖 AI-powered learning path generation
- 📚 Multi-level learning structure
- 🎯 Practical projects and resources
- 📊 Progress tracking and analytics
- 💾 Path saving and management
- 📱 Responsive design
- 🌓 Dark mode support
- 📄 PDF export functionality

## Technology Stack

### Frontend
- React (v19)
- TypeScript
- Tailwind CSS
- Google Gemini API
- jsPDF for PDF generation

### Backend
- Node.js
- Express
- SQLite
- CORS enabled for development

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Disclaimer

- The learning paths and resources are AI-generated and should be verified for accuracy
- The current authentication system is for demonstration purposes only
- Resource links (YouTube, GitHub) are AI-selected and may vary in quality
