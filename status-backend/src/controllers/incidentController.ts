import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/db';
import { Server } from 'socket.io';

// Get all incidents
export const getAllIncidents = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { type, status, serviceId } = req.query;
    
    // Build filters object based on query parameters
    const filters: any = {};
    
    if (type) {
      filters.type = type;
    }
    
    if (status) {
      // Handle 'active' as a special case
      if (status === 'active') {
        // For incidents, 'active' means not 'Resolved'
        // For maintenance, 'active' means not 'Completed'
        if (type === 'Incident') {
          filters.status = { not: 'Resolved' };
        } else if (type === 'Maintenance') {
          filters.status = { not: 'Completed' };
        }
      } else {
        filters.status = status;
      }
    }
    
    if (serviceId) {
      filters.serviceId = parseInt(serviceId as string, 10);
    }
    
    // Include additional relations if requested
    const include: any = {
      service: true,
    };
    
    if (req.query.includeUpdates === 'true') {
      include.updates = {
        orderBy: {
          createdAt: 'desc',
        },
      };
    }
    
    const incidents = await prisma.incident.findMany({
      where: filters,
      include,
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    res.json(incidents);
  } catch (error) {
    next(error);
  }
};

// Get incident by ID
export const getIncidentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const incident = await prisma.incident.findUnique({
      where: { id: parseInt(id) },
      include: {
        service: true,
        updates: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });
    
    if (!incident) {
      return res.status(404).json({ message: 'Incident not found' });
    }
    
    return res.status(200).json(incident);
  } catch (error) {
    console.error('Error getting incident:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Create a new incident
export const createIncident = async (req: Request, res: Response) => {
  try {
    const { title, description, status, type, serviceId } = req.body;
    
    // Validate request
    if (!title || !status || !serviceId || !type) {
      return res.status(400).json({ message: 'Title, status, type, and serviceId are required' });
    }
    
    // Verify service exists
    const service = await prisma.service.findUnique({
      where: { id: serviceId }
    });
    
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    
    // Create incident
    const incident = await prisma.incident.create({
      data: {
        title,
        description,
        status,
        type,
        serviceId,
      },
      include: {
        service: true
      }
    });
    
    // Create initial update
    await prisma.incidentUpdate.create({
      data: {
        message: `Incident created: ${description || title}`,
        status,
        incidentId: incident.id
      }
    });
    
    // Get Socket.io instance from request
    const io = req.app.get('io') as Server;
    if (io) {
      io.emit('incident:created', incident);
    }
    
    return res.status(201).json(incident);
  } catch (error) {
    console.error('Error creating incident:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Update an incident
export const updateIncident = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, status, type } = req.body;
    const { message } = req.body; // Optional update message
    
    // Validate incident exists
    const existingIncident = await prisma.incident.findUnique({
      where: { id: parseInt(id) },
      include: { service: true }
    });
    
    if (!existingIncident) {
      return res.status(404).json({ message: 'Incident not found' });
    }
    
    const data: any = {};
    
    if (title) data.title = title;
    if (description) data.description = description;
    if (type) data.type = type;
    
    // Handle status change and resolution
    if (status && status !== existingIncident.status) {
      data.status = status;
      
      // If resolving the incident, set resolvedAt
      if (status === 'Resolved' && existingIncident.status !== 'Resolved') {
        data.resolvedAt = new Date();
      } else if (status !== 'Resolved' && existingIncident.resolvedAt) {
        // If un-resolving, clear the resolvedAt date
        data.resolvedAt = null;
      }
    }
    
    // Update incident
    const incident = await prisma.incident.update({
      where: { id: parseInt(id) },
      data,
      include: { service: true }
    });
    
    // Create update if there's a message or status change
    if (message || (status && status !== existingIncident.status)) {
      await prisma.incidentUpdate.create({
        data: {
          message: message || `Status changed to ${status}`,
          status: status || existingIncident.status,
          incidentId: parseInt(id)
        }
      });
    }
    
    // Get Socket.io instance from request
    const io = req.app.get('io') as Server;
    if (io) {
      io.emit('incident:updated', incident);
    }
    
    return res.status(200).json(incident);
  } catch (error) {
    console.error('Error updating incident:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Delete an incident
export const deleteIncident = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Validate incident exists
    const existingIncident = await prisma.incident.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!existingIncident) {
      return res.status(404).json({ message: 'Incident not found' });
    }
    
    // Delete related updates first
    await prisma.incidentUpdate.deleteMany({
      where: { incidentId: parseInt(id) }
    });
    
    // Delete incident
    await prisma.incident.delete({
      where: { id: parseInt(id) }
    });
    
    // Get Socket.io instance from request
    const io = req.app.get('io') as Server;
    if (io) {
      io.emit('incident:deleted', { id: parseInt(id) });
    }
    
    return res.status(200).json({ message: 'Incident deleted successfully' });
  } catch (error) {
    console.error('Error deleting incident:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Add update to an incident
export const addIncidentUpdate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { message, status } = req.body;
    
    // Validate request
    if (!message) {
      return res.status(400).json({ message: 'Update message is required' });
    }
    
    // Verify incident exists
    const incident = await prisma.incident.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!incident) {
      return res.status(404).json({ message: 'Incident not found' });
    }
    
    // Create update
    const update = await prisma.incidentUpdate.create({
      data: {
        message,
        status: status || incident.status,
        incidentId: parseInt(id)
      }
    });
    
    // Update incident status if provided
    if (status && status !== incident.status) {
      await prisma.incident.update({
        where: { id: parseInt(id) },
        data: { 
          status,
          // If resolving the incident, set resolvedAt
          resolvedAt: status === 'Resolved' ? new Date() : incident.resolvedAt
        }
      });
    }
    
    // Get Socket.io instance from request
    const io = req.app.get('io') as Server;
    if (io) {
      io.emit('incident-update:created', {
        incidentId: parseInt(id),
        update
      });
    }
    
    return res.status(201).json(update);
  } catch (error) {
    console.error('Error adding incident update:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};
