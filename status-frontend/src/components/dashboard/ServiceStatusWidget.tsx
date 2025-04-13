import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { CheckCircle, AlertTriangle, XCircle, Clock } from 'lucide-react';
import { useServiceStatus } from '../../hooks/useServiceStatus';
import { Skeleton } from '../ui/skeleton';
import { Link } from 'react-router-dom';

const ServiceStatusWidget: React.FC = () => {
  const { services, loading } = useServiceStatus();
  
  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Service Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusCounts = () => {
    const counts = {
      operational: 0,
      degraded: 0,
      outage: 0,
      maintenance: 0
    };
    
    services.forEach(service => {
      if (service.status === 'Operational') {
        counts.operational++;
      } else if (service.status === 'Degraded Performance') {
        counts.degraded++;
      } else if (service.status.includes('Outage')) {
        counts.outage++;
      } else if (service.status === 'Maintenance') {
        counts.maintenance++;
      }
    });
    
    return counts;
  };

  const counts = getStatusCounts();
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Service Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <div>
              <p className="text-sm font-medium">{counts.operational}</p>
              <p className="text-xs text-muted-foreground">Operational</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            <div>
              <p className="text-sm font-medium">{counts.degraded}</p>
              <p className="text-xs text-muted-foreground">Degraded</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-red-500" />
            <div>
              <p className="text-sm font-medium">{counts.outage}</p>
              <p className="text-xs text-muted-foreground">Outage</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-500" />
            <div>
              <p className="text-sm font-medium">{counts.maintenance}</p>
              <p className="text-xs text-muted-foreground">Maintenance</p>
            </div>
          </div>
        </div>
        
        <div className="mt-4">
          <Link 
            to="/dashboard/services"
            className="text-xs text-primary hover:underline"
          >
            Manage Services →
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default ServiceStatusWidget;
