
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { GEMINI_API_MODEL_TEXT, MODULE_COUNT_PER_LEVEL } from '../constants';
import { GeminiLearningPathResponse, LearningPath, Level, Module, Project, GeminiLevelResponse, GeminiModuleResponse, GeminiProjectResponse } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // This check is mostly for local dev. In AI Studio, it's expected to be set.
  console.warn("API_KEY environment variable not found. Gemini API calls will fail.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY || "MISSING_API_KEY" }); // Provide a fallback for type safety if needed, though it will fail.

function constructPrompt(topic: string): string {
  return `
You are an expert learning path generator. Given a topic, create a comprehensive learning path with three levels: Beginner, Intermediate, and Advanced.
Each level must contain exactly ${MODULE_COUNT_PER_LEVEL} modules.
For each module, provide:
1. A concise module title (3-7 words).
2. A brief module description (1-2 sentences).
3. A YouTube link. For this, **you MUST provide a highly specific YouTube search query URL** that will lead the user to relevant videos for the module's topic. For example, if the module is about "Advanced JavaScript Closures", a good search query URL would be "https://www.youtube.com/results?search_query=advanced+javascript+closures+tutorial". **Do NOT provide direct links to YouTube channels or individual videos.** The link must be a YouTube search results page URL and provided in the "youtubeUrl" field.
4. One relevant GitHub repository link (e.g., for a project, library, or collection of resources related to the module topic). If no specific repository fits, provide a link to a relevant GitHub topic page (e.g., https://github.com/topics/react).

Additionally, for each level (Beginner, Intermediate, Advanced), provide 4 to 5 distinct projects.
For each project, provide:
1. A concise project title (3-7 words).
2. A brief project description (2-3 sentences) explaining what the project is about and its learning objectives.
3. A direct GitHub repository link that contains the source code for the project. This should be a link to an actual code repository, not a general GitHub topic page or user profile.

The topic is: "${topic}"

Please provide the output STRICTLY in the following JSON format. Do not include any explanatory text, markdown code fences, or comments before or after the JSON block. The entire response should be only the JSON object.

{
  "topic": "${topic}",
  "levels": [
    {
      "name": "Beginner",
      "modules": [
        {
          "title": "Module Title Example",
          "description": "Module description example.",
          "youtubeUrl": "https://www.youtube.com/results?search_query=example+search",
          "githubUrl": "https://github.com/example/repo"
        }
        // ... ${MODULE_COUNT_PER_LEVEL - 1} more modules for Beginner
      ],
      "projects": [
        {
          "title": "Beginner Project Example",
          "description": "A simple project to practice basic concepts.",
          "githubUrl": "https://github.com/example/beginner-project-source-code"
        }
        // ... 3 to 4 more projects for Beginner
      ]
    },
    {
      "name": "Intermediate",
      "modules": [
        // ... ${MODULE_COUNT_PER_LEVEL} modules for Intermediate
      ],
      "projects": [
        // ... 4 to 5 projects for Intermediate
      ]
    },
    {
      "name": "Advanced",
      "modules": [
        // ... ${MODULE_COUNT_PER_LEVEL} modules for Advanced
      ],
      "projects": [
        // ... 4 to 5 projects for Advanced
      ]
    }
  ]
}
`;
}

export const generateLearningPath = async (topic: string): Promise<Omit<LearningPath, 'id' | 'createdAt'>> => {
  if (!API_KEY) {
    throw new Error("Gemini API Key is not configured. Please set the API_KEY environment variable.");
  }

  const prompt = constructPrompt(topic);

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_API_MODEL_TEXT,
      contents: prompt,
      config: {
        responseMimeType: "application/json", // Request JSON directly
        temperature: 0.4, // Slightly lower temperature for more deterministic/factual output, good for structured data.
      }
    });
    
    let jsonStr = response.text.trim();
    
    // Remove markdown fences if present (Gemini might still wrap it sometimes)
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim();
    }

    const parsedData = JSON.parse(jsonStr) as GeminiLearningPathResponse;

    // Validate structure (basic validation)
    if (!parsedData.topic || !parsedData.levels || !Array.isArray(parsedData.levels) || parsedData.levels.length !== 3) {
      throw new Error("Invalid format received from Gemini API. Expected topic and 3 levels.");
    }
    parsedData.levels.forEach((level: GeminiLevelResponse) => {
      if (!level.name ) {
        throw new Error(`Invalid level structure: level name is missing.`);
      }
      if (!level.modules || !Array.isArray(level.modules) ) { 
        console.warn(`Level "${level.name}" has missing modules array. Initializing as empty.`);
        level.modules = []; 
      }
      if (level.modules.length === 0) {
        console.warn(`Level "${level.name}" has empty modules. Expected ${MODULE_COUNT_PER_LEVEL} modules.`);
      }
       level.modules.forEach((module: GeminiModuleResponse, index: number) => {
        if (!module.title || !module.description) {
          console.warn(`Module ${index + 1} in level "${level.name}" might be missing title or description. Title: ${module.title}`);
        }
      });

      if (!level.projects || !Array.isArray(level.projects)) {
        console.warn(`Level "${level.name}" has missing projects array. Initializing as empty.`);
        level.projects = [];
      }
      if (level.projects.length === 0) {
          console.warn(`Level "${level.name}" has no projects. Expected 4-5 projects.`);
      }
      level.projects.forEach((project: GeminiProjectResponse, index: number) => {
        if (!project.title || !project.description || !project.githubUrl) {
            console.warn(`Project ${index + 1} in level "${level.name}" is missing title, description, or githubUrl. Title: ${project.title}`);
        }
      });
    });

    // Transform parsedData to match Omit<LearningPath, 'id' | 'createdAt'>
    const learningPathOutput: Omit<LearningPath, 'id' | 'createdAt'> = {
      topic: parsedData.topic,
      levels: parsedData.levels.map((level: GeminiLevelResponse): Level => ({
        name: level.name,
        modules: level.modules.map((module: GeminiModuleResponse): Module => ({
          ...module, 
          isCompleted: false, 
          notes: '', 
        })),
        projects: (level.projects || []).map((project: GeminiProjectResponse): Project => ({
          title: project.title || "Untitled Project",
          description: project.description || "No description provided.",
          githubUrl: project.githubUrl || "#", // Default to '#' if missing to avoid errors
        }))
      }))
    };

    return learningPathOutput;

  } catch (error) {
    console.error("Error generating learning path with Gemini:", error);
    if (error instanceof Error && error.message.includes("JSON.parse")) {
        throw new Error("Failed to parse the response from Gemini API. The response was not valid JSON. Please try again or contact support if the issue persists.");
    }
    if (error instanceof Error && error.message.includes("MISSING_API_KEY")) {
        throw new Error("Gemini API Key is missing or invalid. Please ensure it is correctly configured.");
    }
    if (error instanceof Error) {
        // More generic API error
        throw new Error(`Gemini API Error: ${error.message}.`);
    }
    throw new Error("An unknown error occurred while generating the learning path.");
  }
};