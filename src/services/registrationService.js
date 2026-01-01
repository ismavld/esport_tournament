import prisma from '../utils/prisma.js';
import { ApiError } from '../middlewares/errorHandler.js';

/**
 * Register a player or team to a tournament
 */
export const registerToTournament = async (tournamentId, data, userId) => {
  const { playerId, teamId } = data;

  // Parse IDs
  const parsedTournamentId = parseInt(tournamentId);
  const parsedPlayerId = playerId ? parseInt(playerId) : null;
  const parsedTeamId = teamId ? parseInt(teamId) : null;

  // Get tournament
  const tournament = await prisma.tournament.findUnique({
    where: { id: parsedTournamentId },
    include: {
      registrations: {
        where: { status: 'CONFIRMED' },
      },
    },
  });

  if (!tournament) {
    throw new ApiError(404, 'Tournament not found');
  }

  // Tournament must be OPEN
  if (tournament.status !== 'OPEN') {
    throw new ApiError(400, 'Tournament is not open for registrations');
  }

  // Check participant limit
  if (tournament.registrations.length >= tournament.maxParticipants) {
    throw new ApiError(400, 'Tournament is full');
  }

  // Validate format consistency
  if (tournament.format === 'SOLO') {
    if (!parsedPlayerId || parsedTeamId) {
      throw new ApiError(400, 'Solo tournaments only accept individual player registrations');
    }
  } else if (tournament.format === 'TEAM') {
    if (!parsedTeamId || parsedPlayerId) {
      throw new ApiError(400, 'Team tournaments only accept team registrations');
    }
  }

  // Check if already registered
  if (parsedPlayerId) {
    const existingReg = await prisma.registration.findFirst({
      where: {
        tournamentId: parsedTournamentId,
        playerId: parsedPlayerId,
      },
    });
    if (existingReg) {
      throw new ApiError(400, 'Player already registered for this tournament');
    }
  } else if (parsedTeamId) {
    const existingReg = await prisma.registration.findFirst({
      where: {
        tournamentId: parsedTournamentId,
        teamId: parsedTeamId,
      },
    });
    if (existingReg) {
      throw new ApiError(400, 'Team already registered for this tournament');
    }

    // Check if user is team captain
    const team = await prisma.team.findUnique({
      where: { id: parsedTeamId },
    });

    if (!team) {
      throw new ApiError(404, 'Team not found');
    }

    if (team.captainId !== userId) {
      throw new ApiError(403, 'Only the team captain can register the team');
    }
  }

  // Create registration
  const registration = await prisma.registration.create({
    data: {
      tournamentId: parsedTournamentId,
      playerId: parsedPlayerId,
      teamId: parsedTeamId,
      status: 'PENDING',
    },
    include: {
      player: {
        select: { id: true, username: true, email: true },
      },
      team: {
        select: { id: true, name: true, tag: true },
      },
    },
  });

  return registration;
};

/**
 * Get registrations for a tournament
 */
export const getTournamentRegistrations = async (tournamentId) => {
  const tournament = await prisma.tournament.findUnique({
    where: { id: parseInt(tournamentId) },
  });

  if (!tournament) {
    throw new ApiError(404, 'Tournament not found');
  }

  const registrations = await prisma.registration.findMany({
    where: { tournamentId: parseInt(tournamentId) },
    include: {
      player: {
        select: { id: true, username: true, email: true },
      },
      team: {
        select: { id: true, name: true, tag: true },
      },
    },
    orderBy: { registeredAt: 'desc' },
  });

  return registrations;
};

/**
 * Update registration status
 */
export const updateRegistrationStatus = async (tournamentId, registrationId, newStatus, userId, userRole) => {
  const registration = await prisma.registration.findUnique({
    where: { id: parseInt(registrationId) },
    include: {
      tournament: true,
      player: true,
      team: true,
    },
  });

  if (!registration) {
    throw new ApiError(404, 'Registration not found');
  }

  // Authorization check
  const isOrganizer = registration.tournament.organizerId === userId;
  const isParticipant = registration.playerId === userId || (registration.team && registration.team.captainId === userId);
  const isAdmin = userRole === 'ADMIN';

  if (!isOrganizer && !isParticipant && !isAdmin) {
    throw new ApiError(403, 'You are not authorized to update this registration');
  }

  // Validate transition
  const currentStatus = registration.status;
  const validTransitions = {
    PENDING: ['CONFIRMED', 'REJECTED', 'WITHDRAWN'],
    CONFIRMED: ['WITHDRAWN'],
    REJECTED: [],
    WITHDRAWN: [],
  };

  if (!validTransitions[currentStatus].includes(newStatus)) {
    throw new ApiError(400, `Cannot transition from ${currentStatus} to ${newStatus}`);
  }

  const updated = await prisma.registration.update({
    where: { id: parseInt(registrationId) },
    data: {
      status: newStatus,
      confirmedAt: newStatus === 'CONFIRMED' ? new Date() : undefined,
    },
    include: {
      player: {
        select: { id: true, username: true, email: true },
      },
      team: {
        select: { id: true, name: true, tag: true },
      },
    },
  });

  return updated;
};

/**
 * Delete (cancel) a registration
 */
export const cancelRegistration = async (tournamentId, registrationId, userId, userRole) => {
  const registration = await prisma.registration.findUnique({
    where: { id: parseInt(registrationId) },
    include: {
      tournament: true,
      player: true,
      team: true,
    },
  });

  if (!registration) {
    throw new ApiError(404, 'Registration not found');
  }

  // Check if tournament matches
  if (registration.tournamentId !== parseInt(tournamentId)) {
    throw new ApiError(400, 'Registration does not belong to this tournament');
  }

  // Authorization check
  const isOrganizer = registration.tournament.organizerId === userId;
  const isParticipant = registration.playerId === userId || (registration.team && registration.team.captainId === userId);
  const isAdmin = userRole === 'ADMIN';

  if (!isOrganizer && !isParticipant && !isAdmin) {
    throw new ApiError(403, 'You are not authorized to cancel this registration');
  }

  // CONFIRMED registrations cannot be deleted, only WITHDRAWN via PATCH
  if (registration.status === 'CONFIRMED') {
    throw new ApiError(400, 'Confirmed registrations cannot be deleted. Use PATCH to change status to WITHDRAWN instead.');
  }

  // Only PENDING can be deleted
  if (registration.status !== 'PENDING') {
    throw new ApiError(400, `Cannot delete ${registration.status} registrations`);
  }

  await prisma.registration.delete({
    where: { id: parseInt(registrationId) },
  });

  return { message: 'Registration cancelled successfully' };
};
