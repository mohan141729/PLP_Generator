# Personalized Learning Path Generator

## Description

The Personalized Learning Path Generator is a web application that leverages the Google Gemini API to create dynamic, multi-level learning paths for any topic specified by the user. It features simulated user authentication, allowing users to generate, save (per 'user' in `localStorage`), and manage their learning journeys. Each path includes curated modules with resources and practical projects to enhance the learning experience.

## Features

*   **AI-Powered Path Generation:** Uses the Google Gemini API to generate comprehensive learning paths.
*   **Multi-Level Structure:** Paths are divided into Beginner, Intermediate, and Advanced levels.
*   **Detailed Modules:** Each level contains approximately 18 modules, each with:
    *   A concise title and description.
    *   A YouTube search query URL for relevant video tutorials.
    *   A GitHub link for related code repositories or topic pages.
*   **Integrated Projects:** Each level includes 4-5 practical projects with:
    *   A project title and description.
    *   A direct GitHub repository link to the project's source code.
*   **Simulated User Authentication:** Includes login and registration (data stored in `localStorage`).
*   **Persistent Storage:** Learning paths are saved in the browser's `localStorage`, scoped to the logged-in "user".
*   **Path Management:** Users can view their saved paths on a dashboard and delete them.
*   **Progress Tracking:**
    *   Mark modules as complete.
    *   Add personal notes to each module.
    *   Visualize overall path progress.
*   **User Metrics:** A dedicated page to display statistics like:
    *   Total paths created.
    *   Number of completed paths.
    *   Total and completed modules.
    *   Average completion rate.
*   **PDF Export:** Download the current learning path as a detailed PDF "Road Map".
*   **Responsive Design:** Adapts to various screen sizes for a seamless experience on desktop and mobile.
*   **Dark Mode:** Switch between light and dark themes for user comfort.

## How to Run / Setup

This application is designed to be run in an environment that can serve `index.html`, which then imports `index.tsx` as an ES6 module.

1.  **API Key Configuration:**
    *   This application requires a Google Gemini API key to function.
    *   The API key **must** be set as an environment variable named `API_KEY`.
    *   The application reads this key via `process.env.API_KEY`. Ensure your development/hosting environment makes this variable available to the frontend JavaScript.
    *   **Without a valid `API_KEY`, the learning path generation will fail.**

2.  **Serving the Application:**
    *   Serve the `index.html` file through any simple HTTP server. For example, using `npx serve .` in the project root.
    *   Open the served `index.html` in your browser.

## Technology Stack

*   **Frontend Library:** React (v19)
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS (v3)
*   **AI Model Integration:** Google Gemini API (`@google/genai` SDK)
*   **PDF Generation:** `jsPDF`, `html2canvas`
*   **State Management:** React Hooks (`useState`, `useEffect`, `useCallback`)
*   **Client-Side Storage:** Browser `localStorage`

## Key Components Overview

*   `App.tsx`: The main application component responsible for global state management, view routing, and orchestrating interactions between other components.
*   `services/geminiService.ts`: Handles all interactions with the Google Gemini API, including constructing prompts and parsing responses.
*   `services/authService.ts`: Manages the simulated user authentication (registration, login, logout, session state).
*   `components/LandingPage.tsx`: The initial page users see, prompting them to get started.
*   `components/AuthPage.tsx`: Handles the user login and registration forms.
*   `components/Dashboard.tsx`: Displays a list of the user's saved learning paths, allowing them to view or delete paths.
*   `components/LearningPathForm.tsx`: A simple form where users input the topic for which they want a learning path generated.
*   `components/LearningPathDisplay.tsx`: Renders the detailed structure of a generated or saved learning path, including levels, modules, and projects. Handles module completion, notes, and PDF export.
*   `components/ModuleCard.tsx`: Displays an individual module's details, including its title, description, resources, and completion status/notes.
*   `components/UserMetricsPage.tsx`: Shows statistics related to the user's learning activities.
*   `components/Navbar.tsx`: Provides navigation links, access to user actions (like logout), and a dark mode toggle.
*   `types.ts`: Contains TypeScript interface definitions for data structures used throughout the application (e.g., `LearningPath`, `Module`, `User`).
*   `constants.ts`: Stores application-wide constants like the Gemini model name and module count.

## Disclaimer

*   **AI-Generated Content:** The learning paths, module content, and resource links are generated by an AI model (Google Gemini). While designed to be helpful, the information should be verified for accuracy and suitability.
*   **Simulated Authentication:** The user authentication system is for demonstration purposes only. User data (including mock passwords) is stored in `localStorage` and is not secure for production use. No actual user data is transmitted to or stored on a server.
*   **Resource Links:** YouTube links are search queries, and GitHub links are AI-selected. Their relevance and quality may vary.

## Future Ideas

*   Integration with a real backend database for persistent user data and path storage.
*   More advanced path customization options (e.g., selecting preferred resource types, difficulty adjustments).
*   Ability to share learning paths with others.
*   Reminders or notifications for learning goals.
*   More sophisticated analytics and recommendations.
*   Integration of interactive quizzes or coding exercises.
