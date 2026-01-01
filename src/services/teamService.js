import prisma from '../utils/prisma.js';
import { ApiError } from '../middlewares/errorHandler.js';

/**
 * Get all teams
 */
export const getTeams = async () => {
  const teams = await prisma.team.findMany({
    include: {
      captain: {
        select: { id: true, username: true, email: true, role: true },
      },
      members: {
        select: { id: true, username: true, email: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return teams;
};

/**
 * Get a single team by ID
 */
export const getTeamById = async (id) => {
  const team = await prisma.team.findUnique({
    where: { id: parseInt(id) },
    include: {
      captain: {
        select: { id: true, username: true, email: true, role: true },
      },
      members: {
        select: { id: true, username: true, email: true },
      },
    },
  });

  if (!team) {
    throw new ApiError(404, 'Team not found');
  }

  return team;
};

/**
 * Create a new team
 */
export const createTeam = async (data, userId) => {
  const { name, tag } = data;

  // Get user to verify role
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (user.role !== 'PLAYER') {
    throw new ApiError(400, 'Only players can create teams');
  }

  // Create team with user as captain
  const team = await prisma.team.create({
    data: {
      name,
      tag,
      captainId: userId,
    },
    include: {
      captain: {
        select: { id: true, username: true, email: true, role: true },
      },
      members: {
        select: { id: true, username: true, email: true },
      },
    },
  });

  return team;
};

/**
 * Update a team
 */
export const updateTeam = async (id, data, userId) => {
  const team = await prisma.team.findUnique({
    where: { id: parseInt(id) },
  });

  if (!team) {
    throw new ApiError(404, 'Team not found');
  }

  // Check authorization - only captain can modify
  if (team.captainId !== userId) {
    throw new ApiError(403, 'Only the team captain can modify this team');
  }

  const updated = await prisma.team.update({
    where: { id: parseInt(id) },
    data,
    include: {
      captain: {
        select: { id: true, username: true, email: true, role: true },
      },
      members: {
        select: { id: true, username: true, email: true },
      },
    },
  });

  return updated;
};

/**
 * Delete a team
 */
export const deleteTeam = async (id, userId) => {
  const team = await prisma.team.findUnique({
    where: { id: parseInt(id) },
    include: {
      _count: {
        select: {
          registrations: {
            where: {
              status: { in: ['PENDING', 'CONFIRMED'] },
            },
          },
        },
      },
    },
  });

  if (!team) {
    throw new ApiError(404, 'Team not found');
  }

  // Check authorization - only captain can delete
  if (team.captainId !== userId) {
    throw new ApiError(403, 'Only the team captain can delete this team');
  }

  // Check if team is registered in active tournaments
  const tournaments = await prisma.tournament.findMany({
    where: {
      status: { in: ['OPEN', 'ONGOING'] },
      registrations: {
        some: {
          teamId: parseInt(id),
          status: { in: ['PENDING', 'CONFIRMED'] },
        },
      },
    },
  });

  if (tournaments.length > 0) {
    throw new ApiError(400, 'Cannot delete a team registered in active tournaments');
  }

  await prisma.team.delete({
    where: { id: parseInt(id) },
  });

  return { message: 'Team deleted successfully' };
};
