import { useState, useEffect } from 'react';
import { checkApiHealth } from '../services/axiosConfig';
import { toast } from './use-toast';

export function useApiHealth() {
  const [isApiAvailable, setIsApiAvailable] = useState<boolean>(true);
  const [isChecking, setIsChecking] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;
    let retryTimeout: NodeJS.Timeout;
    let retryCount = 0;
    const maxRetries = 3;

    const checkHealth = async () => {
      if (!mounted) return;
      
      setIsChecking(true);
      const isHealthy = await checkApiHealth();
      
      if (!mounted) return;
      
      setIsApiAvailable(isHealthy);
      setIsChecking(false);
      
      if (!isHealthy) {
        if (retryCount < maxRetries) {
          retryCount++;
          console.log(`API unavailable, retrying (${retryCount}/${maxRetries})...`);
          retryTimeout = setTimeout(checkHealth, 3000 * retryCount);
        } else if (retryCount === maxRetries) {
          // Final retry failed, show a more permanent error
          toast({
            title: 'API Server Unavailable',
            description: 'Could not connect to the API server. Please ensure the backend server is running.',
            variant: 'destructive',
            duration: 10000,
          });
        }
      } else if (retryCount > 0) {
        // We were retrying and now it's available
        toast({
          title: 'Connected to API',
          description: 'Successfully connected to the API server.',
          variant: 'default',
        });
        retryCount = 0;
      }
    };

    checkHealth();

    return () => {
      mounted = false;
      if (retryTimeout) clearTimeout(retryTimeout);
    };
  }, []);

  return { isApiAvailable, isChecking };
}
