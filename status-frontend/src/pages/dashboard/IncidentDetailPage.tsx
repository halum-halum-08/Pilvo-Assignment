import React from 'react';
import IncidentDetail from '../../components/incidents/IncidentDetail';

const IncidentDetailPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Incident Details</h1>
        <p className="text-muted-foreground mt-2">
          View and update incident information.
        </p>
      </div>
      
      <IncidentDetail />
    </div>
  );
};

export default IncidentDetailPage;
