import express from 'express';
import { authenticateToken, isAdmin } from '../middleware/auth';
import type { Request, Response } from 'express';

const router = express.Router();

// Define route handler functions
const getAllTeams = (req: Request, res: Response) => {
  res.json([
    {
      id: 1,
      name: 'Engineering',
      organization: 'Example Corp',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 2,
      name: 'DevOps',
      organization: 'Example Corp',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]);
};

const getTeamById = (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  res.json({
    id,
    name: `Team ${id}`,
    organization: 'Example Corp',
    createdAt: new Date(),
    updatedAt: new Date()
  });
};

const createTeam = (req: Request, res: Response) => {
  res.status(201).json({ ...req.body, id: 3 });
};

const updateTeam = (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  res.json({ ...req.body, id });
};

const deleteTeam = (req: Request, res: Response) => {
  res.json({ success: true });
};

const addUserToTeam = (req: Request, res: Response) => {
  const { teamId, userId } = req.params;
  res.json({ 
    success: true, 
    message: `User ${userId} added to team ${teamId}` 
  });
};

const removeUserFromTeam = (req: Request, res: Response) => {
  const { teamId, userId } = req.params;
  res.json({ 
    success: true, 
    message: `User ${userId} removed from team ${teamId}` 
  });
};

// Apply the route handlers with type assertions
router.get('/', authenticateToken as any, getAllTeams as any);
router.get('/:id', authenticateToken as any, getTeamById as any);
router.post('/', authenticateToken as any, createTeam as any);
router.put('/:id', authenticateToken as any, updateTeam as any);
router.delete('/:id', authenticateToken as any, isAdmin as any, deleteTeam as any);
router.post('/:teamId/users/:userId', authenticateToken as any, isAdmin as any, addUserToTeam as any);
router.delete('/:teamId/users/:userId', authenticateToken as any, isAdmin as any, removeUserFromTeam as any);

export default router;
