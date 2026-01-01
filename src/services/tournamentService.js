import prisma from '../utils/prisma.js';
import { ApiError } from '../middlewares/errorHandler.js';

/**
 * Get all tournaments with filters and pagination
 */
export const getTournaments = async (filters) => {
  const { status, game, format, page = 1, limit = 10 } = filters;

  const where = {};
  if (status) where.status = status;
  if (game) where.game = { contains: game, mode: 'insensitive' };
  if (format) where.format = format;

  const skip = (page - 1) * limit;

  const [tournaments, total] = await Promise.all([
    prisma.tournament.findMany({
      where,
      include: {
        organizer: {
          select: { id: true, username: true, email: true },
        },
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.tournament.count({ where }),
  ]);

  return {
    tournaments,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get a single tournament by ID
 */
export const getTournamentById = async (id) => {
  const tournament = await prisma.tournament.findUnique({
    where: { id: parseInt(id) },
    include: {
      organizer: {
        select: { id: true, username: true, email: true },
      },
      registrations: {
        include: {
          player: { select: { id: true, username: true, email: true } },
          team: { select: { id: true, name: true, tag: true } },
        },
      },
    },
  });

  if (!tournament) {
    throw new ApiError(404, 'Tournament not found');
  }

  return tournament;
};

/**
 * Create a new tournament
 */
export const createTournament = async (data, organizerId) => {
  const { name, game, format, maxParticipants, prizePool, startDate, endDate } = data;

  // Validate startDate is in the future
  if (new Date(startDate) <= new Date()) {
    throw new ApiError(400, 'Start date must be in the future');
  }

  // Validate endDate if provided
  if (endDate && new Date(endDate) <= new Date(startDate)) {
    throw new ApiError(400, 'End date must be after start date');
  }

  const tournament = await prisma.tournament.create({
    data: {
      name,
      game,
      format,
      maxParticipants,
      prizePool: prizePool || 0,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      status: 'DRAFT',
      organizerId,
    },
    include: {
      organizer: {
        select: { id: true, username: true, email: true },
      },
    },
  });

  return tournament;
};

/**
 * Update a tournament
 */
export const updateTournament = async (id, data, userId, userRole) => {
  const tournament = await prisma.tournament.findUnique({
    where: { id: parseInt(id) },
  });

  if (!tournament) {
    throw new ApiError(404, 'Tournament not found');
  }

  // Check authorization
  if (tournament.organizerId !== userId && userRole !== 'ADMIN') {
    throw new ApiError(403, 'You are not authorized to update this tournament');
  }

  // Check if tournament can be modified
  if (['COMPLETED', 'CANCELLED'].includes(tournament.status)) {
    throw new ApiError(400, 'Cannot modify a completed or cancelled tournament');
  }

  // Validate dates if provided
  const startDate = data.startDate ? new Date(data.startDate) : tournament.startDate;
  const endDate = data.endDate ? new Date(data.endDate) : tournament.endDate;

  if (endDate && endDate <= startDate) {
    throw new ApiError(400, 'End date must be after start date');
  }

  const updated = await prisma.tournament.update({
    where: { id: parseInt(id) },
    data: {
      ...data,
      startDate: data.startDate ? new Date(data.startDate) : undefined,
      endDate: data.endDate ? new Date(data.endDate) : undefined,
    },
    include: {
      organizer: {
        select: { id: true, username: true, email: true },
      },
    },
  });

  return updated;
};

/**
 * Delete a tournament
 */
export const deleteTournament = async (id, userId, userRole) => {
  const tournament = await prisma.tournament.findUnique({
    where: { id: parseInt(id) },
    include: {
      registrations: {
        where: { status: 'CONFIRMED' },
      },
    },
  });

  if (!tournament) {
    throw new ApiError(404, 'Tournament not found');
  }

  // Check authorization
  if (tournament.organizerId !== userId && userRole !== 'ADMIN') {
    throw new ApiError(403, 'You are not authorized to delete this tournament');
  }

  // Check if tournament has confirmed registrations
  if (tournament.registrations.length > 0) {
    throw new ApiError(400, 'Cannot delete a tournament with confirmed registrations');
  }

  await prisma.tournament.delete({
    where: { id: parseInt(id) },
  });

  return { message: 'Tournament deleted successfully' };
};

/**
 * Update tournament status with validation
 */
export const updateTournamentStatus = async (id, newStatus, userId, userRole) => {
  const tournament = await prisma.tournament.findUnique({
    where: { id: parseInt(id) },
    include: {
      registrations: {
        where: { status: 'CONFIRMED' },
      },
    },
  });

  if (!tournament) {
    throw new ApiError(404, 'Tournament not found');
  }

  // Check authorization for COMPLETED status
  if (newStatus === 'COMPLETED' && userRole !== 'ADMIN') {
    throw new ApiError(403, 'Only admins can mark tournaments as completed');
  }

  // Check authorization for CANCELLED
  if (newStatus === 'CANCELLED' && tournament.organizerId !== userId && userRole !== 'ADMIN') {
    throw new ApiError(403, 'Only the organizer or admin can cancel this tournament');
  }

  // Validate transitions
  const validTransitions = {
    DRAFT: ['OPEN', 'CANCELLED'],
    OPEN: ['ONGOING', 'CANCELLED'],
    ONGOING: ['COMPLETED', 'CANCELLED'],
    COMPLETED: [],
    CANCELLED: [],
  };

  if (!validTransitions[tournament.status].includes(newStatus)) {
    throw new ApiError(400, `Cannot transition from ${tournament.status} to ${newStatus}`);
  }

  // Additional validation for OPEN transition
  if (newStatus === 'OPEN' && new Date(tournament.startDate) <= new Date()) {
    throw new ApiError(400, 'Cannot open a tournament with a start date in the past');
  }

  // Additional validation for ONGOING transition
  if (newStatus === 'ONGOING' && tournament.registrations.length < 2) {
    throw new ApiError(400, 'Tournament must have at least 2 confirmed participants');
  }

  const updated = await prisma.tournament.update({
    where: { id: parseInt(id) },
    data: { status: newStatus },
    include: {
      organizer: {
        select: { id: true, username: true, email: true },
      },
    },
  });

  return updated;
};
