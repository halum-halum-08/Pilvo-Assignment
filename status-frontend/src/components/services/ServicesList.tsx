import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit, Trash2, BarChart2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { toast } from '../../hooks/use-toast';
import { useSocket } from '../../hooks/useSocket';
import { Service } from '../../types/service';
import { useNavigate } from 'react-router-dom';

interface ServicesListProps {
  onEdit: (service: Service) => void;
  onAdd: () => void;
}

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const ServicesList: React.FC<ServicesListProps> = ({ onEdit, onAdd }) => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const { onServiceCreated, onServiceUpdated, onServiceDeleted } = useSocket();
  const navigate = useNavigate();

  useEffect(() => {
    fetchServices();
    
    // Setup socket listeners
    const unsubscribeCreated = onServiceCreated((service) => {
      setServices(prev => [...prev, service]);
    });
    
    const unsubscribeUpdated = onServiceUpdated((updatedService) => {
      setServices(prev => prev.map(service => 
        service.id === updatedService.id ? updatedService : service
      ));
    });
    
    const unsubscribeDeleted = onServiceDeleted(({ id }) => {
      setServices(prev => prev.filter(service => service.id !== id));
    });
    
    return () => {
      unsubscribeCreated();
      unsubscribeUpdated();
      unsubscribeDeleted();
    };
  }, [onServiceCreated, onServiceUpdated, onServiceDeleted]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Add a timeout to prevent hanging requests
      const response = await axios.get(`${API_URL}/services`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000
      });
      
      setServices(response.data);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast({
        title: 'Error',
        description: 'Could not load services. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteService = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/services/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // The socket listener will update the UI
      toast({
        title: 'Success',
        description: 'Service deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting service:', error);
      toast({
        title: 'Error',
        description: 'Could not delete service. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleStatusUpdate = (serviceId: number) => {
    navigate(`/dashboard/services/status/${serviceId}`);
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, string> = {
      'Operational': 'bg-green-500',
      'Degraded Performance': 'bg-yellow-500',
      'Partial Outage': 'bg-orange-500',
      'Major Outage': 'bg-red-500',
      'Maintenance': 'bg-blue-500',
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
        <div 
          className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"
          role="status"
          aria-label="Loading"
        >
          <span className="sr-only">Loading services...</span>
        </div>
      </div>
    );
  }
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Services</CardTitle>
        <Button size="sm" onClick={onAdd}>
          <Plus size={16} className="mr-2" aria-hidden="true" /> Add Service
        </Button>
      </CardHeader>
      <CardContent>
        {services.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            No services found. Create your first service to get started.
          </div>
        ) : (
          <div className="divide-y">
            {services.map((service) => (
              <div key={service.id} className="py-4 flex items-center justify-between flex-wrap gap-4">
                <div>
                  <div className="font-medium">{service.name}</div>
                  <div className="text-sm text-muted-foreground mt-1">{service.description}</div>
                  <div className="mt-2">{getStatusBadge(service.status)}</div>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleStatusUpdate(service.id)}
                    aria-label={`Update ${service.name} status`}
                  >
                    <BarChart2 size={16} className="mr-1" /> Status
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => onEdit(service)}
                    aria-label={`Edit ${service.name}`}
                  >
                    <Edit size={16} />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-destructive hover:text-destructive" 
                    onClick={() => handleDeleteService(service.id)}
                    aria-label={`Delete ${service.name}`}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ServicesList;
