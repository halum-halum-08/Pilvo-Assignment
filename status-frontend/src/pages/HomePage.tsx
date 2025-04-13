import React from 'react';
import { Link } from 'react-router-dom';
import { StatusDisplay } from '../components';
import { Button } from '../components/ui/button';
import { ModeToggle } from '../components/ui/mode-toggle';
import { ArrowRight } from 'lucide-react';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold">Status Page</h1>
          <div className="flex items-center gap-4">
            <ModeToggle />
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link to="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link to="/register">Sign Up</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      <main>
        {/* Hero section */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-4">System Status Monitor</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Check the current status of our services and stay informed about any incidents or maintenance.
          </p>
          <div className="flex justify-center gap-4">
            <Button size="lg" asChild>
              <Link to="/status">
                View Status Page
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
        
        {/* Simple status overview */}
        <div className="max-w-7xl mx-auto py-8 px-4">
          <StatusDisplay />
        </div>
      </main>
      
      <footer className="bg-card border-t mt-12">
        <div className="max-w-7xl mx-auto py-6 px-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Status Page
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
