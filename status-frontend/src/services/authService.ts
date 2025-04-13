import { User } from '../types/user';
import { RegisterData } from '../context/AuthContext';
import axiosInstance from './axiosConfig';

// Auth service functions
export const authService = {
  // Register user
  async register(data: RegisterData): Promise<{ user: User; token: string }> {
    try {
      const response = await axiosInstance.post('/auth/register', data);
      return response.data;
    } catch (error) {
      console.error('Registration error details:', error);
      throw error;
    }
  },

  // Login user
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    try {
      const response = await axiosInstance.post('/auth/login', { email, password });
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  // Get current user
  async getCurrentUser(): Promise<User> {
    try {
      const response = await axiosInstance.get('/auth/me');
      return response.data.user;
    } catch (error) {
      console.error('Get current user error:', error);
      throw error;
    }
  }
};
