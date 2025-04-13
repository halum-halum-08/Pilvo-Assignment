import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { toast } from '../../hooks/use-toast';
import { ArrowLeft, AlertTriangle, Clock } from 'lucide-react';
import { ModeToggle } from '../../components/ui/mode-toggle';
import { Incident, IncidentUpdate } from '../../types/incident';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const IncidentDetailPage: React.FC = () => {
  const { id, type = 'incidents' } = useParams<{ id: string, type: string }>();
  const [incident, setIncident] = useState<Incident | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIncident = async () => {
      try {
        const response = await axios.get(`${API_URL}/incidents/${id}`);
        setIncident(response.data);
      } catch (error) {
        console.error('Error fetching incident details:', error);
        toast({
          title: 'Error',
          description: 'Could not load incident details',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchIncident();
    }
  }, [id]);

  const getStatusBadge = (status: string) => {
    let bgColor = 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    
    switch (status) {
      case 'Investigating':
      case 'Identified':
        bgColor = 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
        break;
      case 'Monitoring':
      case 'In Progress':
        bgColor = 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
        break;
      case 'Resolved':
      case 'Completed':
        bgColor = 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
        break;
      case 'Scheduled':
        bgColor = 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
        break;
    }
    
    return (
      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${bgColor}`}>
        {status}
      </span>
    );
  };

  const isIncident = incident?.type === 'Incident';
  const pageTitle = isIncident ? 'Incident Details' : 'Maintenance Details';
  const icon = isIncident ? <AlertTriangle className="h-5 w-5 text-yellow-500" aria-hidden="true" /> : <Clock className="h-5 w-5 text-blue-500" aria-hidden="true" />;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold">{pageTitle}</h1>
            <ModeToggle />
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[300px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" role="status">
              <span className="sr-only">Loading...</span>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold">{pageTitle}</h1>
            <ModeToggle />
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <h2 className="text-xl font-semibold mb-2">Not Found</h2>
                <p className="text-muted-foreground mb-4">
                  The requested {isIncident ? 'incident' : 'maintenance'} could not be found.
                </p>
                <Button asChild>
                  <Link to="/status">Return to Status Page</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            {icon}
            <h1 className="text-2xl font-bold truncate max-w-[200px] md:max-w-none">{pageTitle}</h1>
          </div>
          <ModeToggle />
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-6 md:py-8">
        <div className="mb-6">
          <Button asChild variant="outline" size="sm">
            <Link to="/status">
              <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
              Back to Status Page
            </Link>
          </Button>
        </div>

        <div className="space-y-6">
          {/* Incident Overview */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <CardTitle className="text-xl break-words">{incident.title}</CardTitle>
                {getStatusBadge(incident.status)}
              </div>
              
              <CardDescription>
                {incident.service?.name} • Created on {format(new Date(incident.createdAt), 'MMMM d, yyyy')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground break-words">{incident.description || 'No description provided.'}</p>
            </CardContent>
          </Card>
          
          {/* Updates Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Updates</CardTitle>
            </CardHeader>
            <CardContent>
              {incident.updates && incident.updates.length > 0 ? (
                <div className="relative pl-6 border-l space-y-6">
                  {incident.updates.map((update: IncidentUpdate) => (
                    <div key={update.id} className="relative">
                      <div className="absolute -left-[20px] top-1 rounded-full h-5 w-5 flex items-center justify-center border bg-card">
                        <div className="h-2 w-2 rounded-full bg-primary"></div>
                      </div>
                      <div className="mb-1 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                        <span className="font-medium">{update.status}</span>
                        <span className="hidden sm:inline-block">•</span>
                        <time className="text-sm text-muted-foreground">
                          {format(new Date(update.createdAt), 'MMMM d, yyyy • HH:mm')}
                        </time>
                      </div>
                      <p className="text-sm break-words">{update.message}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  No updates yet.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      
      <footer className="border-t mt-12 py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Status Page. All systems monitored in real-time.
        </div>
      </footer>
    </div>
  );
};

export default IncidentDetailPage;
