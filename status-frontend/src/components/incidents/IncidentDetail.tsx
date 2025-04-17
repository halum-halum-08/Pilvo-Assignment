import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { toast } from '../../hooks/use-toast';
import { useSocket } from '../../hooks/useSocket';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Incident, IncidentUpdate } from '../../types/incident';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const INCIDENT_STATUSES = [
  'Investigating',
  'Identified',
  'Monitoring',
  'Resolved',
];

const MAINTENANCE_STATUSES = [
  'Scheduled',
  'In Progress',
  'Completed',
];

const IncidentDetail: React.FC = () => {
  const [incident, setIncident] = useState<Incident | null>(null);
  const [loading, setLoading] = useState(true);
  const [updateMessage, setUpdateMessage] = useState('');
  const [updateStatus, setUpdateStatus] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { onIncidentUpdated, joinIncidentRoom } = useSocket();

  const isIncident = incident?.type === 'Incident';
  const statuses = isIncident ? INCIDENT_STATUSES : MAINTENANCE_STATUSES;

  // Use useCallback for fetchIncident to safely include it in the useEffect dependencies
  const fetchIncident = useCallback(async (incidentId: number) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/incidents/${incidentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setIncident(response.data);
      setUpdateStatus(response.data.status);
    } catch (error) {
      console.error('Error fetching incident:', error);
      toast({
        title: 'Error',
        description: 'Could not load incident details. Please try again.',
        variant: 'destructive',
      });
      navigate(-1);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    if (id) {
      fetchIncident(parseInt(id));
      joinIncidentRoom(parseInt(id));
    }
    
    const unsubscribeUpdated = onIncidentUpdated((updatedIncident) => {
      if (updatedIncident.id === parseInt(id || '0')) {
        setIncident(updatedIncident);
      }
    });
    
    return () => {
      unsubscribeUpdated();
    };
  }, [id, fetchIncident, joinIncidentRoom, onIncidentUpdated]);

  const submitUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!updateMessage) {
      toast({
        title: 'Error',
        description: 'Please enter an update message',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');
      
      await axios.post(`${API_URL}/incidents/${id}/updates`, {
        message: updateMessage,
        status: updateStatus
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast({
        title: 'Success',
        description: 'Update posted successfully',
      });
      
      setUpdateMessage('');
      fetchIncident(parseInt(id || '0'));
    } catch (error) {
      console.error('Error posting update:', error);
      toast({
        title: 'Error',
        description: 'Failed to post update. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

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

  if (!incident) return null;

  return (
    <div className="space-y-6">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => navigate(-1)} 
        className="mb-4"
      >
        <ArrowLeft size={16} className="mr-2" /> Back
      </Button>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between">
            <span>{incident.title}</span>
            {getStatusBadge(incident.status)}
          </CardTitle>
          <CardDescription>
            {incident.service?.name} · Created {format(new Date(incident.createdAt), 'MMM d, yyyy h:mm a')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{incident.description}</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Post an Update</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={submitUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="message">Update Message</Label>
              <Textarea
                id="message"
                value={updateMessage}
                onChange={(e) => setUpdateMessage(e.target.value)}
                placeholder="Provide an update on this incident"
                rows={3}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={updateStatus}
                onValueChange={setUpdateStatus}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Status</SelectLabel>
                    {statuses.map((status) => (
                      <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  Posting...
                </>
              ) : 'Post Update'}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Updates</CardTitle>
        </CardHeader>
        <CardContent>
          {incident.updates && incident.updates.length > 0 ? (
            <div className="space-y-4">
              {incident.updates.map((update: IncidentUpdate) => (
                <div key={update.id} className="border-l-4 border-primary pl-4 py-2">
                  <div className="flex justify-between items-start">
                    <div className="font-medium">{getStatusBadge(update.status)}</div>
                    <div className="text-xs text-muted-foreground">
                      {format(new Date(update.createdAt), 'MMM d, yyyy h:mm a')}
                    </div>
                  </div>
                  <p className="mt-2 text-sm">{update.message}</p>
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
  );
};

export default IncidentDetail;
