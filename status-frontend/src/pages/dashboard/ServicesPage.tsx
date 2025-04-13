import React, { useState, useEffect } from 'react';
import ServicesList from '../../components/services/ServicesList';
import ServiceForm from '../../components/services/ServiceForm';
import { Service } from '../../types/service';
import { useNavigate, useLocation } from 'react-router-dom';

const ServicesPage: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [currentService, setCurrentService] = useState<Service | undefined>(undefined);
  const navigate = useNavigate();
  const location = useLocation();

  // Check if we're coming back from a failed status update
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const statusUpdateError = params.get('statusUpdateError');
    
    if (statusUpdateError) {
      // Clear the query parameter
      const newUrl = location.pathname;
      navigate(newUrl, { replace: true });
    }
  }, [location, navigate]);
  
  const handleAddClick = () => {
    setCurrentService(undefined);
    setShowForm(true);
  };

  const handleEditClick = (service: Service) => {
    setCurrentService(service);
    setShowForm(true);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setCurrentService(undefined);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setCurrentService(undefined);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Services</h1>
        <p className="text-muted-foreground mt-2">
          Manage your services and their current status.
        </p>
      </div>
      
      {showForm ? (
        <ServiceForm 
          service={currentService} 
          onCancel={handleFormCancel} 
          onSuccess={handleFormSuccess} 
        />
      ) : (
        <ServicesList 
          onAdd={handleAddClick} 
          onEdit={handleEditClick} 
        />
      )}
    </div>
  );
};

export default ServicesPage;
