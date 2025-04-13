import { Request, Response } from 'express';
import prisma from '../utils/db';
import { Server } from 'socket.io';

// Get all services
export const getAllServices = async (req: Request, res: Response) => {
  try {
    const services = await prisma.service.findMany({
      include: {
        team: true,
        incidents: {
          where: {
            status: { not: 'Resolved' }
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 5
        }
      }
    });
    
    return res.status(200).json(services);
  } catch (error) {
    console.error('Error getting services:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Get service by ID
export const getServiceById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const service = await prisma.service.findUnique({
      where: { id: parseInt(id) },
      include: {
        team: true,
        incidents: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });
    
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    
    return res.status(200).json(service);
  } catch (error) {
    console.error('Error getting service:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Create a new service
export const createService = async (req: Request, res: Response) => {
  try {
    const { name, description, status, teamId } = req.body;
    
    // Validate request
    if (!name || !status || !teamId) {
      return res.status(400).json({ message: 'Name, status, and teamId are required' });
    }
    
    // Verify team exists
    const team = await prisma.team.findUnique({
      where: { id: teamId }
    });
    
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    
    // Create service
    const service = await prisma.service.create({
      data: {
        name,
        description,
        status,
        teamId,
      }
    });
    
    // Get Socket.io instance from request (set in app.ts)
    const io = req.app.get('io') as Server;
    if (io) {
      io.emit('service:created', service);
    }
    
    return res.status(201).json(service);
  } catch (error) {
    console.error('Error creating service:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Update a service
export const updateService = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, status } = req.body;
    
    // Validate service exists
    const existingService = await prisma.service.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!existingService) {
      return res.status(404).json({ message: 'Service not found' });
    }
    
    // Update service
    const service = await prisma.service.update({
      where: { id: parseInt(id) },
      data: {
        name,
        description,
        status,
      }
    });
    
    // Get Socket.io instance from request
    const io = req.app.get('io') as Server;
    if (io) {
      io.emit('service:updated', service);
    }
    
    return res.status(200).json(service);
  } catch (error) {
    console.error('Error updating service:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Delete a service
export const deleteService = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Validate service exists
    const existingService = await prisma.service.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!existingService) {
      return res.status(404).json({ message: 'Service not found' });
    }
    
    // Check if service has any incidents
    const incidents = await prisma.incident.count({
      where: { serviceId: parseInt(id) }
    });
    
    if (incidents > 0) {
      return res.status(400).json({ message: 'Cannot delete a service with incidents. Delete all incidents first.' });
    }
    
    // Delete service
    await prisma.service.delete({
      where: { id: parseInt(id) }
    });
    
    // Get Socket.io instance from request
    const io = req.app.get('io') as Server;
    if (io) {
      io.emit('service:deleted', { id: parseInt(id) });
    }
    
    return res.status(200).json({ message: 'Service deleted successfully' });
  } catch (error) {
    console.error('Error deleting service:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};
