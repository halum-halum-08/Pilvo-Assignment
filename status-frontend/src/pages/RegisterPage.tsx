import React from 'react';
import RegisterForm from '../components/auth/RegisterForm';
import { ModeToggle } from '../components/ui/mode-toggle';

const RegisterPage: React.FC = () => {
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
              Create your account to get started
            </p>
          </div>
          
          <RegisterForm />
        </div>
      </div>
      
      <footer className="py-6 text-center text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} Status Page. All rights reserved.
      </footer>
    </div>
  );
};

export default RegisterPage;
