import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useServiceStatus } from '../../hooks/useServiceStatus';
import { 
  CheckCircle, 
  AlertTriangle, 
  AlertCircle, 
  AlertOctagon, 
  Clock
} from 'lucide-react';

type StatusBadgeProps = {
  status: string;
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  let icon;
  let colorClass;
  let label = status;
  
  switch (status) {
    case 'Operational':
      icon = <CheckCircle className="h-4 w-4 mr-1.5" />;
      colorClass = "text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400";
      break;
    case 'Degraded Performance':
      icon = <AlertTriangle className="h-4 w-4 mr-1.5" />;
      colorClass = "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400";
      break;
    case 'Partial Outage':
      icon = <AlertCircle className="h-4 w-4 mr-1.5" />;
      colorClass = "text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400";
      break;
    case 'Major Outage':
      icon = <AlertOctagon className="h-4 w-4 mr-1.5" />;
      colorClass = "text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400";
      break;
    case 'Maintenance':
      icon = <Clock className="h-4 w-4 mr-1.5" />;
      colorClass = "text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400";
      break;
    default:
      icon = <AlertCircle className="h-4 w-4 mr-1.5" />;
      colorClass = "text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-400";
  }

  return (
    <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${colorClass}`}>
      {icon}
      {label}
    </div>
  );
};

const ServiceStatusList: React.FC = () => {
  const { services, loading } = useServiceStatus();
  
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Service Status</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="h-24 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Group services by team for better organization
  const servicesByTeam: Record<string, typeof services> = {};
  services.forEach(service => {
    const teamName = service.team?.name || 'Other Services';
    if (!servicesByTeam[teamName]) {
      servicesByTeam[teamName] = [];
    }
    servicesByTeam[teamName].push(service);
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Service Status</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {Object.keys(servicesByTeam).length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No services found.
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(servicesByTeam).map(([teamName, teamServices]) => (
              <div key={teamName} className="space-y-4">
                <h3 className="font-medium text-sm text-muted-foreground">{teamName}</h3>
                <div className="space-y-2">
                  {teamServices.map(service => (
                    <div 
                      key={service.id} 
                      className="flex items-center justify-between p-3 rounded-md border bg-card"
                    >
                      <div className="font-medium">{service.name}</div>
                      <StatusBadge status={service.status} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ServiceStatusList;
