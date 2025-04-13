import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Test data creation helpers
export const createTestUser = async (data: {
  name: string;
  email: string;
  password: string;
  role?: string;
  organization?: string;
  teamId?: number;
}) => {
  const hashedPassword = await bcrypt.hash(data.password, 10);
  
  return prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: data.role || 'user',
      organization: data.organization,
      teamId: data.teamId
    }
  });
};

export const createTestTeam = async (data: {
  name: string;
  organization?: string;
}) => {
  return prisma.team.create({
    data: {
      name: data.name,
      organization: data.organization
    }
  });
};

export const createTestService = async (data: {
  name: string;
  description?: string;
  status: string;
  teamId: number;
}) => {
  return prisma.service.create({
    data: {
      name: data.name,
      description: data.description,
      status: data.status,
      teamId: data.teamId
    }
  });
};

export const createTestIncident = async (data: {
  title: string;
  description?: string;
  status: string;
  type: string;
  serviceId: number;
}) => {
  return prisma.incident.create({
    data: {
      title: data.title,
      description: data.description,
      status: data.status,
      type: data.type,
      serviceId: data.serviceId
    }
  });
};

export const createTestIncidentUpdate = async (data: {
  message: string;
  status: string;
  incidentId: number;
}) => {
  return prisma.incidentUpdate.create({
    data: {
      message: data.message,
      status: data.status,
      incidentId: data.incidentId
    }
  });
};

// Clean up functions
export const cleanDatabase = async () => {
  await prisma.$transaction([
    prisma.incidentUpdate.deleteMany(),
    prisma.incident.deleteMany(),
    prisma.service.deleteMany(),
    prisma.user.deleteMany(),
    prisma.team.deleteMany()
  ]);
};
