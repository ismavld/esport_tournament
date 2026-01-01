import { describe, it, expect, beforeAll, afterEach, vi } from 'vitest';
import {
  createTournament,
  getTournament,
  updateTournamentStatus,
} from '../src/services/tournamentService.js';
import { registerUser } from '../src/services/authService.js';
import prisma from '../src/utils/prisma.js';

// Mock bcrypt for testing
vi.mock('bcrypt', () => ({
  default: {
    hash: async (password, rounds) => `hashed_${password}`,
    compare: async (password, hashedPassword) => {
      return `hashed_${password}` === hashedPassword;
    },
  },
}));

describe('Tournament Service', () => {
  let organizerId;
  const testOrganizerEmail = `organizer-${Date.now()}@example.com`;
  const testOrganizerUsername = `organizer${Date.now()}`;

  beforeAll(async () => {
    // Create organizer user
    const result = await registerUser(
      testOrganizerEmail,
      testOrganizerUsername,
      'OrgPassword123'
    );
    organizerId = result.user.id;

    // Promote to organizer
    await prisma.user.update({
      where: { id: organizerId },
      data: { role: 'ORGANIZER' },
    });
  });

  afterEach(async () => {
    // Clean up test tournaments
    await prisma.tournament.deleteMany({
      where: { organizerId },
    });
  });

  describe('createTournament', () => {
    it('should successfully create a tournament', async () => {
      const startDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
      const endDate = new Date(startDate.getTime() + 3 * 24 * 60 * 60 * 1000);

      const tournament = await createTournament({
        name: 'Test Tournament',
        game: 'League of Legends',
        format: 'TEAM',
        maxParticipants: 8,
        startDate,
        endDate,
        organizerId,
      });

      expect(tournament).toHaveProperty('id');
      expect(tournament.name).toBe('Test Tournament');
      expect(tournament.game).toBe('League of Legends');
      expect(tournament.status).toBe('DRAFT');
      expect(tournament.organizerId).toBe(organizerId);
    });

    it('should throw error when start date is in the past', async () => {
      const startDate = new Date(Date.now() - 1000); // 1 second ago
      const endDate = new Date(startDate.getTime() + 3 * 24 * 60 * 60 * 1000);

      await expect(
        createTournament({
          name: 'Past Tournament',
          game: 'Dota 2',
          format: 'SOLO',
          maxParticipants: 32,
          startDate,
          endDate,
          organizerId,
        })
      ).rejects.toThrow('Start date must be in the future');
    });

    it('should throw error when end date is before start date', async () => {
      const startDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      const endDate = new Date(startDate.getTime() - 1000);

      await expect(
        createTournament({
          name: 'Invalid Dates Tournament',
          game: 'CS:GO',
          format: 'TEAM',
          maxParticipants: 16,
          startDate,
          endDate,
          organizerId,
        })
      ).rejects.toThrow('End date must be after start date');
    });
  });

  describe('getTournament', () => {
    let tournamentId;

    beforeAll(async () => {
      const startDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      const endDate = new Date(startDate.getTime() + 3 * 24 * 60 * 60 * 1000);

      const tournament = await createTournament({
        name: 'Get Test Tournament',
        game: 'Valorant',
        format: 'TEAM',
        maxParticipants: 12,
        startDate,
        endDate,
        organizerId,
      });
      tournamentId = tournament.id;
    });

    it('should successfully retrieve a tournament', async () => {
      const tournament = await getTournament(tournamentId);

      expect(tournament).toHaveProperty('id', tournamentId);
      expect(tournament.name).toBe('Get Test Tournament');
    });

    it('should throw error when tournament not found', async () => {
      await expect(getTournament('nonexistent-id')).rejects.toThrow(
        'Tournament not found'
      );
    });
  });

  describe('updateTournamentStatus', () => {
    let tournamentId;

    beforeAll(async () => {
      const startDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      const endDate = new Date(startDate.getTime() + 3 * 24 * 60 * 60 * 1000);

      const tournament = await createTournament({
        name: 'Status Test Tournament',
        game: 'Overwatch',
        format: 'TEAM',
        maxParticipants: 20,
        startDate,
        endDate,
        organizerId,
      });
      tournamentId = tournament.id;
    });

    it('should transition from DRAFT to OPEN', async () => {
      const updated = await updateTournamentStatus(tournamentId, 'OPEN', organizerId);

      expect(updated.status).toBe('OPEN');
    });

    it('should transition from DRAFT to CANCELLED', async () => {
      // Create a new tournament for this test
      const startDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      const endDate = new Date(startDate.getTime() + 3 * 24 * 60 * 60 * 1000);

      const tournament = await createTournament({
        name: 'Cancel Test',
        game: 'Starcraft',
        format: 'SOLO',
        maxParticipants: 64,
        startDate,
        endDate,
        organizerId,
      });

      const updated = await updateTournamentStatus(tournament.id, 'CANCELLED', organizerId);
      expect(updated.status).toBe('CANCELLED');
    });
  });
});
