import React from 'react';
import LoginForm from '../components/auth/LoginForm';
import { ModeToggle } from '../components/ui/mode-toggle';

const LoginPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="absolute top-4 right-4">
        <ModeToggle />
      </div>
      
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold">Status Page</h1>
            <p className="text-muted-foreground mt-2">
              Monitor and communicate service status
            </p>
          </div>
          
          <LoginForm />
        </div>
      </div>
      
      <footer className="py-6 text-center text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} Status Page. All rights reserved.
      </footer>
    </div>
  );
};

export default LoginPage;
