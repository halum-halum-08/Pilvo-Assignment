import { Request, Response } from 'express';
import { authenticateToken, isAdmin, isTeamMember } from '../middleware/auth';
import jwt from 'jsonwebtoken';

// Mock Express Request and Response
const mockRequest = () => {
  const req: Partial<Request> = {
    headers: {},
    user: undefined
  };
  return req as Request;
};

const mockResponse = () => {
  const res: Partial<Response> = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis()
  };
  return res as Response;
};

describe('Auth Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('authenticateToken', () => {
    it('should set req.user for a valid token', () => {
      const req = mockRequest();
      const res = mockResponse();
      const next = jest.fn();
      
      // Mock jwt verify
      const userData = { id: 1, email: 'user@example.com', role: 'user' };
      jest.spyOn(jwt, 'verify').mockImplementation(() => userData);
      
      // Set token in header
      req.headers.authorization = 'Bearer valid-token';
      
      // Call middleware
      authenticateToken(req, res, next);
      
      // Check that next was called and user was set
      expect(next).toHaveBeenCalled();
      expect(req.user).toEqual(userData);
    });
    
    it('should return 401 for missing token', () => {
      const req = mockRequest();
      const res = mockResponse();
      const next = jest.fn();
      
      // Call middleware (no token)
      authenticateToken(req, res, next);
      
      // Check that next was called with error
      expect(next).toHaveBeenCalled();
      expect(next.mock.calls[0][0].statusCode).toBe(401);
    });
    
    it('should return 403 for invalid token', () => {
      const req = mockRequest();
      const res = mockResponse();
      const next = jest.fn();
      
      // Mock jwt verify to throw error
      jest.spyOn(jwt, 'verify').mockImplementation(() => {
        throw new jwt.JsonWebTokenError('invalid token');
      });
      
      // Set token in header
      req.headers.authorization = 'Bearer invalid-token';
      
      // Call middleware
      authenticateToken(req, res, next);
      
      // Check that next was called with error
      expect(next).toHaveBeenCalled();
      expect(next.mock.calls[0][0].statusCode).toBe(403);
    });
  });
  
  describe('isAdmin', () => {
    it('should call next() if user is admin', () => {
      const req = mockRequest();
      const res = mockResponse();
      const next = jest.fn();
      
      // Set admin user
      req.user = { id: 1, role: 'admin' };
      
      // Call middleware
      isAdmin(req, res, next);
      
      // Check that next was called without error
      expect(next).toHaveBeenCalledWith();
    });
    
    it('should return 403 if user is not admin', () => {
      const req = mockRequest();
      const res = mockResponse();
      const next = jest.fn();
      
      // Set non-admin user
      req.user = { id: 1, role: 'user' };
      
      // Call middleware
      isAdmin(req, res, next);
      
      // Check that next was called with error
      expect(next).toHaveBeenCalled();
      expect(next.mock.calls[0][0].statusCode).toBe(403);
    });
  });
  
  describe('isTeamMember', () => {
    it('should call next() if user is admin', async () => {
      const req = mockRequest();
      const res = mockResponse();
      const next = jest.fn();
      
      // Set admin user
      req.user = { id: 1, role: 'admin' };
      
      // Set params
      req.params = { teamId: '1' };
      
      // Call middleware
      await isTeamMember(req, res, next);
      
      // Check that next was called without error
      expect(next).toHaveBeenCalledWith();
    });
    
    it('should call next() if user is team member', async () => {
      const req = mockRequest();
      const res = mockResponse();
      const next = jest.fn();
      
      // Set team member
      req.user = { id: 1, role: 'user', teamId: 1 };
      
      // Set params
      req.params = { teamId: '1' };
      
      // Call middleware
      await isTeamMember(req, res, next);
      
      // Check that next was called without error
      expect(next).toHaveBeenCalledWith();
    });
    
    it('should return 403 if user is not team member', async () => {
      const req = mockRequest();
      const res = mockResponse();
      const next = jest.fn();
      
      // Set non-team member
      req.user = { id: 1, role: 'user', teamId: 2 };
      
      // Set params
      req.params = { teamId: '1' };
      
      // Call middleware
      await isTeamMember(req, res, next);
      
      // Check that next was called with error
      expect(next).toHaveBeenCalled();
      expect(next.mock.calls[0][0].statusCode).toBe(403);
    });
  });
});
