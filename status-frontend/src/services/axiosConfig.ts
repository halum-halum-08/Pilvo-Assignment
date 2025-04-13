import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { toast } from '../hooks/use-toast';

// Debug flag
const DEBUG = process.env.REACT_APP_DEBUG === 'true';

// Create axios instance with base URL
// Ensure no trailing slash in the API_URL to avoid URL path issues
const API_URL = (process.env.REACT_APP_API_URL || 'http://localhost:3001/api').replace(/\/+$/, '');

if (DEBUG) {
  console.log('API Config:', {
    apiUrl: API_URL,
    environment: process.env.NODE_ENV,
    debug: DEBUG
  });
}

export const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 30000, // 30 seconds timeout - increase for development
  withCredentials: false // Set to true if you're using cookies for auth
});

// Add token to requests if available
axiosInstance.interceptors.request.use(
  (config) => {
    if (DEBUG) {
      console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    }
    
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Type for API error response
interface ApiErrorResponse {
  message?: string;
  error?: string;
  statusCode?: number;
}

// Handle response errors globally
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    if (DEBUG) {
      console.log(`✅ API Response: ${response.status} from ${response.config.url}`);
    }
    return response;
  },
  async (error: AxiosError<ApiErrorResponse>) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
    
    // Network error - provide more helpful message
    if (error.message === 'Network Error') {
      console.error('Network Error Details:', {
        baseURL: originalRequest?.baseURL || API_URL,
        url: originalRequest?.url,
        method: originalRequest?.method
      });
      
      toast({
        title: 'Connection Error',
        description: 'Unable to connect to the API server. Please ensure the backend server is running at ' + API_URL,
        variant: 'destructive',
        duration: 5000,
      });
      return Promise.reject(error);
    }
    
    // Handle authentication errors (401)
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Handle token refresh here if needed
      // For now, just log out the user if their token is invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
      return Promise.reject(error);
    }
    
    // Server errors (5xx)
    if (error.response?.status && error.response.status >= 500) {
      toast({
        title: 'Server Error',
        description: 'Our server is experiencing issues. Please try again later.',
        variant: 'destructive',
      });
      return Promise.reject(error);
    }
    
    // Other client errors
    if (error.response?.data?.message) {
      // Show specific error message from the API
      toast({
        title: 'Error',
        description: error.response.data.message,
        variant: 'destructive',
      });
    } else if (error.response?.status === 404) {
      toast({
        title: 'Not Found',
        description: 'The requested resource was not found.',
        variant: 'destructive',
      });
    }
    
    return Promise.reject(error);
  }
);

// Extended health check with retry logic and more detailed errors
export const checkApiHealth = async (): Promise<boolean> => {
  try {
    // Create a temporary axios instance without the /api base URL to avoid path duplication
    const healthCheckAxios = axios.create({
      baseURL: 'http://localhost:3001',
      timeout: 5000
    });
    
    // Try multiple health check endpoints in case one is available
    for (const endpoint of ['/health', '/api/health', '/']) {
      try {
        await healthCheckAxios.get(endpoint);
        if (DEBUG) console.log(`Health check succeeded on ${endpoint}`);
        return true;
      } catch (err) {
        if (DEBUG) console.log(`Health check failed on ${endpoint}:`, err);
        // Continue to next endpoint
      }
    }
    // If we get here, all endpoints failed
    console.error('All API health checks failed');
    return false;
  } catch (error) {
    console.error('API Health Check Exception:', error);
    return false;
  }
};

export default axiosInstance;
