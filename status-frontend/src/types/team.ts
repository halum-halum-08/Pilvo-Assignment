import { User } from './user';
import { Service } from './service';

export interface Team {
  id: number;
  name: string;
  organization?: string;
  users?: User[];
  services?: Service[];
  createdAt: string;
  updatedAt: string;
}
