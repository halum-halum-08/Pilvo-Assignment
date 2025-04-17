import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Plus, ExternalLink } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { toast } from '../../hooks/use-toast';
import { useSocket } from '../../hooks/useSocket';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { Incident } from '../../types/incident';

interface IncidentsListProps {
  type: 'incident' | 'maintenance';
  onAdd: () => void;
}

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const IncidentsList: React.FC<IncidentsListProps> = ({ type, onAdd }) => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const { onIncidentCreated, onIncidentUpdated } = useSocket();

  const typeLabel = type === 'incident' ? 'Incidents' : 'Maintenance';

  const fetchIncidents = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/incidents?type=${type}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIncidents(response.data);
    } catch (error) {
      console.error(`Error fetching ${type}:`, error);
      toast({
        title: 'Error',
        description: `Could not load ${typeLabel.toLowerCase()}. Please try again.`,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [type, typeLabel]);

  const handleIncidentCreated = useCallback((incident: Incident) => {
    if (incident.type.toLowerCase() === type) {
      setIncidents(prev => [incident, ...prev]);
    }
  }, [type]);

  const handleIncidentUpdated = useCallback((updatedIncident: Incident) => {
    if (updatedIncident.type.toLowerCase() === type) {
      setIncidents(prev => prev.map(incident => 
        incident.id === updatedIncident.id ? updatedIncident : incident
      ));
    }
  }, [type]);

  useEffect(() => {
    fetchIncidents();
    
    // Setup socket listeners
    const unsubscribeCreated = onIncidentCreated(handleIncidentCreated);
    const unsubscribeUpdated = onIncidentUpdated(handleIncidentUpdated);
    
    return () => {
      unsubscribeCreated();
      unsubscribeUpdated();
    };
  }, [fetchIncidents, handleIncidentCreated, handleIncidentUpdated, onIncidentCreated, onIncidentUpdated]);

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, string> = {
      'Investigating': 'bg-yellow-500',
      'Identified': 'bg-orange-500',
      'Monitoring': 'bg-blue-500',
      'Resolved': 'bg-green-500',
      'Scheduled': 'bg-purple-500',
      'In Progress': 'bg-blue-500',
      'Completed': 'bg-green-500',
    };

    const bgColor = statusMap[status] || 'bg-gray-500';
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor} text-white`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{typeLabel}</CardTitle>
        <Button size="sm" onClick={onAdd}>
          <Plus size={16} className="mr-2" /> Add {type === 'incident' ? 'Incident' : 'Maintenance'}
        </Button>
      </CardHeader>
      <CardContent>
        {incidents.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            No {typeLabel.toLowerCase()} found.
          </div>
        ) : (
          <div className="divide-y">
            {incidents.map((incident) => (
              <div key={incident.id} className="py-4">
                <div className="flex items-center justify-between">
                  <div className="font-medium">{incident.title}</div>
                  <Link to={`/dashboard/${type === 'incident' ? 'incidents' : 'maintenance'}/${incident.id}`}>
                    <Button variant="ghost" size="sm">
                      <ExternalLink size={16} className="mr-1" /> View
                    </Button>
                  </Link>
                </div>
                <div className="text-sm text-muted-foreground mt-1">{incident.description}</div>
                <div className="flex items-center justify-between mt-2">
                  <div>{getStatusBadge(incident.status)}</div>
                  <div className="text-sm text-muted-foreground">
                    {format(new Date(incident.createdAt), 'MMM d, yyyy h:mm a')}
                  </div>
                </div>
                {incident.service && (
                  <div className="text-sm mt-2">
                    <span className="text-muted-foreground">Service:</span> {incident.service.name}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default IncidentsList;
