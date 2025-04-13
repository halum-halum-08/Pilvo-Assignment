import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../utils/db';
import { ApiError } from './errorHandler';
import { Secret } from 'jsonwebtoken';

// Extend Request interface to include user property
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

// Authenticate JWT token
export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  // Get token from header
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  
  if (!token) {
    return next(new ApiError(401, 'Access denied. No token provided.'));
  }

  try {
    // Verify token
    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
    const decoded = jwt.verify(token, jwtSecret as Secret);
    req.user = decoded;
    next();
  } catch (error) {
    next(new ApiError(403, 'Invalid token.'));
  }
};

// Check if user is admin
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  
  next(new ApiError(403, 'Access denied. Admin permission required.'));
};

// Check if user is part of the team
export const isTeamMember = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Admin always has access
    if (req.user && req.user.role === 'admin') {
      return next();
    }
    
    const userId = req.user?.id;
    const { teamId } = req.params;
    
    // Convert teamId to number
    const teamIdNum = parseInt(teamId, 10);
    
    // Check if user is part of the team
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { teamId: true }
    });
    
    if (user && user.teamId === teamIdNum) {
      return next();
    }
    
    next(new ApiError(403, 'Access denied. You are not a member of this team.'));
  } catch (error) {
    next(error);
  }
};
