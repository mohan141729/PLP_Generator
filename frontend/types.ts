
export interface Resource {
  type: 'youtube' | 'github' | 'article' | 'other';
  title: string;
  url: string;
}

export interface Module {
  title:string;
  description: string;
  youtubeUrl?: string;
  githubUrl?: string;
  isCompleted: boolean; // Added for tracking completion
  notes?: string; // Added for user notes
  // Potentially other resources in the future
  // resources: Resource[];
}

export interface Project {
  title: string;
  description: string;
  githubUrl: string;
}

export interface Level {
  name: string; // e.g., Beginner, Intermediate, Advanced
  modules: Module[];
  projects: Project[]; // Added for projects
}

export interface LearningPath {
  id: string; // Unique ID for the path
  topic: string;
  levels: Level[];
  createdAt: string; // ISO date string
  // Add any other metadata if needed, e.g., generatedBy (model version)
}

// For the form
export interface LearningPathCreationRequest {
  topic: string;
  // Potentially add other user preferences here later
}

// Gemini specific response structure (internal, to be mapped to LearningPath)
export interface GeminiModuleResponse {
  title: string;
  description: string;
  youtubeUrl: string; // Expecting direct URLs from Gemini as per prompt
  githubUrl: string;
}

export interface GeminiProjectResponse {
  title: string;
  description: string;
  githubUrl: string;
}

export interface GeminiLevelResponse {
  name: string;
  modules: GeminiModuleResponse[];
  projects: GeminiProjectResponse[]; // Added for projects
}

export interface GeminiLearningPathResponse {
  topic: string;
  levels: GeminiLevelResponse[];
}

export interface GroundingChunkWeb {
  uri: string;
  title: string;
}
export interface GroundingChunk {
  web?: GroundingChunkWeb;
  // other types of chunks could be defined here
}

export interface GroundingMetadata {
  groundingChunks?: GroundingChunk[];
  // other grounding metadata fields
}

export interface Candidate {
  groundingMetadata?: GroundingMetadata;
  // other candidate fields
}

export interface GeminiApiResponse {
  text: string; // This will contain the JSON string
  candidates?: Candidate[];
  // Potentially other fields depending on the specific API call and response structure
}

// User type for authentication
export interface User {
  id: string;
  email: string; // Or username
  // Add other user-specific fields if needed
}

// User Metrics
export interface UserMetrics {
  totalPaths: number;
  completedPaths: number;
  totalModules: number;
  completedModules: number;
  averageCompletionRate: number; // Percentage
  // Potentially more metrics like active streaks, favorite topics based on completion, etc.
}