import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Backend server URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Handle 401 Unauthorized
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
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
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      return user;
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
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      return user;
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

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
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
};

// Test endpoint
export const testService = {
  testConnection: () => 
    api.get('/test'),
};

export default api; 