import React from 'react';
import { useAuth } from '../hooks/useAuth';
import UserAccountNav from '../components/auth/UserAccountNav';
import { ModeToggle } from '../components/ui/mode-toggle';
import { Button } from '../components/ui/button';
import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from '../hooks/use-toast';

const DashboardPage: React.FC = () => {
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
            <h2 className="text-lg font-bold">Status Page</h2>
          </div>
          
          <div className="flex items-center gap-4">
            <ModeToggle />
            <UserAccountNav />
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout}
              className="hidden sm:flex items-center"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>
      
      <main className="flex-1 container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Welcome back, {user?.name}!
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border rounded-lg p-6 bg-card">
            <h2 className="text-lg font-medium mb-4">Service Status</h2>
            <p className="text-muted-foreground">
              View and manage your service status here.
            </p>
          </div>
          
          <div className="border rounded-lg p-6 bg-card">
            <h2 className="text-lg font-medium mb-4">Recent Incidents</h2>
            <p className="text-muted-foreground">
              View and manage your incidents here.
            </p>
          </div>
        </div>
      </main>
      
      <footer className="border-t py-6">
        <div className="container text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Status Page. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default DashboardPage;
