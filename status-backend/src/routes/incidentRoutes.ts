import express from 'express';
import { authenticateToken } from '../middleware/auth';
import type { Request, Response } from 'express';

const router = express.Router();

// Get all incidents (public)
router.get('/', (req, res) => {
  res.json([
    {
      id: 1,
      title: 'API Outage',
      description: 'The API is experiencing issues',
      status: 'Investigating',
      type: 'Incident',
      serviceId: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 2,
      title: 'Scheduled Maintenance',
      description: 'Planned database update',
      status: 'Scheduled',
      type: 'Maintenance',
      serviceId: 2,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]);
});

// Get incident by ID (public)
router.get('/:id', (req, res) => {
  res.json({
    id: parseInt(req.params.id),
    title: 'Example Incident',
    description: 'This is an example incident',
    status: 'Investigating',
    type: 'Incident',
    serviceId: 1,
    service: {
      id: 1,
      name: 'API Service'
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    updates: [
      {
        id: 1,
        message: 'We are investigating the issue',
        status: 'Investigating',
        incidentId: parseInt(req.params.id),
        createdAt: new Date()
      }
    ]
  });
});

// Protected routes
const createHandler = (req: Request, res: Response) => {
  res.status(201).json({ ...req.body, id: 999 });
};

const updateHandler = (req: Request, res: Response) => {
  res.json({ ...req.body, id: parseInt(req.params.id) });
};

const addUpdateHandler = (req: Request, res: Response) => {
  res.status(201).json({
    id: 999,
    message: req.body.message,
    status: req.body.status,
    incidentId: parseInt(req.params.id),
    createdAt: new Date()
  });
};

router.post('/', authenticateToken as any, createHandler);
router.put('/:id', authenticateToken as any, updateHandler);
router.post('/:id/updates', authenticateToken as any, addUpdateHandler);

export default router;
