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
 * @swagger
 * /api/tournaments/{tournamentId}/register:
 *   post:
 *     summary: Register a player or team to a tournament
 *     description: Register either a single player (SOLO format) or a team (TEAM format) to an open tournament. The tournament must be in OPEN status and have available capacity.
 *     tags: [Registrations]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tournamentId
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique identifier of the tournament
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               playerId:
 *                 type: string
 *                 description: Player ID (required for SOLO format tournaments)
 *               teamId:
 *                 type: string
 *                 description: Team ID (required for TEAM format tournaments)
 *             example:
 *               playerId: "uuid-here"
 *     responses:
 *       201:
 *         description: Registration created successfully with PENDING status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Registration'
 *       400:
 *         description: Validation error (invalid format, missing playerId/teamId, capacity exceeded)
 *       401:
 *         description: Unauthorized - missing or invalid token
 *       404:
 *         description: Tournament, player, or team not found
 *       500:
 *         description: Internal server error
 */
router.post('/', authenticate, validate(registerTournamentSchema, 'body'), register);

/**
 * @swagger
 * /api/tournaments/{tournamentId}/registrations:
 *   get:
 *     summary: Get all registrations for a tournament
 *     description: Retrieve all registrations for a specific tournament. Can be filtered by status using query parameters. Only tournament organizer or admin can view registrations.
 *     tags: [Registrations]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tournamentId
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique identifier of the tournament
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, CONFIRMED, REJECTED, WITHDRAWN]
 *         description: Filter registrations by status
 *     responses:
 *       200:
 *         description: Registrations retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Registration'
 *       401:
 *         description: Unauthorized - missing or invalid token
 *       403:
 *         description: Forbidden - only tournament organizer or admin can view registrations
 *       404:
 *         description: Tournament not found
 *       500:
 *         description: Internal server error
 */
router.get('/', authenticate, getRegistrations);

/**
 * @swagger
 * /api/tournaments/{tournamentId}/registrations/{id}:
 *   patch:
 *     summary: Update registration status
 *     description: Update the status of a tournament registration. Only tournament organizer or admin can modify status. PENDING registrations can be CONFIRMED, REJECTED, or WITHDRAWN. CONFIRMED registrations can only be WITHDRAWN.
 *     tags: [Registrations]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tournamentId
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique identifier of the tournament
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique identifier of the registration
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [CONFIRMED, REJECTED, WITHDRAWN]
 *                 example: "CONFIRMED"
 *             required:
 *               - status
 *     responses:
 *       200:
 *         description: Registration status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Registration'
 *       400:
 *         description: Validation error (invalid status or invalid state transition)
 *       401:
 *         description: Unauthorized - missing or invalid token
 *       403:
 *         description: Forbidden - only tournament organizer or admin can update status
 *       404:
 *         description: Registration or tournament not found
 *       500:
 *         description: Internal server error
 */
router.patch('/:id', authenticate, validate(updateRegistrationStatusSchema, 'body'), updateStatus);

/**
 * @swagger
 * /api/tournaments/{tournamentId}/registrations/{id}:
 *   delete:
 *     summary: Cancel a tournament registration
 *     description: Cancel (delete) a PENDING tournament registration. CONFIRMED registrations cannot be deleted directly - they must be transitioned to WITHDRAWN status first via PATCH endpoint.
 *     tags: [Registrations]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tournamentId
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique identifier of the tournament
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique identifier of the registration
 *     responses:
 *       200:
 *         description: Registration cancelled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized - missing or invalid token
 *       403:
 *         description: Forbidden - can only cancel PENDING registrations
 *       404:
 *         description: Registration or tournament not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', authenticate, cancel);

export default router;
