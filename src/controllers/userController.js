import { prisma } from '../utils/prisma.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * Get all users
 * GET /api/users
 */
export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      username: true,
      role: true,
      createdAt: true
    }
  });

  res.status(200).json(users);
});
