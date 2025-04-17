import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { LogOut } from 'lucide-react';
import { toast } from '../hooks/use-toast';
import UserAccountNav from '../components/auth/UserAccountNav';

const StatusPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold">Status Overview</h2>
          </div>
          
          <div className="flex items-center gap-4">
            {user && <UserAccountNav />}
            {user && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLogout}
                className="hidden sm:flex items-center"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            )}
          </div>
        </div>
      </header>
      
      <main className="flex-1 container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">System Status</h1>
          <p className="text-muted-foreground mt-2">
            Current status of all services
          </p>
        </div>
        
        {/* Status content */}
        <div className="grid gap-4">
          {/* Status cards */}
        </div>
      </main>
    </div>
  );
};

export default StatusPage;