import { z } from 'zod';

export const registerTournamentSchema = z.object({
  playerId: z.number().int().positive().optional(),
  teamId: z.number().int().positive().optional(),
}).refine((data) => {
  const hasPlayer = data.playerId !== undefined && data.playerId !== null;
  const hasTeam = data.teamId !== undefined && data.teamId !== null;
  
  // XOR: exactly one must be true
  return hasPlayer !== hasTeam;
}, {
  message: 'Provide either playerId or teamId, but not both',
  path: ['registration'],
});

export const updateRegistrationStatusSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'REJECTED', 'WITHDRAWN']),
});
