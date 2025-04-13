export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  organization?: string;
  teamId?: number;
  createdAt?: string;
  updatedAt?: string;
}
