import express from 'express';
import {
  register,
  getRegistrations,
  updateStatus,
  cancel,
} from '../controllers/registrationController.js';
import { authenticate } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { registerTournamentSchema, updateRegistrationStatusSchema } from '../validations/registration.js';

const router = express.Router({ mergeParams: true });

/**
 * POST /api/tournaments/:tournamentId/register
 * Register a player or team to a tournament
 */
router.post('/', authenticate, validate(registerTournamentSchema, 'body'), register);

/**
 * GET /api/tournaments/:tournamentId/registrations
 * Get all registrations for a tournament
 */
router.get('/', authenticate, getRegistrations);

/**
 * PATCH /api/tournaments/:tournamentId/registrations/:id
 * Update registration status
 */
router.patch('/:id', authenticate, validate(updateRegistrationStatusSchema, 'body'), updateStatus);

/**
 * DELETE /api/tournaments/:tournamentId/registrations/:id
 * Cancel a registration
 */
router.delete('/:id', authenticate, cancel);

export default router;
