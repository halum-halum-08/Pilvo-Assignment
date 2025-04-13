import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { toast } from '../../hooks/use-toast';
import { Incident } from '../../types/incident';
import { Service } from '../../types/service';

interface IncidentFormProps {
  incidentType: 'incident' | 'maintenance';
  incident?: Incident;
  onCancel: () => void;
  onSuccess: () => void;
}

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

const IncidentForm: React.FC<IncidentFormProps> = ({ 
  incidentType, 
  incident, 
  onCancel, 
  onSuccess 
}) => {
  const [title, setTitle] = useState(incident?.title || '');
  const [description, setDescription] = useState(incident?.description || '');
  const [status, setStatus] = useState(incident?.status || '');
  const [serviceId, setServiceId] = useState<number | undefined>(incident?.serviceId);
  const [message, setMessage] = useState(''); // For updates
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingServices, setFetchingServices] = useState(true);

  const isEditing = !!incident;
  const statuses = incidentType === 'incident' ? INCIDENT_STATUSES : MAINTENANCE_STATUSES;

  useEffect(() => {
    // Set default status based on type if not editing
    if (!isEditing) {
      setStatus(incidentType === 'incident' ? 'Investigating' : 'Scheduled');
    }
    
    // Fetch services for the dropdown
    const fetchServices = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/services`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setServices(response.data);
      } catch (error) {
        console.error('Error fetching services:', error);
        toast({
          title: 'Error',
          description: 'Failed to load services. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setFetchingServices(false);
      }
    };

    fetchServices();
  }, [incidentType, isEditing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !status || !serviceId) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const data = { 
        title, 
        description, 
        status, 
        serviceId,
        type: incidentType === 'incident' ? 'Incident' : 'Maintenance',
      };
      
      if (isEditing) {
        // If editing and there's a message, add an update
        if (message) {
          await axios.put(`${API_URL}/incidents/${incident.id}`, {
            ...data,
            message
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });
        } else {
          await axios.put(`${API_URL}/incidents/${incident.id}`, data, {
            headers: { Authorization: `Bearer ${token}` }
          });
        }
        toast({
          title: 'Success',
          description: `${incidentType === 'incident' ? 'Incident' : 'Maintenance'} updated successfully`,
        });
      } else {
        // Include initial message/update when creating
        await axios.post(`${API_URL}/incidents`, {
          ...data,
          message: message || `${incidentType === 'incident' ? 'Incident' : 'Maintenance'} created`
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast({
          title: 'Success',
          description: `${incidentType === 'incident' ? 'Incident' : 'Maintenance'} created successfully`,
        });
      }
      
      onSuccess();
    } catch (error) {
      console.error('Error saving incident:', error);
      toast({
        title: 'Error',
        description: `Failed to ${isEditing ? 'update' : 'create'} ${incidentType}. Please try again.`,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (fetchingServices) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>
            {isEditing ? 'Edit' : 'Create'} {incidentType === 'incident' ? 'Incident' : 'Maintenance'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Brief title describing the issue"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed description of the issue"
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="status">Status *</Label>
            <Select
              value={status}
              onValueChange={setStatus}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Status</SelectLabel>
                  {statuses.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="service">Affected Service *</Label>
            <Select
              value={serviceId?.toString()}
              onValueChange={(value) => setServiceId(parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select service" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Services</SelectLabel>
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.id.toString()}>
                      {service.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="message">
              {isEditing ? 'Update Message' : 'Initial Message'} 
              {isEditing && <span className="text-sm text-muted-foreground"> (optional)</span>}
            </Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={isEditing 
                ? "Optional update message" 
                : "Initial message/update for this incident"}
              rows={3}
              required={!isEditing}
            />
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                {isEditing ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              isEditing ? 'Update' : 'Create'
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default IncidentForm;
