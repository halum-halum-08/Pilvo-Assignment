import React from 'react';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { WifiOff } from 'lucide-react';

export function NetworkStatusAlert() {
  const { isOnline } = useNetworkStatus();

  // Only show when offline
  if (isOnline) return null;

  return (
    <Alert variant="warning" className="fixed bottom-4 left-4 max-w-md z-50 animate-in fade-in duration-300">
      <WifiOff className="h-4 w-4" />
      <AlertTitle>Network Disconnected</AlertTitle>
      <AlertDescription>
        You are currently offline. Some features may be unavailable.
      </AlertDescription>
    </Alert>
  );
}
