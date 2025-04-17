import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ModeToggle } from '../ui/mode-toggle';
import { Button } from '../ui/button';
import {
  LayoutGrid,
  Server,
  AlertCircle,
  Clock,
  Users,
  Settings,
  LogOut
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import UserAccountNav from '../auth/UserAccountNav';
import { toast } from '../../hooks/use-toast';

const DashboardLayout: React.FC = () => {
  const { logout } = useAuth(); // Removed unused 'user' variable
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
    navigate('/login');
  };

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutGrid className="h-5 w-5" /> },
    { name: 'Services', path: '/dashboard/services', icon: <Server className="h-5 w-5" /> },
    { name: 'Incidents', path: '/dashboard/incidents', icon: <AlertCircle className="h-5 w-5" /> },
    { name: 'Maintenance', path: '/dashboard/maintenance', icon: <Clock className="h-5 w-5" /> },
    { name: 'Teams', path: '/dashboard/teams', icon: <Users className="h-5 w-5" /> },
    { name: 'Settings', path: '/dashboard/settings', icon: <Settings className="h-5 w-5" /> },
  ];

  return (
    <div className="min-h-screen flex bg-muted/20">
      {/* Sidebar */}
      <div className="hidden lg:flex flex-col w-64 bg-card border-r">
        <div className="p-4 border-b flex items-center space-x-2">
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold">S</span>
          </div>
          <span className="font-bold text-lg">Status Admin</span>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="px-2 space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                {item.icon}
                <span className="ml-3">{item.name}</span>
              </Link>
            ))}
          </nav>
        </div>
        
        <div className="p-4 border-t">
          <Button 
            variant="outline" 
            className="w-full justify-start text-destructive" 
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5 mr-2" />
            Log out
          </Button>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <header className="bg-card border-b">
          <div className="flex h-16 items-center px-4 justify-between">
            <div className="lg:hidden">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-bold">S</span>
                </div>
                <span className="font-bold">Status Admin</span>
              </div>
            </div>
            
            <div className="flex items-center ml-auto space-x-4">
              <ModeToggle />
              <UserAccountNav />
            </div>
          </div>
        </header>
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
