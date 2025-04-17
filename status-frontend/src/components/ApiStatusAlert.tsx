import React from 'react';
import { useApiHealth } from '../hooks/useApiHealth';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { XCircle } from 'lucide-react';
import { Button } from './ui/button';

export function ApiStatusAlert() {
  const { isApiAvailable, isChecking } = useApiHealth();

  // Don't show anything while initial check is happening
  if (isChecking) return null;

  // Only show when API is unavailable
  if (isApiAvailable) return null;

  const openBackendStartupGuide = () => {
    // Open a pop-up with instructions to start the backend
    const instructions = `
To start the backend server:

1. Open a terminal/command prompt
2. Navigate to your backend directory:
   cd c:\\Pilvo Assignment\\status-backend

3. Install dependencies (if not already done):
   npm install

4. Start the server:
   npm run dev

If you still encounter issues, try these solutions:
- Make sure port 8080 is not in use by another application
- Check if the DATABASE_URL in .env is correct
- Run the db setup script: node scripts/init-db.js
    `;
    alert(instructions);
  };

  return (
    <Alert variant="destructive" className="fixed bottom-4 right-4 max-w-md z-50 animate-in fade-in duration-300">
      <XCircle className="h-4 w-4" />
      <AlertTitle>API Server Unavailable</AlertTitle>
      <AlertDescription className="mt-2">
        <p>The API server is not responding. Please make sure the backend server is running on port 8080.</p>
        <div className="flex mt-3 gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={openBackendStartupGuide}
          >
            Show Setup Guide
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            onClick={() => window.location.reload()}
          >
            Refresh Page
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}
