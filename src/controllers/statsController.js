import { getTournamentStats } from '../services/statsService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * Get tournament statistics
 * GET /api/tournaments/:tournamentId/stats
 */
export const getStats = asyncHandler(async (req, res) => {
  const { tournamentId } = req.params;

  const stats = await getTournamentStats(tournamentId);

  res.status(200).json({
    success: true,
    data: stats,
  });
});
