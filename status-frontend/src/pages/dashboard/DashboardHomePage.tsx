import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import ServiceStatusWidget from '../../components/dashboard/ServiceStatusWidget';

const DashboardHomePage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Welcome back, {user?.name}!
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ServiceStatusWidget />
        
        {/* Add more dashboard widgets here */}
      </div>
    </div>
  );
};

export default DashboardHomePage;
