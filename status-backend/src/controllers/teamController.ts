import { Request, Response } from 'express';
import prisma from '../utils/db';

// Get all teams
export const getAllTeams = async (req: Request, res: Response) => {
  try {
    // Only admins can see all teams or users can see teams they belong to
    let teams;
    
    if (req.user.role === 'admin') {
      teams = await prisma.team.findMany({
        include: {
          users: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          },
          services: true
        }
      });
    } else {
      teams = await prisma.team.findMany({
        where: {
          users: {
            some: {
              id: req.user.id
            }
          }
        },
        include: {
          users: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          },
          services: true
        }
      });
    }
    
    return res.status(200).json(teams);
  } catch (error) {
    console.error('Error getting teams:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Get team by ID
export const getTeamById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Check if user has access to this team
    if (req.user.role !== 'admin' && req.user.teamId !== parseInt(id)) {
      return res.status(403).json({ message: 'You do not have access to this team' });
    }
    
    const team = await prisma.team.findUnique({
      where: { id: parseInt(id) },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        services: {
          include: {
            incidents: {
              where: {
                status: { not: 'Resolved' }
              }
            }
          }
        }
      }
    });
    
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    
    return res.status(200).json(team);
  } catch (error) {
    console.error('Error getting team:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Create a new team
export const createTeam = async (req: Request, res: Response) => {
  try {
    const { name, organization } = req.body;
    
    // Validate request
    if (!name) {
      return res.status(400).json({ message: 'Team name is required' });
    }
    
    // Create team
    const team = await prisma.team.create({
      data: {
        name,
        organization
      }
    });
    
    // If the request included userIds to add to the team
    if (req.body.userIds && Array.isArray(req.body.userIds)) {
      await prisma.user.updateMany({
        where: {
          id: {
            in: req.body.userIds.map((id: string) => parseInt(id))
          }
        },
        data: {
          teamId: team.id
        }
      });
    }
    
    // Add the creator to the team if they're not an admin
    if (req.user.role !== 'admin') {
      await prisma.user.update({
        where: { id: req.user.id },
        data: { teamId: team.id }
      });
    }
    
    return res.status(201).json(team);
  } catch (error) {
    console.error('Error creating team:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Update a team
export const updateTeam = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, organization } = req.body;
    
    // Validate team exists
    const existingTeam = await prisma.team.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!existingTeam) {
      return res.status(404).json({ message: 'Team not found' });
    }
    
    // Update team
    const team = await prisma.team.update({
      where: { id: parseInt(id) },
      data: {
        name,
        organization
      }
    });
    
    return res.status(200).json(team);
  } catch (error) {
    console.error('Error updating team:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Delete a team
export const deleteTeam = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Validate team exists
    const existingTeam = await prisma.team.findUnique({
      where: { id: parseInt(id) },
      include: {
        services: true,
        users: true
      }
    });
    
    if (!existingTeam) {
      return res.status(404).json({ message: 'Team not found' });
    }
    
    // Check if team has any services
    if (existingTeam.services.length > 0) {
      return res.status(400).json({ message: 'Cannot delete a team with services. Delete all services first.' });
    }
    
    // Remove team association from users
    await prisma.user.updateMany({
      where: { teamId: parseInt(id) },
      data: { teamId: null }
    });
    
    // Delete team
    await prisma.team.delete({
      where: { id: parseInt(id) }
    });
    
    return res.status(200).json({ message: 'Team deleted successfully' });
  } catch (error) {
    console.error('Error deleting team:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Add a user to a team
export const addUserToTeam = async (req: Request, res: Response) => {
  try {
    const { teamId, userId } = req.params;
    
    // Validate user and team exist
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) }
    });
    
    const team = await prisma.team.findUnique({
      where: { id: parseInt(teamId) }
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    
    // Update user's team
    await prisma.user.update({
      where: { id: parseInt(userId) },
      data: { teamId: parseInt(teamId) }
    });
    
    return res.status(200).json({ message: 'User added to team successfully' });
  } catch (error) {
    console.error('Error adding user to team:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Remove a user from a team
export const removeUserFromTeam = async (req: Request, res: Response) => {
  try {
    const { teamId, userId } = req.params;
    
    // Validate user and team exist
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) }
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (user.teamId !== parseInt(teamId)) {
      return res.status(400).json({ message: 'User is not a member of this team' });
    }
    
    // Remove user from team
    await prisma.user.update({
      where: { id: parseInt(userId) },
      data: { teamId: null }
    });
    
    return res.status(200).json({ message: 'User removed from team successfully' });
  } catch (error) {
    console.error('Error removing user from team:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};
