// Database setup script
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Create tables and reset database
  console.log('Setting up database...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      password: hashedPassword,
      role: 'admin'
    }
  });
  
  console.log('Created admin user:', adminUser);

  // Create a demo team
  const demoTeam = await prisma.team.upsert({
    where: { id: 'team-1' },
    update: {},
    create: {
      id: 'team-1',
      name: 'Platform Team'
    }
  });
  
  console.log('Created demo team:', demoTeam);

  // Create some demo services
  const services = [
    { name: 'API Gateway', description: 'Main API gateway service', status: 'operational' },
    { name: 'Authentication', description: 'User authentication service', status: 'operational' },
    { name: 'Database', description: 'Main database service', status: 'operational' },
    { name: 'Storage', description: 'File storage service', status: 'operational' },
    { name: 'Analytics', description: 'Data analytics service', status: 'operational' }
  ];

  for (const service of services) {
    const createdService = await prisma.service.create({
      data: {
        ...service,
        team: {
          connect: { id: demoTeam.id }
        }
      }
    });
    console.log('Created service:', createdService);
  }

  console.log('Database setup complete!');
}

main()
  .catch((e) => {
    console.error('Error setting up database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });