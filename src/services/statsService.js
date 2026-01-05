import prisma from '../utils/prisma.js';
import { ApiError } from '../middlewares/errorHandler.js';

/**
 * Get comprehensive statistics for a tournament
 * @param {string} tournamentId - The tournament ID
 * @returns {Object} Tournament statistics
 */
export const getTournamentStats = async (tournamentId) => {
  const id = parseInt(tournamentId);
  
  const tournament = await prisma.tournament.findUnique({
    where: { id },
    include: {
      registrations: true,
    },
  });

  if (!tournament) {
    throw new ApiError(404, 'Tournament not found');
  }

  const registrations = tournament.registrations;

  // Count registrations by status
  const statusBreakdown = {
    PENDING: registrations.filter((r) => r.status === 'PENDING').length,
    CONFIRMED: registrations.filter((r) => r.status === 'CONFIRMED').length,
    REJECTED: registrations.filter((r) => r.status === 'REJECTED').length,
    WITHDRAWN: registrations.filter((r) => r.status === 'WITHDRAWN').length,
  };

  // Total registrations
  const totalRegistrations = registrations.length;
  const confirmedCount = statusBreakdown.CONFIRMED;

  // Capacity percentage
  const capacityPercentage =
    tournament.maxParticipants > 0
      ? Math.round((confirmedCount / tournament.maxParticipants) * 100)
      : 0;

  // Get confirmed participants details
  const confirmedParticipants = await prisma.registration.findMany({
    where: {
      tournamentId: id,
      status: 'CONFIRMED',
    },
    include: {
      player: {
        select: {
          id: true,
          username: true,
          email: true,
        },
      },
      team: {
        select: {
          id: true,
          name: true,
          tag: true,
        },
      },
    },
  });

  return {
    tournament: {
      id: tournament.id,
      name: tournament.name,
      game: tournament.game,
      status: tournament.status,
      format: tournament.format,
      maxParticipants: tournament.maxParticipants,
      startDate: tournament.startDate,
      endDate: tournament.endDate,
    },
    registrations: {
      total: totalRegistrations,
      statusBreakdown,
      confirmed: confirmedCount,
    },
    capacity: {
      max: tournament.maxParticipants,
      confirmed: confirmedCount,
      available: Math.max(0, tournament.maxParticipants - confirmedCount),
      percentageFilled: capacityPercentage,
    },
    confirmedParticipants: confirmedParticipants.map((reg) => ({
      registrationId: reg.id,
      registrationDate: reg.createdAt,
      participant: reg.playerId
        ? {
            type: 'PLAYER',
            id: reg.player.id,
            username: reg.player.username,
            email: reg.player.email,
          }
        : {
            type: 'TEAM',
            id: reg.team.id,
            name: reg.team.name,
            tag: reg.team.tag,
          },
    })),
  };
};
