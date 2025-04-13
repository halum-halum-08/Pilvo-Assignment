import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { toast } from '../../hooks/use-toast';
import { 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  AlertOctagon, 
  CalendarCheck
} from 'lucide-react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

type TimelineEvent = {
  id: string;
  title: string;
  description?: string;
  timestamp: Date;
  type: 'resolved' | 'incident' | 'maintenance' | 'status-change' | 'maintenance-completed';
  service?: string;
};

const StatusTimeline: React.FC = () => {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTimelineEvents = async () => {
      try {
        const [incidentsResponse, updatesResponse] = await Promise.all([
          axios.get(`${API_URL}/incidents`),
          axios.get(`${API_URL}/incidents?includeUpdates=true`)
        ]);

        // Process incidents
        const incidents = incidentsResponse.data;
        
        // Create timeline events
        const timelineEvents: TimelineEvent[] = [];
        
        // Add incidents
        incidents.forEach((incident: any) => {
          // Add incident creation
          timelineEvents.push({
            id: `incident-${incident.id}`,
            title: incident.type === 'Incident' 
              ? `New incident reported: ${incident.title}` 
              : `Maintenance scheduled: ${incident.title}`,
            description: incident.description,
            timestamp: new Date(incident.createdAt),
            type: incident.type === 'Incident' ? 'incident' : 'maintenance',
            service: incident.service?.name
          });
          
          // Add incident resolution if resolved
          if (incident.resolvedAt) {
            timelineEvents.push({
              id: `resolved-${incident.id}`,
              title: incident.type === 'Incident'
                ? `Incident resolved: ${incident.title}`
                : `Maintenance completed: ${incident.title}`,
              timestamp: new Date(incident.resolvedAt),
              type: incident.type === 'Incident' ? 'resolved' : 'maintenance-completed',
              service: incident.service?.name
            });
          }
        });

        // Sort by timestamp descending (newest first)
        timelineEvents.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        
        // Limit to last 15 events
        setEvents(timelineEvents.slice(0, 15));
      } catch (error) {
        console.error('Error fetching timeline events:', error);
        toast({
          title: 'Error',
          description: 'Could not load timeline events',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTimelineEvents();
  }, []);

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'resolved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'incident':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'maintenance':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'status-change':
        return <AlertOctagon className="h-5 w-5 text-yellow-500" />;
      case 'maintenance-completed':
        return <CalendarCheck className="h-5 w-5 text-green-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Timeline</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="h-64 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {events.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            No recent activity to display.
          </div>
        ) : (
          <div className="relative pl-6 border-l">
            {events.map((event, index) => (
              <div key={event.id} className={`mb-6 ${index === events.length - 1 ? '' : ''}`}>
                <div className="absolute left-0 transform -translate-x-1/2 mt-1.5 flex items-center justify-center w-8 h-8 rounded-full bg-background border">
                  {getEventIcon(event.type)}
                </div>
                <div className="pl-4">
                  <div className="mb-1 text-sm font-medium">{event.title}</div>
                  {event.description && (
                    <p className="text-xs text-muted-foreground mb-1">{event.description}</p>
                  )}
                  <div className="flex gap-2">
                    <time className="text-xs text-muted-foreground">
                      {format(event.timestamp, 'MMM d, yyyy • HH:mm')}
                    </time>
                    {event.service && (
                      <>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs">{event.service}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StatusTimeline;
