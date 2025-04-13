import React, { useState } from 'react';
import IncidentsList from '../../components/incidents/IncidentsList';
import IncidentForm from '../../components/incidents/IncidentForm';
import { Incident } from '../../types/incident';

const IncidentsPage: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [currentIncident, setCurrentIncident] = useState<Incident | undefined>(undefined);

  const handleAddClick = () => {
    setCurrentIncident(undefined);
    setShowForm(true);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setCurrentIncident(undefined);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setCurrentIncident(undefined);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Incidents</h1>
        <p className="text-muted-foreground mt-2">
          Track and manage service incidents.
        </p>
      </div>
      
      {showForm ? (
        <IncidentForm 
          incidentType="incident"
          incident={currentIncident} 
          onCancel={handleFormCancel} 
          onSuccess={handleFormSuccess} 
        />
      ) : (
        <IncidentsList 
          type="incident"
          onAdd={handleAddClick} 
        />
      )}
    </div>
  );
};

export default IncidentsPage;
