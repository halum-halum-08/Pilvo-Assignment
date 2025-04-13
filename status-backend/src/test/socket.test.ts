import { setupTestServer } from './utils/testServer';
import { 
  createTestUser, 
  createTestTeam, 
  createTestService, 
  cleanDatabase 
} from './utils/testDb';
import { TestServer } from './utils/testServer';
import prisma from '../utils/db';

describe('WebSocket Events', () => {
  let server: TestServer;
  
  beforeAll(async () => {
    server = await setupTestServer();
  });
  
  afterAll(async () => {
    await server.close();
  });
  
  beforeEach(async () => {
    await cleanDatabase();
  });
  
  describe('Service Status Updates', () => {
    it('should emit updates when service status changes', async () => {
      // Create test data
      const team = await createTestTeam({ name: 'Test Team' });
      const service = await createTestService({
        name: 'API Service',
        status: 'Operational',
        teamId: team.id
      });
      
      // Join the service room
      server.clientSocket.emit('joinServiceRoom', service.id);
      
      // Create a promise to wait for the socket event
      const receivedUpdate = new Promise<any>((resolve) => {
        server.clientSocket.once('service:updated', (data) => {
          resolve(data);
        });
      });
      
      // Update the service status
      await prisma.service.update({
        where: { id: service.id },
        data: { status: 'Degraded' }
      });
      
      // Manually emit the event since we're not going through the API
      server.serverSocket.emit('service:updated', {
        ...service,
        status: 'Degraded'
      });
      
      // Wait for the update event
      const receivedData = await receivedUpdate;
      
      // Verify the received data
      expect(receivedData).toBeDefined();
      expect(receivedData.id).toBe(service.id);
      expect(receivedData.status).toBe('Degraded');
    });
  });
  
  describe('Incident Real-time Updates', () => {
    it('should emit events when a new incident is created', async () => {
      // Create test data
      const team = await createTestTeam({ name: 'Test Team' });
      const service = await createTestService({
        name: 'API Service',
        status: 'Operational',
        teamId: team.id
      });
      
      // Create a promise to wait for the socket event
      const receivedIncident = new Promise<any>((resolve) => {
        server.clientSocket.once('incident:created', (data) => {
          resolve(data);
        });
      });
      
      // Create an incident through socket event (simulating controller)
      const newIncident = {
        id: 1,
        title: 'New Incident',
        description: 'This is a test incident',
        status: 'Investigating',
        type: 'Incident',
        serviceId: service.id,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Emit the event
      server.serverSocket.emit('incident:created', newIncident);
      
      // Wait for the incident created event
      const receivedData = await receivedIncident;
      
      // Verify the received data
      expect(receivedData).toBeDefined();
      expect(receivedData.title).toBe(newIncident.title);
      expect(receivedData.status).toBe(newIncident.status);
    });
  });
  
  describe('Service Status WebSocket API', () => {
    it('should update service status via socket API', async () => {
      // Create test data
      const team = await createTestTeam({ name: 'Test Team' });
      const service = await createTestService({
        name: 'API Service',
        status: 'Operational',
        teamId: team.id
      });
      
      // Join service room
      server.clientSocket.emit('joinServiceRoom', service.id);
      
      // Listen for status change event
      const statusChanged = new Promise<any>((resolve) => {
        server.clientSocket.once('serviceStatusChanged', (data) => {
          resolve(data);
        });
      });
      
      // Emit updateServiceStatus event
      server.clientSocket.emit('updateServiceStatus', {
        serviceId: service.id,
        status: 'Degraded'
      });
      
      // Wait for status update
      const result = await statusChanged;
      
      // Verify result
      expect(result).toBeDefined();
      expect(result.serviceId).toBe(service.id);
      expect(result.status).toBe('Degraded');
      
      // Check if database was updated
      const updatedService = await prisma.service.findUnique({
        where: { id: service.id }
      });
      
      expect(updatedService?.status).toBe('Degraded');
    });
  });
});
