export interface Incident {
  id: string;
  title: string;
  description: string;
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved';
  type: 'incident' | 'maintenance';
  severity: 'critical' | 'major' | 'minor' | 'none';
  createdAt: string;
  updatedAt: string;
  serviceIds: string[]; // Services affected by this incident
  updates: IncidentUpdate[];
}

export interface IncidentUpdate {
  id: string;
  incidentId: string;
  message: string;
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved';
  createdAt: string;
}

export interface CreateIncidentDto {
  title: string;
  description: string;
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved';
  type: 'incident' | 'maintenance';
  severity: 'critical' | 'major' | 'minor' | 'none';
  serviceIds: string[];
}

export interface UpdateIncidentDto {
  title?: string;
  description?: string;
  status?: 'investigating' | 'identified' | 'monitoring' | 'resolved';
  severity?: 'critical' | 'major' | 'minor' | 'none';
  serviceIds?: string[];
}

export interface CreateIncidentUpdateDto {
  message: string;
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved';
}