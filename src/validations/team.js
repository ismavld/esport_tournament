import { z } from 'zod';

export const createTeamSchema = z.object({
  name: z.string().min(3, 'Team name must be at least 3 characters').max(50, 'Team name must be at most 50 characters'),
  tag: z.string().min(3, 'Tag must be at least 3 characters').max(5, 'Tag must be at most 5 characters').regex(/^[A-Z0-9]+$/, 'Tag can only contain uppercase letters and numbers'),
});

export const updateTeamSchema = createTeamSchema.partial();
