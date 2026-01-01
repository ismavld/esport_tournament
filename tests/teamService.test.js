import { describe, it, expect, beforeAll, afterEach, vi } from 'vitest';
import { createTeam, getTeam, updateTeam } from '../src/services/teamService.js';
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

describe('Team Service', () => {
  let captainId;
  const testCaptainEmail = `captain-${Date.now()}@example.com`;
  const testCaptainUsername = `captain${Date.now()}`;

  beforeAll(async () => {
    const result = await registerUser(
      testCaptainEmail,
      testCaptainUsername,
      'CaptainPass123'
    );
    captainId = result.user.id;
  });

  afterEach(async () => {
    // Clean up test teams
    await prisma.team.deleteMany({
      where: { captainId },
    });
  });

  describe('createTeam', () => {
    it('should successfully create a team', async () => {
      const team = await createTeam({
        name: 'Test Team',
        tag: 'TEST',
        captainId,
      });

      expect(team).toHaveProperty('id');
      expect(team.name).toBe('Test Team');
      expect(team.tag).toBe('TEST');
      expect(team.captainId).toBe(captainId);
    });

    it('should throw error when team name already exists', async () => {
      await createTeam({
        name: 'Unique Team Name',
        tag: 'UNQ1',
        captainId,
      });

      await expect(
        createTeam({
          name: 'Unique Team Name',
          tag: 'UNQ2',
          captainId,
        })
      ).rejects.toThrow();
    });

    it('should throw error when team tag is not uppercase', async () => {
      await expect(
        createTeam({
          name: 'Invalid Tag Team',
          tag: 'inv',
          captainId,
        })
      ).rejects.toThrow();
    });
  });

  describe('getTeam', () => {
    let teamId;

    beforeAll(async () => {
      const team = await createTeam({
        name: 'Get Team Test',
        tag: 'GTT1',
        captainId,
      });
      teamId = team.id;
    });

    it('should successfully retrieve a team', async () => {
      const team = await getTeam(teamId);

      expect(team).toHaveProperty('id', teamId);
      expect(team.name).toBe('Get Team Test');
    });

    it('should throw error when team not found', async () => {
      await expect(getTeam('nonexistent-id')).rejects.toThrow('Team not found');
    });
  });

  describe('updateTeam', () => {
    let teamId;

    beforeAll(async () => {
      const team = await createTeam({
        name: 'Update Team Test',
        tag: 'UTT1',
        captainId,
      });
      teamId = team.id;
    });

    it('should successfully update team name', async () => {
      const updated = await updateTeam(teamId, captainId, {
        name: 'Updated Team Name',
      });

      expect(updated.name).toBe('Updated Team Name');
    });

    it('should successfully update team tag', async () => {
      const updated = await updateTeam(teamId, captainId, {
        tag: 'UPD1',
      });

      expect(updated.tag).toBe('UPD1');
    });

    it('should throw error when not captain', async () => {
      // Create another user
      const otherUserResult = await registerUser(
        `other-${Date.now()}@example.com`,
        `other${Date.now()}`,
        'OtherPass123'
      );

      await expect(
        updateTeam(teamId, otherUserResult.user.id, {
          name: 'Hacked Name',
        })
      ).rejects.toThrow('You are not authorized');
    });
  });
});
