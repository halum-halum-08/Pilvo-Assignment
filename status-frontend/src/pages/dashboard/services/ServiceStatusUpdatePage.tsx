import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from '../../../hooks/use-toast';
import { Service } from '../../../types/service';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../../../components/ui/card';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { ArrowLeft } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const SERVICE_STATUSES = [
  'Operational',
  'Degraded Performance',
  'Partial Outage',
  'Major Outage',
  'Maintenance',
];

const ServiceStatusUpdatePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [service, setService] = useState<Service | null>(null);
  const [status, setStatus] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [updating, setUpdating] = useState<boolean>(false);

  useEffect(() => {
    const fetchService = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/services/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setService(response.data);
        setStatus(response.data.status);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching service:', error);
        toast({
          title: 'Error',
          description: 'Could not load service details',
          variant: 'destructive',
        });
        navigate('/dashboard/services');
      }
    };

    if (id) {
      fetchService();
    }
  }, [id, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!status) {
      toast({
        title: 'Error',
        description: 'Please select a status',
        variant: 'destructive',
      });
      return;
    }

    setUpdating(true);
    
    try {
      const token = localStorage.getItem('token');
      
      // Update the service status
      await axios.put(
        `${API_URL}/services/${id}`, 
        { status }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // If there's a message, create an incident update
      if (message.trim()) {
        // Check if there's an active incident for this service
        const incidentsResponse = await axios.get(
          `${API_URL}/incidents?serviceId=${id}&status=active`, 
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        if (incidentsResponse.data.length > 0) {
          // Update existing incident
          const incidentId = incidentsResponse.data[0].id;
          await axios.post(
            `${API_URL}/incidents/${incidentId}/updates`,
            { message, status },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        } else if (status !== 'Operational') {
          // Create a new incident for non-operational statuses
          await axios.post(
            `${API_URL}/incidents`,
            {
              title: `${service?.name} - ${status}`,
              description: `Status change for ${service?.name}`,
              serviceId: Number(id),
              status: 'Investigating',
              type: 'Incident',
              message
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        }
      }
      
      toast({
        title: 'Success',
        description: 'Service status updated successfully',
      });
      
      navigate('/dashboard/services');
    } catch (error) {
      console.error('Error updating service status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update service status',
        variant: 'destructive',
      });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!service) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate('/dashboard/services')}
          className="mr-4"
        >
          <ArrowLeft size={16} className="mr-2" /> Back
        </Button>
        <h1 className="text-3xl font-bold">Update Service Status</h1>
      </div>
      
      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>{service.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={status}
                onValueChange={setStatus}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {SERVICE_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="message">Update Message (Optional)</Label>
              <Textarea
                id="message"
                placeholder="Provide additional information about this status change"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                This message will be added as an incident update if there's an active incident or create a new incident for this service.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate('/dashboard/services')}
              disabled={updating}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updating}>
              {updating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  Updating...
                </>
              ) : 'Update Status'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default ServiceStatusUpdatePage;
