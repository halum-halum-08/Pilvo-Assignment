import express from 'express';
import { authenticateToken, isAdmin } from '../middleware/auth';
import type { Request, Response } from 'express';

const router = express.Router();

// Get all services (public)
router.get('/', (req, res) => {
  res.json([
    { 
      id: 1, 
      name: 'API Service', 
      description: 'Main API service',
      status: 'Operational',
      teamId: 1,
      uptime: 100,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    { 
      id: 2, 
      name: 'Website', 
      description: 'Company website',
      status: 'Degraded Performance',
      teamId: 1,
      uptime: 98,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]);
});

// Other routes that would require real implementation
router.get('/:id', (req, res) => {
  res.json({ 
    id: parseInt(req.params.id), 
    name: 'Example Service', 
    status: 'Operational',
    description: 'This is an example service',
    teamId: 1,
    uptime: 99.9,
    createdAt: new Date(),
    updatedAt: new Date()
  });
});

const postHandler = (req: Request, res: Response) => {
  res.status(201).json({ ...req.body, id: 999 });
};

const putHandler = (req: Request, res: Response) => {
  res.json({ ...req.body, id: parseInt(req.params.id) });
};

const deleteHandler = (req: Request, res: Response) => {
  res.json({ success: true, message: 'Service deleted successfully' });
};

router.post('/', authenticateToken as any, isAdmin as any, postHandler);
router.put('/:id', authenticateToken as any, isAdmin as any, putHandler);
router.delete('/:id', authenticateToken as any, isAdmin as any, deleteHandler);

export default router;
