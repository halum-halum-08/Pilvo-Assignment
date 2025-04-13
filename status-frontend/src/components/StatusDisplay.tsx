import React from 'react';
import { useServiceStatus } from '../hooks/useServiceStatus';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { AlertCircle, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import { Skeleton } from './ui/skeleton';

const StatusDisplay: React.FC = () => {
  const { services, loading, error } = useServiceStatus();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-[250px] mb-2" />
          <Skeleton className="h-4 w-[350px]" />
        </CardHeader>
        <CardContent className="space-y-4">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <Skeleton className="h-5 w-[200px]" />
              <Skeleton className="h-6 w-[120px] rounded-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <CardTitle>Error Loading Status</CardTitle>
          </div>
          <CardDescription>
            {error.message || "An error occurred while fetching service status"}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Group services by their status
  const operational = services.filter(s => s.status === 'Operational');
  const issues = services.filter(s => s.status !== 'Operational');

  // Get overall system status
  const systemStatus = issues.length > 0 ? 
    (issues.some(s => s.status === 'Major Outage') ? 'Major Outage' : 'Partial Issues') : 
    'All Operational';

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>System Status</CardTitle>
          <StatusBadge status={systemStatus} />
        </div>
        <CardDescription>
          Current status of all monitored services
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {services.length === 0 ? (
          <p className="text-center text-muted-foreground">No services found to display</p>
        ) : (
          <div className="space-y-4">
            {services.map(service => (
              <div key={service.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <StatusIcon status={service.status} />
                  <span className="font-medium">{service.name}</span>
                </div>
                <StatusBadge status={service.status} />
              </div>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between text-xs text-muted-foreground">
        <span>Last updated: {new Date().toLocaleTimeString()}</span>
        <span>{operational.length} of {services.length} systems operational</span>
      </CardFooter>
    </Card>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  let variant: 
    "default" | "secondary" | "destructive" | "outline" | 
    null | undefined = "default";
  
  switch(status) {
    case 'Operational':
    case 'All Operational':
      variant = "default";
      break;
    case 'Degraded Performance':
    case 'Partial Outage':
    case 'Partial Issues':
      variant = "secondary";
      break;
    case 'Major Outage':
      variant = "destructive";
      break;
    case 'Maintenance':
      variant = "outline";
      break;
  }
  
  return <Badge variant={variant}>{status}</Badge>;
};

const StatusIcon = ({ status }: { status: string }) => {
  switch(status) {
    case 'Operational':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'Degraded Performance':
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    case 'Partial Outage':
      return <AlertTriangle className="h-4 w-4 text-orange-500" />;
    case 'Major Outage':
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    case 'Maintenance':
      return <Clock className="h-4 w-4 text-blue-500" />;
    default:
      return <CheckCircle className="h-4 w-4 text-green-500" />;
  }
};

export default StatusDisplay;
