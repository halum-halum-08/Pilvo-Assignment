import React from 'react';
import StatusOverview from '../../components/public/StatusOverview';
import ServiceStatusList from '../../components/public/ServiceStatusList';
import ActiveIncidentsList from '../../components/public/ActiveIncidentsList';
import StatusTimeline from '../../components/public/StatusTimeline';
import { ModeToggle } from '../../components/ui/mode-toggle';
import { Button } from '../../components/ui/button';
import { Github } from 'lucide-react'; // Replace GitHubLogoIcon with Github from lucide-react
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { toast } from '../../hooks/use-toast';
import UserAccountNav from '../../components/auth/UserAccountNav';

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
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold">S</span>
            </div>
            <h1 className="text-xl font-bold">System Status</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <a href="https://github.com/halum-halum-08/Pilvo-Assignment" target="_blank" rel="noopener noreferrer">
                <Github className="mr-2 h-4 w-4" /> {/* Replace GitHubLogoIcon with Github */}
                GitHub
              </a>
            </Button>
            <ModeToggle />
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
            {!user && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate('/login')}
              >
                Login
              </Button>
            )}
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-6 md:py-8 flex-1">
        <div className="space-y-8 md:space-y-12">
          {/* Overall Status */}
          <section>
            <StatusOverview />
          </section>
          
          {/* Active Incidents & Maintenance */}
          <section>
            <ActiveIncidentsList />
          </section>
          
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8">
            {/* Service Status */}
            <div className="col-span-1 md:col-span-2 lg:col-span-3">
              <ServiceStatusList />
            </div>
            
            {/* Timeline */}
            <div className="col-span-1 md:col-span-1 lg:col-span-2">
              <StatusTimeline />
            </div>
          </div>
        </div>
      </main>
      
      <footer className="border-t mt-auto py-6 bg-muted/40">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Status Page. All systems monitored in real-time.
          </div>
          <div className="flex gap-4 text-sm">
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              Terms
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              Privacy
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default StatusPage;
