import express from 'express';
import {
  getAllTournaments,
  getOneTournament,
  createNewTournament,
  updateExistingTournament,
  deleteExistingTournament,
  changeStatus,
} from '../controllers/tournamentController.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import {
  createTournamentSchema,
  updateTournamentSchema,
  updateTournamentStatusSchema,
  getTournamentsQuerySchema,
} from '../validations/tournament.js';

const router = express.Router();

/**
 * GET /api/tournaments
 * Get all tournaments with filters and pagination
 */
router.get('/', validate(getTournamentsQuerySchema, 'query'), getAllTournaments);

/**
 * GET /api/tournaments/:id
 * Get a single tournament
 */
router.get('/:id', getOneTournament);

/**
 * POST /api/tournaments
 * Create a new tournament
 */
router.post('/', authenticate, authorize('ORGANIZER', 'ADMIN'), validate(createTournamentSchema, 'body'), createNewTournament);

/**
 * PUT /api/tournaments/:id
 * Update a tournament
 */
router.put('/:id', authenticate, authorize('ORGANIZER', 'ADMIN'), validate(updateTournamentSchema, 'body'), updateExistingTournament);

/**
 * DELETE /api/tournaments/:id
 * Delete a tournament
 */
router.delete('/:id', authenticate, authorize('ORGANIZER', 'ADMIN'), deleteExistingTournament);

/**
 * PATCH /api/tournaments/:id/status
 * Update tournament status
 */
router.patch('/:id/status', authenticate, validate(updateTournamentStatusSchema, 'body'), changeStatus);

export default router;
