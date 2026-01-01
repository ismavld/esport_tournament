import express from 'express';
import {
  getAllTeams,
  getOneTeam,
  createNewTeam,
  updateExistingTeam,
  deleteExistingTeam,
} from '../controllers/teamController.js';
import { authenticate } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { createTeamSchema, updateTeamSchema } from '../validations/team.js';

const router = express.Router();

/**
 * GET /api/teams
 * Get all teams
 */
router.get('/', getAllTeams);

/**
 * GET /api/teams/:id
 * Get a single team
 */
router.get('/:id', getOneTeam);

/**
 * POST /api/teams
 * Create a new team
 */
router.post('/', authenticate, validate(createTeamSchema, 'body'), createNewTeam);

/**
 * PUT /api/teams/:id
 * Update a team
 */
router.put('/:id', authenticate, validate(updateTeamSchema, 'body'), updateExistingTeam);

/**
 * DELETE /api/teams/:id
 * Delete a team
 */
router.delete('/:id', authenticate, deleteExistingTeam);

export default router;
