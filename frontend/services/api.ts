import axios from 'axios';

// Create axios instance with default config
const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
console.log('API Base URL:', baseURL);

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true // Enable cookies to be sent with requests
});

// Response interceptor for handling common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Don't automatically redirect on 401 - let components handle it
      console.error('API Error:', error.response.data);
      throw new Error(error.response.data.message || 'An error occurred');
    } else if (error.request) {
      console.error('No response received:', error.request);
      throw new Error('No response from server. Please check your connection.');
    } else {
      console.error('Request setup error:', error.message);
      throw new Error('Failed to make request. Please try again.');
    }
  }
);

// Auth endpoints
export const authService = {
  async register(email: string, password: string) {
    try {
      const response = await api.post('/auth/register', { email, password });
      return response.data.user;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('Registration failed. Please try again.');
    }
  },
  
  async login(email: string, password: string) {
    try {
      const response = await api.post('/auth/login', { email, password });
      return response.data.user;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('Login failed. Please check your credentials.');
    }
  },
  
  async getCurrentUser() {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      throw new Error('Failed to get user information.');
    }
  },

  async logout() {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }
};

// Learning paths endpoints
export const learningPathService = {
  getAllPaths: () => 
    api.get('/learning-paths'),
  
  getPath: (id: string) => 
    api.get(`/learning-paths/${id}`),
  
  createPath: (data: any) => 
    api.post('/learning-paths', data),
  
  updatePath: (id: string, data: any) => 
    api.put(`/learning-paths/${id}`, data),
  
  deletePath: (id: string) => 
    api.delete(`/learning-paths/${id}`),
  
  toggleModuleCompletion: (pathId: string, moduleId: string, isCompleted: boolean) => 
    api.patch(`/learning-paths/${pathId}/modules/${moduleId}/complete`, { isCompleted }),
  
  updateModuleNotes: (pathId: string, moduleId: string, notes: string) => 
    api.patch(`/learning-paths/${pathId}/modules/${moduleId}/notes`, { notes }),
};

// User metrics endpoints
export const userMetricsService = {
  getMetrics: () => 
    api.get('/user-metrics'),
  
  recalculateMetrics: () => 
    api.post('/user-metrics/recalculate'),
  
  getDetailedMetrics: () => 
    api.get('/user-metrics/detailed'),
  
  getActivityHistory: (limit?: number) => 
    api.get(`/user-metrics/activity${limit ? `?limit=${limit}` : ''}`),
  
  getPathMetrics: () => 
    api.get('/user-metrics/paths'),
};

// Test endpoint
export const testService = {
  testConnection: () => 
    api.get('/test'),
};

export default api; 