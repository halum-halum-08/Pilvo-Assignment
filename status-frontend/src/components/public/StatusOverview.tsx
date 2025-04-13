import React from 'react';
import { Card, CardContent } from '../ui/card';
import { useServiceStatus } from '../../hooks/useServiceStatus';
import { AlertTriangle, CheckCircle, AlertOctagon } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';
import { cn } from '../../utils/cn';

const StatusOverview: React.FC = () => {
  const { services, loading } = useServiceStatus();
  
  if (loading) {
    return (
      <Card className="overflow-hidden border-2 border-muted">
        <CardContent className="p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-6 w-48" />
            </div>
            <Skeleton className="h-5 w-32" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Determine overall system status
  const allOperational = services.every(service => 
    service.status === 'Operational'
  );
  
  const hasMajorOutage = services.some(service => 
    service.status === 'Major Outage'
  );
  
  let statusInfo = {
    icon: <CheckCircle className="h-8 w-8 text-green-500" aria-hidden="true" />,
    title: "All Systems Operational",
    color: "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-900",
    textColor: "text-green-700 dark:text-green-400"
  };
  
  if (!allOperational) {
    if (hasMajorOutage) {
      statusInfo = {
        icon: <AlertOctagon className="h-8 w-8 text-red-500" aria-hidden="true" />,
        title: "Major System Outage",
        color: "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-900",
        textColor: "text-red-700 dark:text-red-400"
      };
    } else {
      statusInfo = {
        icon: <AlertTriangle className="h-8 w-8 text-yellow-500" aria-hidden="true" />,
        title: "Some Systems Degraded",
        color: "bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-900",
        textColor: "text-yellow-700 dark:text-yellow-400"
      };
    }
  }

  return (
    <Card className={cn("overflow-hidden border-2 shadow-sm", statusInfo.color)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            {statusInfo.icon}
            <h2 className={cn("text-xl font-semibold", statusInfo.textColor)}>
              {statusInfo.title}
            </h2>
          </div>
          <div className="text-sm text-muted-foreground">
            As of {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatusOverview;
