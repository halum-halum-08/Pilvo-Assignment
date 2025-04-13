import request from 'supertest';
import { setupTestServer } from './utils/testServer';
import { createTestUser, cleanDatabase } from './utils/testDb';
import { TestServer } from './utils/testServer';
import jwt from 'jsonwebtoken';

describe('Authentication API', () => {
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
  
  describe('POST /api/auth/register', () => {
    it('should register a new user and return a token', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        organization: 'Test Org'
      };
      
      const response = await request(server.app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);
      
      expect(response.body.success).toBe(true);
      expect(response.body.user).toBeDefined();
      expect(response.body.token).toBeDefined();
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.user.name).toBe(userData.name);
      expect(response.body.user.organization).toBe(userData.organization);
      expect(response.body.user.password).toBeUndefined();
      
      // Verify token
      const decoded = jwt.verify(
        response.body.token,
        process.env.JWT_SECRET || 'test-jwt-secret-key'
      );
      expect(decoded).toBeDefined();
    });
    
    it('should return 400 if email already exists', async () => {
      // Create user first
      await createTestUser({
        name: 'Existing User',
        email: 'test@example.com',
        password: 'password123'
      });
      
      // Try to register with same email
      const response = await request(server.app)
        .post('/api/auth/register')
        .send({
          name: 'New User',
          email: 'test@example.com',
          password: 'password123'
        })
        .expect(400);
      
      expect(response.body.success).toBe(false);
    });
    
    it('should validate required fields', async () => {
      const response = await request(server.app)
        .post('/api/auth/register')
        .send({
          // Missing required fields
          email: 'test@example.com'
        })
        .expect(400);
      
      expect(response.body.success).toBe(false);
    });
  });
  
  describe('POST /api/auth/login', () => {
    it('should login and return a token for valid credentials', async () => {
      // Create user first
      await createTestUser({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      });
      
      // Login
      const response = await request(server.app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        })
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.user).toBeDefined();
      expect(response.body.token).toBeDefined();
    });
    
    it('should return 401 for invalid credentials', async () => {
      // Create user first
      await createTestUser({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      });
      
      // Login with wrong password
      const response = await request(server.app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        })
        .expect(401);
      
      expect(response.body.success).toBe(false);
    });
  });
  
  describe('GET /api/auth/me', () => {
    it('should return the current user for a valid token', async () => {
      // Create user first
      const user = await createTestUser({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      });
      
      // Create token
      const token = server.createAuthToken({
        id: user.id,
        email: user.email,
        role: user.role
      });
      
      // Get current user
      const response = await request(server.app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe(user.email);
    });
    
    it('should return 401 for no token', async () => {
      const response = await request(server.app)
        .get('/api/auth/me')
        .expect(401);
      
      expect(response.body.success).toBe(false);
    });
    
    it('should return 403 for invalid token', async () => {
      const response = await request(server.app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalidtoken')
        .expect(403);
      
      expect(response.body.success).toBe(false);
    });
  });
});
