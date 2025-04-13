import { Service } from '../types/service';
import axiosInstance from './axiosConfig';

interface ServiceResponse {
  services: Service[];
}

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// Helper for delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const serviceStatusService = {
  // Get all services with retry logic
  async getServices(retryCount = 0): Promise<Service[]> {
    try {
      const response = await axiosInstance.get<Service[]>('/services');
      return response.data;
    } catch (error: any) {
      // Retry on network errors and 5xx errors
      const isNetworkError = error.message === 'Network Error';
      const isServerError = error.response?.status && error.response.status >= 500;
      
      if ((isNetworkError || isServerError) && retryCount < MAX_RETRIES) {
        console.log(`Retrying getServices (${retryCount + 1}/${MAX_RETRIES})...`);
        await delay(RETRY_DELAY * (retryCount + 1)); // Exponential backoff
        return this.getServices(retryCount + 1);
      }
      
      // If all retries fail or it's a different type of error, throw it
      throw error;
    }
  },

  // Update service status
  async updateServiceStatus(serviceId: number, status: string): Promise<Service> {
    const response = await axiosInstance.put(`/services/${serviceId}`, { status });
    return response.data;
  },

  // Get service by ID with retry logic
  async getServiceById(serviceId: number, retryCount = 0): Promise<Service> {
    try {
      const response = await axiosInstance.get(`/services/${serviceId}`);
      return response.data;
    } catch (error: any) {
      // Retry on network errors and 5xx errors
      const isNetworkError = error.message === 'Network Error';
      const isServerError = error.response?.status && error.response.status >= 500;
      
      if ((isNetworkError || isServerError) && retryCount < MAX_RETRIES) {
        console.log(`Retrying getServiceById (${retryCount + 1}/${MAX_RETRIES})...`);
        await delay(RETRY_DELAY * (retryCount + 1));
        return this.getServiceById(serviceId, retryCount + 1);
      }
      
      throw error;
    }
  }
};
