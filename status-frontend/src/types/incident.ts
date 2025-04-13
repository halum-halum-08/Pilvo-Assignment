import { Service } from './service';

export interface IncidentUpdate {
  id: number;
  message: string;
  status: string;
  incidentId: number;
  createdAt: string;
}

export interface Incident {
  id: number;
  title: string;
  description?: string;
  status: string;
  type: 'Incident' | 'Maintenance';
  serviceId: number;
  service?: Service;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  updates?: IncidentUpdate[];
}
