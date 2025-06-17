import { User } from '../types';
import * as api from './api';

export const register = async (email: string, password?: string): Promise<User> => {
  if (!email || !password) {
    throw new Error('Email and password are required for registration.');
  }
  if (!/\S+@\S+\.\S+/.test(email)) {
    throw new Error('Please enter a valid email address.');
  }
  if (password.length < 6) { // Simple password policy for demo
    throw new Error('Password must be at least 6 characters long.');
  }

  try {
    const user = await api.authService.register(email, password);
    return user;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Registration failed. Please try again.');
  }
};

export const login = async (email: string, password?: string): Promise<User> => {
  if (!email || !password) {
    throw new Error('Email and password are required.');
  }

  try {
    const user = await api.authService.login(email, password);
    return user;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Login failed. Please try again.');
  }
};

export const logout = async (): Promise<void> => {
  try {
    await api.authService.logout();
  } catch (error) {
    console.error('Logout error:', error);
    // Don't throw error on logout failure
  }
};

export const isAuthenticated = async (): Promise<boolean> => {
  try {
    await api.authService.getCurrentUser();
    return true;
  } catch (error) {
    return false;
  }
};

export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const user = await api.authService.getCurrentUser();
    return user;
  } catch (error: any) {
    // If it's a 401 error, user is not authenticated - return null
    if (error.response && error.response.status === 401) {
      return null;
    }
    // For other errors, log but still return null
    console.error('Error getting current user:', error);
    return null;
  }
};
