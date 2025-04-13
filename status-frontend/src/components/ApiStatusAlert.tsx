import React from 'react';
import { useApiHealth } from '../hooks/useApiHealth';
import { AlertTriangle, ServerOff, Loader2 } from 'lucide-react';

export const ApiStatusAlert: React.FC = () => {
  const { isApiAvailable, isChecking } = useApiHealth();

  if (isChecking) {
    return (
      <div className="fixed bottom-4 left-4 z-50 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 px-4 py-2 rounded-md flex items-center space-x-2 shadow-lg">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm font-medium">Connecting to API...</span>
      </div>
    );
  }

  if (!isApiAvailable) {
    return (
      <div className="fixed bottom-4 left-4 z-50 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 px-4 py-2 rounded-md flex items-center space-x-2 shadow-lg">
        <ServerOff className="h-4 w-4" />
        <div>
          <span className="text-sm font-medium">API server unavailable</span>
          <p className="text-xs mt-1">Please ensure the backend server is running</p>
        </div>
      </div>
    );
  }

  return null;
};
