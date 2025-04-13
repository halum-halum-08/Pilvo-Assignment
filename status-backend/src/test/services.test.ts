import request from 'supertest';
import { setupTestServer } from './utils/testServer';
import { 
  createTestUser, 
  createTestTeam, 
  createTestService, 
  cleanDatabase 
} from './utils/testDb';
import { TestServer } from './utils/testServer';

describe('Services API', () => {
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
  
  describe('GET /api/services', () => {
    it('should return all services', async () => {
      // Create test data
      const team = await createTestTeam({ name: 'Test Team' });
      await createTestService({
        name: 'API Service',
        description: 'Main API service',
        status: 'Operational',
        teamId: team.id
      });
      await createTestService({
        name: 'Web Service',
        status: 'Degraded',
        teamId: team.id
      });
      
      const response = await request(server.app)
        .get('/api/services')
        .expect(200);
      
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
      expect(response.body[0].name).toBeDefined();
      expect(response.body[0].status).toBeDefined();
    });
  });
  
  describe('GET /api/services/:id', () => {
    it('should return a specific service by ID', async () => {
      // Create test data
      const team = await createTestTeam({ name: 'Test Team' });
      const service = await createTestService({
        name: 'API Service',
        description: 'Main API service',
        status: 'Operational',
        teamId: team.id
      });
      
      const response = await request(server.app)
        .get(`/api/services/${service.id}`)
        .expect(200);
      
      expect(response.body.id).toBe(service.id);
      expect(response.body.name).toBe(service.name);
      expect(response.body.status).toBe(service.status);
    });
    
    it('should return 404 for non-existent service', async () => {
      await request(server.app)
        .get('/api/services/9999')
        .expect(404);
    });
  });
  
  describe('POST /api/services', () => {
    it('should create a new service when authenticated', async () => {
      // Create user and team
      const user = await createTestUser({
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'password123',
        role: 'admin'
      });
      
      const team = await createTestTeam({ name: 'Test Team' });
      
      // Create auth token
      const token = server.createAuthToken({
        id: user.id,
        email: user.email,
        role: user.role
      });
      
      // Create service
      const serviceData = {
        name: 'New Service',
        description: 'A new test service',
        status: 'Operational',
        teamId: team.id
      };
      
      const response = await request(server.app)
        .post('/api/services')
        .set('Authorization', `Bearer ${token}`)
        .send(serviceData)
        .expect(201);
      
      expect(response.body.name).toBe(serviceData.name);
      expect(response.body.description).toBe(serviceData.description);
      expect(response.body.status).toBe(serviceData.status);
      expect(response.body.teamId).toBe(team.id);
    });
    
    it('should return 401 when not authenticated', async () => {
      const team = await createTestTeam({ name: 'Test Team' });
      
      await request(server.app)
        .post('/api/services')
        .send({
          name: 'New Service',
          status: 'Operational',
          teamId: team.id
        })
        .expect(401);
    });
    
    it('should validate required fields', async () => {
      const user = await createTestUser({
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'password123',
        role: 'admin'
      });
      
      const token = server.createAuthToken({
        id: user.id,
        email: user.email,
        role: user.role
      });
      
      await request(server.app)
        .post('/api/services')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'New Service'
          // Missing required fields
        })
        .expect(400);
    });
  });
  
  describe('PUT /api/services/:id', () => {
    it('should update a service when authenticated', async () => {
      // Create test data
      const user = await createTestUser({
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'password123',
        role: 'admin'
      });
      
      const team = await createTestTeam({ name: 'Test Team' });
      const service = await createTestService({
        name: 'API Service',
        description: 'Main API service',
        status: 'Operational',
        teamId: team.id
      });
      
      // Create auth token
      const token = server.createAuthToken({
        id: user.id,
        email: user.email,
        role: user.role
      });
      
      // Update service
      const updateData = {
        name: 'Updated API Service',
        status: 'Degraded'
      };
      
      const response = await request(server.app)
        .put(`/api/services/${service.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(200);
      
      expect(response.body.name).toBe(updateData.name);
      expect(response.body.status).toBe(updateData.status);
      // Description should remain unchanged
      expect(response.body.description).toBe(service.description);
    });
  });
  
  describe('DELETE /api/services/:id', () => {
    it('should delete a service when authenticated', async () => {
      // Create test data
      const user = await createTestUser({
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'password123',
        role: 'admin'
      });
      
      const team = await createTestTeam({ name: 'Test Team' });
      const service = await createTestService({
        name: 'API Service',
        status: 'Operational',
        teamId: team.id
      });
      
      // Create auth token
      const token = server.createAuthToken({
        id: user.id,
        email: user.email,
        role: user.role
      });
      
      // Delete service
      await request(server.app)
        .delete(`/api/services/${service.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      
      // Verify service is deleted
      await request(server.app)
        .get(`/api/services/${service.id}`)
        .expect(404);
    });
  });
});
