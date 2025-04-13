import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { AlertTriangle, Calendar, ArrowRight } from 'lucide-react';
import { toast } from '../../hooks/use-toast';
import { Link } from 'react-router-dom';
import { Incident } from '../../types/incident';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const ActiveIncidentsList: React.FC = () => {
  const [activeIncidents, setActiveIncidents] = useState<Incident[]>([]);
  const [scheduledMaintenance, setScheduledMaintenance] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchActiveIncidents = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get all non-resolved incidents
        const incidentsResponse = await axios.get(`${API_URL}/incidents`, {
          params: { type: 'Incident' },
          // Add a timeout to prevent hanging requests
          timeout: 10000
        });
        
        // Filter incidents on the client side if the API doesn't support filtering by status
        const incidents = Array.isArray(incidentsResponse.data) 
          ? incidentsResponse.data.filter((incident: Incident) => incident.status !== 'Resolved')
          : [];
          
        setActiveIncidents(incidents);

        // Get all scheduled or in-progress maintenance
        const maintenanceResponse = await axios.get(`${API_URL}/incidents`, {
          params: { type: 'Maintenance' },
          timeout: 10000
        });
        
        // Filter maintenance on the client side
        const maintenance = Array.isArray(maintenanceResponse.data)
          ? maintenanceResponse.data.filter((incident: Incident) => incident.status !== 'Completed')
          : [];
          
        setScheduledMaintenance(maintenance);
      } catch (err) {
        console.error('Error fetching active incidents:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch active incidents'));
        // Don't show toast on public page to avoid spamming users
        // We'll show a more subtle error state instead
      } finally {
        setLoading(false);
      }
    };

    fetchActiveIncidents();
  }, []);

  return (
    <div className="space-y-6">
      {/* Active Incidents */}
      <Card className={activeIncidents.length > 0 ? "border-red-200 dark:border-red-900" : ""}>
        <CardHeader className="flex flex-row items-center gap-2">
          <AlertTriangle className={`h-5 w-5 ${activeIncidents.length > 0 ? "text-red-500" : ""}`} />
          <CardTitle>Active Incidents</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {error ? (
            <div className="text-center py-6 text-muted-foreground">
              <p>Unable to retrieve incident information.</p>
              <p className="text-sm text-muted-foreground mt-1">Please check back later.</p>
            </div>
          ) : loading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="border rounded-md p-4 animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/2 mb-3"></div>
                  <div className="h-3 bg-muted rounded w-1/4"></div>
                </div>
              ))}
            </div>
          ) : activeIncidents.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              No active incidents reported.
            </div>
          ) : (
            <div className="space-y-4">
              {activeIncidents.map(incident => (
                <div key={incident.id} className="border rounded-md p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{incident.title}</h3>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(incident.createdAt), 'MMM d, HH:mm')}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{incident.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm">
                      <span className="mr-2">Status:</span>
                      <span className="font-medium">{incident.status}</span>
                    </div>
                    <Link 
                      to={`/status/incidents/${incident.id}`}
                      className="text-sm text-primary flex items-center hover:underline"
                    >
                      Details <ArrowRight className="h-3 w-3 ml-1" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Scheduled Maintenance */}
      <Card className={scheduledMaintenance.length > 0 ? "border-blue-200 dark:border-blue-900" : ""}>
        <CardHeader className="flex flex-row items-center gap-2">
          <Calendar className={`h-5 w-5 ${scheduledMaintenance.length > 0 ? "text-blue-500" : ""}`} />
          <CardTitle>Scheduled Maintenance</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {error ? (
            <div className="text-center py-6 text-muted-foreground">
              <p>Unable to retrieve maintenance information.</p>
              <p className="text-sm text-muted-foreground mt-1">Please check back later.</p>
            </div>
          ) : loading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="border rounded-md p-4 animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/2 mb-3"></div>
                  <div className="h-3 bg-muted rounded w-1/4"></div>
                </div>
              ))}
            </div>
          ) : scheduledMaintenance.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              No scheduled maintenance at this time.
            </div>
          ) : (
            <div className="space-y-4">
              {scheduledMaintenance.map(maintenance => (
                <div key={maintenance.id} className="border rounded-md p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{maintenance.title}</h3>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(maintenance.createdAt), 'MMM d, HH:mm')}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{maintenance.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm">
                      <span className="mr-2">Status:</span>
                      <span className="font-medium">{maintenance.status}</span>
                    </div>
                    <Link 
                      to={`/status/maintenance/${maintenance.id}`}
                      className="text-sm text-primary flex items-center hover:underline"
                    >
                      Details <ArrowRight className="h-3 w-3 ml-1" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ActiveIncidentsList;
