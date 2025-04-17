import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { toast } from '../hooks/use-toast';

// Debug flag for development mode
const DEBUG = process.env.NODE_ENV === 'development';

// Configure the API URL
// Default to 8080 port for backend as that's the standard port used in your project
const DEFAULT_API_URL = 'http://localhost:8080/api';
const API_URL = (process.env.REACT_APP_API_URL || DEFAULT_API_URL).replace(/\/+$/, '');

// Log configuration in development
if (DEBUG) {
  console.log('API Configuration:', {
    apiUrl: API_URL,
    environment: process.env.NODE_ENV,
    debug: DEBUG
  });
}

// Create axios instance with base URL
export const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 30000, // 30 seconds timeout
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

// Extended health check with improved retry logic and multiple backend ports
export const checkApiHealth = async (): Promise<boolean> => {
  try {
    // Create a temporary axios instance without the /api base URL to avoid path duplication
    const apiHost = API_URL.split('/api')[0];
    
    if (DEBUG) console.log(`Checking API health using base URL: ${apiHost}`);
    
    const healthCheckAxios = axios.create({
      timeout: 5000
    });
    
    // Try multiple backend port combinations in case the default port isn't working
    const possibleHosts = [
      apiHost,                          // Default configured host
      'http://localhost:8080',          // Standard backend port
      'http://localhost:3001',          // Alternative port
      'http://127.0.0.1:8080',          // Try with IP instead of localhost
      'http://127.0.0.1:3001'           // Try with IP instead of localhost
    ];
    
    // Try endpoints on each possible host
    for (const host of possibleHosts) {
      for (const endpoint of ['/health', '/api/health', '/']) {
        try {
          const url = `${host}${endpoint}`;
          if (DEBUG) console.log(`Attempting health check at: ${url}`);
          
          const response = await healthCheckAxios.get(url, { timeout: 3000 });
          
          if (response.status === 200) {
            if (DEBUG) console.log(`Health check succeeded on ${url}`);
            
            // If we found a working API but it's different from our configured one,
            // log this information for debugging purposes
            if (host !== apiHost) {
              console.log(`API found at ${host}, which differs from configured URL ${apiHost}`);
            }
            
            return true;
          }
        } catch (err) {
          if (DEBUG) console.log(`Health check failed on ${host}${endpoint}:`, err);
          // Continue to next endpoint
        }
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
