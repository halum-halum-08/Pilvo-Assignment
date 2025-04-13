import request from 'supertest';
import { setupTestServer } from './utils/testServer';
import { 
  createTestUser, 
  createTestTeam, 
  createTestService, 
  createTestIncident,
  cleanDatabase 
} from './utils/testDb';
import { TestServer } from './utils/testServer';

describe('Incidents API', () => {
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
  
  describe('GET /api/incidents', () => {
    it('should return all incidents', async () => {
      // Create test data
      const team = await createTestTeam({ name: 'Test Team' });
      const service = await createTestService({
        name: 'API Service',
        status: 'Operational',
        teamId: team.id
      });
      
      await createTestIncident({
        title: 'API Outage',
        description: 'The API is down',
        status: 'Investigating',
        type: 'Incident',
        serviceId: service.id
      });
      
      await createTestIncident({
        title: 'Scheduled Maintenance',
        status: 'Planned',
        type: 'Maintenance',
        serviceId: service.id
      });
      
      const response = await request(server.app)
        .get('/api/incidents')
        .expect(200);
      
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
      expect(response.body[0].title).toBeDefined();
      expect(response.body[0].status).toBeDefined();
      expect(response.body[0].service).toBeDefined();
    });
    
    it('should filter incidents by status', async () => {
      // Create test data
      const team = await createTestTeam({ name: 'Test Team' });
      const service = await createTestService({
        name: 'API Service',
        status: 'Operational',
        teamId: team.id
      });
      
      await createTestIncident({
        title: 'API Outage',
        status: 'Investigating',
        type: 'Incident',
        serviceId: service.id
      });
      
      await createTestIncident({
        title: 'Database Slowness',
        status: 'Resolved',
        type: 'Incident',
        serviceId: service.id
      });
      
      const response = await request(server.app)
        .get('/api/incidents?status=Investigating')
        .expect(200);
      
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
      expect(response.body[0].status).toBe('Investigating');
    });
  });
  
  describe('POST /api/incidents', () => {
    it('should create a new incident when authenticated', async () => {
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
      
      // Create incident
      const incidentData = {
        title: 'New Incident',
        description: 'Something went wrong',
        status: 'Investigating',
        type: 'Incident',
        serviceId: service.id
      };
      
      const response = await request(server.app)
        .post('/api/incidents')
        .set('Authorization', `Bearer ${token}`)
        .send(incidentData)
        .expect(201);
      
      expect(response.body.title).toBe(incidentData.title);
      expect(response.body.description).toBe(incidentData.description);
      expect(response.body.status).toBe(incidentData.status);
      expect(response.body.type).toBe(incidentData.type);
      expect(response.body.serviceId).toBe(service.id);
    });
    
    it('should return 401 when not authenticated', async () => {
      const team = await createTestTeam({ name: 'Test Team' });
      const service = await createTestService({
        name: 'API Service',
        status: 'Operational',
        teamId: team.id
      });
      
      await request(server.app)
        .post('/api/incidents')
        .send({
          title: 'New Incident',
          status: 'Investigating',
          type: 'Incident',
          serviceId: service.id
        })
        .expect(401);
    });
  });
  
  describe('PUT /api/incidents/:id', () => {
    it('should update an incident when authenticated', async () => {
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
      
      const incident = await createTestIncident({
        title: 'API Outage',
        description: 'The API is down',
        status: 'Investigating',
        type: 'Incident',
        serviceId: service.id
      });
      
      // Create auth token
      const token = server.createAuthToken({
        id: user.id,
        email: user.email,
        role: user.role
      });
      
      // Update incident
      const updateData = {
        status: 'Resolved',
        message: 'The issue has been fixed'
      };
      
      const response = await request(server.app)
        .put(`/api/incidents/${incident.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(200);
      
      expect(response.body.status).toBe(updateData.status);
      expect(response.body.resolvedAt).toBeDefined();
    });
  });
  
  describe('POST /api/incidents/:id/updates', () => {
    it('should add an update to an incident when authenticated', async () => {
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
      
      const incident = await createTestIncident({
        title: 'API Outage',
        status: 'Investigating',
        type: 'Incident',
        serviceId: service.id
      });
      
      // Create auth token
      const token = server.createAuthToken({
        id: user.id,
        email: user.email,
        role: user.role
      });
      
      // Add update to incident
      const updateData = {
        message: 'Engineers are working on the issue',
        status: 'Identified'
      };
      
      const response = await request(server.app)
        .post(`/api/incidents/${incident.id}/updates`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(201);
      
      expect(response.body.message).toBe(updateData.message);
      expect(response.body.status).toBe(updateData.status);
      expect(response.body.incidentId).toBe(incident.id);
    });
  });
});
