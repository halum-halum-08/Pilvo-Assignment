import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import { io as ioc } from 'socket.io-client';
import type { Socket as ClientSocket } from 'socket.io-client';
import jwt from 'jsonwebtoken';
import { errorHandler } from '../../middleware/errorHandler';

// Import routes
import authRoutes from '../../routes/authRoutes';
import serviceRoutes from '../../routes/serviceRoutes';
import incidentRoutes from '../../routes/incidentRoutes';
import teamRoutes from '../../routes/teamRoutes';

export type TestServer = {
  app: express.Application;
  httpServer: http.Server;
  io: Server;
  serverSocket: Server;
  clientSocket: ClientSocket;
  port: number;
  url: string;
  createAuthToken: (userData: any) => string;
  close: () => Promise<void>;
};

export const setupTestServer = async (): Promise<TestServer> => {
  const app = express();
  const port = Number(process.env.PORT) || 4000;
  const url = `http://localhost:${port}`;
  
  // Configure middleware
  app.use(cors());
  app.use(express.json());
  
  // Create HTTP server
  const httpServer = http.createServer(app);
  
  // Set up Socket.IO server
  const io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });
  
  // Store io instance on app
  app.set('io', io);
  
  // Configure routes
  app.use('/api/auth', authRoutes);
  app.use('/api/services', serviceRoutes);
  app.use('/api/incidents', incidentRoutes);
  app.use('/api/teams', teamRoutes);
  
  // Error handling
  app.use(errorHandler);
  
  // Start server
  await new Promise<void>((resolve) => {
    httpServer.listen(port, () => {
      resolve();
    });
  });
  
  // Socket.IO connection handler
  io.on('connection', (socket) => {
    socket.on('joinServiceRoom', (serviceId) => {
      socket.join(`service-${serviceId}`);
    });
    
    socket.on('joinIncidentRoom', (incidentId) => {
      socket.join(`incident-${incidentId}`);
    });
    
    socket.on('disconnect', () => {
      // Handle disconnect
    });
  });
  
  // Create client socket
  const clientSocket = ioc(url);
  await new Promise<void>((resolve) => {
    clientSocket.on('connect', () => {
      resolve();
    });
    clientSocket.connect();
  });
  
  // Helper to create auth tokens for testing
  const createAuthToken = (userData: any) => {
    const secret = process.env.JWT_SECRET || 'test-jwt-secret-key';
    return jwt.sign(userData, secret, { expiresIn: '1h' });
  };
  
  // Return test server components
  return {
    app,
    httpServer,
    io,
    serverSocket: io,
    clientSocket,
    port,
    url,
    createAuthToken,
    close: async () => {
      return new Promise((resolve) => {
        clientSocket.close();
        httpServer.close(() => {
          resolve();
        });
      });
    }
  };
};
