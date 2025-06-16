
import { User } from '../types';

const AUTH_TOKEN_KEY = 'learningPathsApp_authToken';
const USER_INFO_KEY = 'learningPathsApp_userInfo';
const MOCK_USERS_DB_KEY = 'learningPathsApp_mockUsersDB';

interface MockUserRecord extends User {
  mockPassword?: string;
}

const getMockUsers = (): MockUserRecord[] => {
  try {
    const db = localStorage.getItem(MOCK_USERS_DB_KEY);
    return db ? JSON.parse(db) : [];
  } catch (e) {
    console.warn("Could not read mock users DB from localStorage.", e);
    return [];
  }
};

const saveMockUsers = (users: MockUserRecord[]): void => {
  try {
    localStorage.setItem(MOCK_USERS_DB_KEY, JSON.stringify(users));
  } catch (e) {
    console.warn("Could not save mock users DB to localStorage.", e);
    throw new Error("Failed to save user account. Your browser's local storage might be disabled, full, or in a restricted mode (e.g., private browsing).");
  }
};

// Internal function to set current session
const setSession = (user: User): User => {
  const cleanUser: User = { id: user.id, email: user.email }; // Ensure no password in session user info
  try {
    localStorage.setItem(AUTH_TOKEN_KEY, `mock_token_${user.id}`);
    localStorage.setItem(USER_INFO_KEY, JSON.stringify(cleanUser));
  } catch (e) {
    console.warn("Could not save auth info to localStorage. Private browsing or storage limit?", e);
    throw new Error("Failed to save session. Your browser's local storage might be disabled, full, or in a restricted mode (e.g., private browsing).");
  }
  return cleanUser;
};

export const register = (email: string, password?: string): User => {
  if (!email || !password) {
    throw new Error('Email and password are required for registration.');
  }
  if (!/\S+@\S+\.\S+/.test(email)) {
    throw new Error('Please enter a valid email address.');
  }
  if (password.length < 6) { // Simple password policy for demo
    throw new Error('Password must be at least 6 characters long.');
  }

  const users = getMockUsers();
  if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
    throw new Error('Email already registered. Please login or use a different email.');
  }

  const newUser: MockUserRecord = {
    id: `user_${new Date().getTime()}`,
    email: email,
    mockPassword: password, // Store password for mock check
  };

  const updatedUsers = [...users, newUser];
  saveMockUsers(updatedUsers); // This can now throw if localStorage fails

  // Automatically log in after registration
  return setSession(newUser); // This can now throw if localStorage fails
};

export const login = (email: string, password?: string): User => {
  if (!email || !password) {
    throw new Error('Email and password are required.');
  }

  const users = getMockUsers();
  const foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());

  if (!foundUser) {
    throw new Error('User not found. Please check your email or register.');
  }

  // Simulate password check
  if (foundUser.mockPassword !== password) {
    throw new Error('Invalid password. Please try again.');
  }

  return setSession(foundUser); // This can now throw if localStorage fails
};

export const logout = (): void => {
  try {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(USER_INFO_KEY);
  } catch (e) {
    console.warn("Could not remove auth info from localStorage. This might happen in some private browsing modes.", e);
    // Not throwing an error here as logout should ideally always complete on the client-side state
    // even if localStorage removal fails. The main impact would be session not being cleared in storage.
  }
};

export const isAuthenticated = (): boolean => {
  try {
    return !!localStorage.getItem(AUTH_TOKEN_KEY);
  } catch (e) {
    // If localStorage cannot be accessed (e.g. some strict browser settings), assume not authenticated.
    console.warn("Could not access localStorage to check authentication status.", e);
    return false; 
  }
};

export const getCurrentUser = (): User | null => {
  try {
    const userInfo = localStorage.getItem(USER_INFO_KEY);
    return userInfo ? JSON.parse(userInfo) : null;
  } catch (e) {
     // If localStorage cannot be accessed or JSON is malformed
    console.warn("Could not access localStorage or parse user info.", e);
    return null; 
  }
};
