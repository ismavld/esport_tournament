import { z } from 'zod';

const baseSchema = z.object({
  name: z.string().min(1, 'Tournament name is required'),
  game: z.string().min(1, 'Game is required'),
  format: z.enum(['SOLO', 'TEAM'], { errorMap: () => ({ message: 'Format must be SOLO or TEAM' }) }),
  maxParticipants: z.number().int().positive('Max participants must be positive'),
  prizePool: z.number().nonnegative('Prize pool must be non-negative').optional().default(0),
  startDate: z.string().datetime('Invalid date format'),
  endDate: z.string().datetime('Invalid date format').optional(),
});

export const createTournamentSchema = baseSchema.refine((data) => {
  if (data.endDate && new Date(data.endDate) <= new Date(data.startDate)) {
    return false;
  }
  return true;
}, {
  message: 'endDate must be after startDate',
  path: ['endDate'],
});

export const updateTournamentSchema = z.object({
  name: z.string().min(1, 'Tournament name is required').optional(),
  game: z.string().min(1, 'Game is required').optional(),
  format: z.enum(['SOLO', 'TEAM']).optional(),
  maxParticipants: z.number().int().positive('Max participants must be positive').optional(),
  prizePool: z.number().nonnegative('Prize pool must be non-negative').optional(),
  startDate: z.string().datetime('Invalid date format').optional(),
  endDate: z.string().datetime('Invalid date format').optional(),
}).refine((data) => {
  if (data.endDate && data.startDate && new Date(data.endDate) <= new Date(data.startDate)) {
    return false;
  }
  return true;
}, {
  message: 'endDate must be after startDate',
  path: ['endDate'],
});

export const updateTournamentStatusSchema = z.object({
  status: z.enum(['DRAFT', 'OPEN', 'ONGOING', 'COMPLETED', 'CANCELLED']),
});

export const getTournamentsQuerySchema = z.object({
  status: z.enum(['DRAFT', 'OPEN', 'ONGOING', 'COMPLETED', 'CANCELLED']).optional(),
  game: z.string().optional(),
  format: z.enum(['SOLO', 'TEAM']).optional(),
  page: z.string().regex(/^\d+$/).transform(Number).optional().default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).optional().default('10'),
});
