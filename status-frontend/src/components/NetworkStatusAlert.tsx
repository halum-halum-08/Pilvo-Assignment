import React, { useEffect } from 'react';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { toast } from '../hooks/use-toast';
import { AlertTriangle, Wifi, WifiOff } from 'lucide-react';

export const NetworkStatusAlert: React.FC = () => {
  const { isOnline, wasOffline } = useNetworkStatus();

  useEffect(() => {
    // Show toast when connection status changes
    if (!isOnline) {
      toast({
        title: 'You are offline',
        description: 'Please check your internet connection',
        variant: 'destructive',
        // Remove the icon property since it's not supported
        duration: Infinity, // Stay until connection is restored
      });
    } else if (wasOffline) {
      toast({
        title: 'Back online',
        description: 'Your internet connection has been restored',
        variant: 'default',
        // Remove the icon property since it's not supported
      });
    }
  }, [isOnline, wasOffline]);

  // Render an offline indicator when user is offline
  if (!isOnline) {
    return (
      <div className="fixed bottom-4 right-4 z-50 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 px-4 py-2 rounded-md flex items-center space-x-2 shadow-lg">
        <AlertTriangle className="h-4 w-4" />
        <span className="text-sm font-medium">You are offline</span>
      </div>
    );
  }

  return null;
};
