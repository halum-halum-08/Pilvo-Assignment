import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import dotenv from 'dotenv';
import path from 'path';

// Load test environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env.test') });

const prisma = new PrismaClient();

// Global setup and teardown
beforeAll(async () => {
  // Create test database schema
  execSync('npx prisma migrate dev --name test_init --skip-generate', {
    env: {
      ...process.env,
      DATABASE_URL: process.env.DATABASE_URL
    }
  });
});

beforeEach(async () => {
  // Clean up the database before each test
  await prisma.$transaction([
    prisma.incidentUpdate.deleteMany(),
    prisma.incident.deleteMany(),
    prisma.service.deleteMany(),
    prisma.user.deleteMany(),
    prisma.team.deleteMany(),
  ]);
});

afterAll(async () => {
  // Disconnect from the database
  await prisma.$disconnect();
});
