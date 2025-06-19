export interface Resource {
  type: 'youtube' | 'github' | 'article' | 'other';
  title: string;
  url: string;
}

export interface Module {
  id?: number; // Database ID from backend
  title: string;
  description: string;
  youtubeUrl?: string;
  githubUrl?: string;
  isCompleted: boolean; // Added for tracking completion
  notes?: string; // Added for user notes
  orderIndex?: number; // Database order index
  // Potentially other resources in the future
  // resources: Resource[];
}

export interface Project {
  id?: number; // Database ID from backend
  title: string;
  description: string;
  githubUrl: string;
  orderIndex?: number; // Database order index
}

export interface Level {
  id?: number; // Database ID from backend
  name: string; // e.g., Beginner, Intermediate, Advanced
  modules: Module[];
  projects: Project[]; // Added for projects
  orderIndex?: number; // Database order index
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
  total_paths: number;
  completed_paths: number;
  total_modules: number;
  completed_modules: number;
  average_completion_rate: number; // Percentage
  last_updated?: string;
  // Additional dynamic metrics
  recentActivity?: {
    lastCompletedModule?: string;
    lastCompletedPath?: string;
    streakDays?: number;
  };
  progressByLevel?: {
    beginner: { total: number; completed: number };
    intermediate: { total: number; completed: number };
    advanced: { total: number; completed: number };
  };
  // Potentially more metrics like active streaks, favorite topics based on completion, etc.
}

// Individual Learning Path Metrics
export interface PathLevelMetrics {
  level_name: string;
  total_modules: number;
  completed_modules: number;
  completion_rate: number;
}

export interface LearningPathMetrics {
  id: string;
  topic: string;
  created_at: string;
  total_levels: number;
  total_modules: number;
  completed_modules: number;
  completion_rate: number;
  is_completed: boolean;
  levels: PathLevelMetrics[];
  lastActivity?: string | null;
}

// Utility functions to handle backend data normalization
export const normalizeBackendData = {
  // Transform snake_case to camelCase
  toCamelCase: (obj: any): any => {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }
    
    if (Array.isArray(obj)) {
      return obj.map(normalizeBackendData.toCamelCase);
    }
    
    const transformed: any = {};
    for (const [key, value] of Object.entries(obj)) {
      const camelKey = key.replace(/_([a-z])/g, (_match, letter) => letter.toUpperCase());
      transformed[camelKey] = normalizeBackendData.toCamelCase(value);
    }
    return transformed;
  },

  // Normalize a learning path from backend format
  learningPath: (path: any): LearningPath => {
    const normalized = normalizeBackendData.toCamelCase(path);
    return {
      id: normalized.id?.toString() || '',
      topic: normalized.topic || '',
      createdAt: normalized.createdAt || new Date().toISOString(),
      levels: normalized.levels || []
    };
  },

  // Normalize a module from backend format
  module: (module: any): Module => {
    const normalized = normalizeBackendData.toCamelCase(module);
    return {
      id: normalized.id,
      title: normalized.title || '',
      description: normalized.description || '',
      youtubeUrl: normalized.youtubeUrl,
      githubUrl: normalized.githubUrl,
      isCompleted: Boolean(normalized.isCompleted),
      notes: normalized.notes,
      orderIndex: normalized.orderIndex
    };
  },

  // Normalize a project from backend format
  project: (project: any): Project => {
    const normalized = normalizeBackendData.toCamelCase(project);
    return {
      id: normalized.id,
      title: normalized.title || '',
      description: normalized.description || '',
      githubUrl: normalized.githubUrl || '',
      orderIndex: normalized.orderIndex
    };
  },

  // Normalize a level from backend format
  level: (level: any): Level => {
    const normalized = normalizeBackendData.toCamelCase(level);
    return {
      id: normalized.id,
      name: normalized.name || '',
      modules: (normalized.modules || []).map(normalizeBackendData.module),
      projects: (normalized.projects || []).map(normalizeBackendData.project),
      orderIndex: normalized.orderIndex
    };
  }
};