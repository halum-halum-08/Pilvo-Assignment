import { useState, useEffect, useCallback } from 'react';
import { useSocket } from './useSocket';
import { Service } from '../types/service';
import { serviceStatusService } from '../services/serviceStatusService';
import { toast } from './use-toast';
import { useApiHealth } from './useApiHealth';
import axiosInstance from '../services/axiosConfig';

export const useServiceStatus = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { onServiceStatusChanged, onServiceCreated, onServiceUpdated, onServiceDeleted } = useSocket();
  const { isApiAvailable } = useApiHealth();

  const fetchServices = useCallback(async () => {
    // Don't try to fetch if API is known to be unavailable
    if (!isApiAvailable) {
      setLoading(false);
      setError(new Error('API server is unavailable'));
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Use the axiosInstance which now has the correct API_URL (port 8080)
      const response = await axiosInstance.get('/services');
      setServices(response.data);
    } catch (err) {
      console.error('Error fetching services:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch services'));
      
      // Show toast only if it's not a network error (handled by NetworkStatusAlert)
      if ((err as Error).message !== 'Network Error') {
        toast({
          title: 'Error',
          description: 'Could not load services. Please try again.',
          variant: 'destructive',
        });
      }
      
      // Use mock data in development for a better development experience
      if (process.env.NODE_ENV === 'development') {
        console.log('Using mock service data for development');
        setServices([
          { id: 1, name: 'API Service', description: 'Core API Service', status: 'Operational', teamId: 1, uptime: 99.9, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: 2, name: 'Website', description: 'Main website', status: 'Degraded Performance', teamId: 1, uptime: 95.5, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: 3, name: 'Database', description: 'Primary database', status: 'Operational', teamId: 1, uptime: 99.5, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        ]);
      }
    } finally {
      setLoading(false);
    }
  }, [isApiAvailable]);

  const updateServiceStatus = useCallback(async (serviceId: number, status: string) => {
    try {
      await serviceStatusService.updateServiceStatus(serviceId, status);
      // The socket update will handle updating the UI
    } catch (err) {
      console.error('Error updating service status:', err);
      toast({
        title: 'Error',
        description: 'Failed to update service status',
        variant: 'destructive',
      });
    }
  }, []);

  useEffect(() => {
    fetchServices();
    
    // Socket event handlers
    const unsubscribeStatusChanged = onServiceStatusChanged(({ serviceId, status }) => {
      setServices(prev => prev.map(service => 
        service.id === serviceId ? { ...service, status } : service
      ));
    });
    
    const unsubscribeCreated = onServiceCreated((service) => {
      setServices(prev => [...prev, service]);
    });
    
    const unsubscribeUpdated = onServiceUpdated((updatedService) => {
      setServices(prev => prev.map(service => 
        service.id === updatedService.id ? updatedService : service
      ));
    });
    
    const unsubscribeDeleted = onServiceDeleted(({ id }) => {
      setServices(prev => prev.filter(service => service.id !== id));
    });
    
    return () => {
      unsubscribeStatusChanged();
      unsubscribeCreated();
      unsubscribeUpdated();
      unsubscribeDeleted();
    };
  }, [fetchServices, onServiceStatusChanged, onServiceCreated, onServiceUpdated, onServiceDeleted]);

  return { services, loading, error, fetchServices, updateServiceStatus };
};
