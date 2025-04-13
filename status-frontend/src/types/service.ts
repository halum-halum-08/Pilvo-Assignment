import { Team } from './team';
import { Incident } from './incident';

export interface Service {
  id: number;
  name: string;
  description?: string;
  status: string;
  teamId: number;
  team?: Team;
  incidents?: Incident[];
  uptime: number;
  createdAt: string;
  updatedAt: string;
}
