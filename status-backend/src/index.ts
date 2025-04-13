import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import prisma from './utils/db';
import { errorHandler } from './middleware/errorHandler';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import morgan from 'morgan';

// Import routes
import authRoutes from './routes/authRoutes';
import serviceRoutes from './routes/serviceRoutes';
import incidentRoutes from './routes/incidentRoutes';
import teamRoutes from './routes/teamRoutes';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet()); // Add security headers

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use('/api/', limiter);

// Update CORS configuration to be more permissive in development
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:3000'];

console.log('Allowed origins:', allowedOrigins);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, curl, etc)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
        callback(null, true);
      } else {
        console.warn(`Origin ${origin} not allowed by CORS`);
        callback(null, true); // In development, allow all origins but log warnings
      }
    },
    credentials: true,
  })
);

// Parse request body
app.use(express.json());
app.use(morgan('dev'));

// Create HTTP server
const server = http.createServer(app);

// Set up Socket.IO
const io = new Server(server, {
  cors: {
    origin: function(origin, callback) {
      // Allow requests with no origin (like mobile apps, curl, etc)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
        callback(null, true);
      } else {
        console.warn(`Socket.IO: Origin ${origin} not allowed by CORS`);
        callback(null, true); // In development, allow all origins but log warnings
      }
    },
    methods: ["GET", "POST"],
    credentials: true
  },
});

// Store io instance on app for use in controllers
app.set('io', io);

// Socket.IO connection
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Join room for specific service status updates
  socket.on('joinServiceRoom', (serviceId) => {
    socket.join(`service-${serviceId}`);
    console.log(`Socket ${socket.id} joined room for service ${serviceId}`);
  });
  
  // Join room for specific incident updates
  socket.on('joinIncidentRoom', (incidentId) => {
    socket.join(`incident-${incidentId}`);
    console.log(`Socket ${socket.id} joined room for incident ${incidentId}`);
  });
  
  // Handle manual service status updates from clients
  socket.on('updateServiceStatus', async (data) => {
    try {
      const { serviceId, status } = data;
      
      // Update the service in the database
      const service = await prisma.service.update({
        where: { id: serviceId },
        data: { status }
      });
      
      // Broadcast to all clients
      io.emit('service:updated', service);
      
      // Also emit to specific service room
      io.to(`service-${serviceId}`).emit('serviceStatusChanged', {
        serviceId,
        status,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating service status via socket:', error);
      socket.emit('error', { message: 'Failed to update service status' });
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/teams', teamRoutes);

// Serve static files from the React frontend app in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  const staticPath = path.join(__dirname, '../../status-frontend/build');
  app.use(express.static(staticPath));
  
  // Any other route should point to React app
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(staticPath, 'index.html'));
    }
  });
}

// Root route (only in development)
if (process.env.NODE_ENV !== 'production') {
  app.get('/', (req, res) => {
    res.json({ message: 'Welcome to Status Page API' });
  });
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0'
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0'
  });
});

// Add debug info endpoint
app.get('/api/debug', (req, res) => {
  res.status(200).json({
    env: process.env.NODE_ENV,
    serverTime: new Date().toISOString(),
    allowedOrigins,
    apiBasePath: '/api',
  });
});

// 404 error handler
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    res.status(404).json({
      success: false,
      message: 'API endpoint not found'
    });
  } else {
    next();
  }
});

// Error handling middleware
app.use(errorHandler);

// Make sure error logging is more verbose
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Server error:', err);
  
  const statusCode = err.status || 500;
  const message = process.env.NODE_ENV === 'production' 
    ? 'Internal Server Error' 
    : err.message || 'Something went wrong';
  
  res.status(statusCode).json({
    error: message,
    status: statusCode
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`
=======================================
✅ Server running on port ${PORT}
📝 Environment: ${process.env.NODE_ENV || 'development'}
🔑 Auth enabled: ${!!process.env.JWT_SECRET}
📊 Allowed origins: ${process.env.ALLOWED_ORIGINS || '*'}
=======================================
  `);
});

// Handle server shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  await prisma.$disconnect();
  server.close(() => {
    console.log('HTTP server closed');
  });
});

// For testing purposes
export { app, server, io };
