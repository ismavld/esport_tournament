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
import { asyncHandler } from '../utils/asyncHandler.js';
import prisma from '../utils/prisma.js';
import {
  createTournamentSchema,
  updateTournamentSchema,
  updateTournamentStatusSchema,
  getTournamentsQuerySchema,
} from '../validations/tournament.js';

const router = express.Router();

/**
 * @swagger
 * /api/tournaments:
 *   get:
 *     summary: Get all tournaments with filters and pagination
 *     tags: [Tournaments]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [DRAFT, OPEN, ONGOING, COMPLETED, CANCELLED]
 *       - in: query
 *         name: game
 *         schema:
 *           type: string
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [SOLO, TEAM]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: List of tournaments
 */
router.get('/', validate(getTournamentsQuerySchema, 'query'), getAllTournaments);

/**
 * @swagger
 * /api/tournaments/public/all:
 *   get:
 *     summary: Get all tournaments (public endpoint, no pagination)
 *     tags: [Tournaments]
 *     responses:
 *       200:
 *         description: List of all tournaments
 */
router.get('/public/all', asyncHandler(async (req, res) => {
  const tournaments = await prisma.tournament.findMany({
    include: {
      organizer: {
        select: { id: true, username: true, email: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json(tournaments);
}));

/**
 * @swagger
 * /api/tournaments/{id}:
 *   get:
 *     summary: Get a single tournament
 *     tags: [Tournaments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Tournament details
 *       404:
 *         description: Tournament not found
 */
router.get('/:id', getOneTournament);

/**
 * @swagger
 * /api/tournaments:
 *   post:
 *     summary: Create a new tournament
 *     tags: [Tournaments]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, game, format, maxParticipants, startDate]
 *             properties:
 *               name:
 *                 type: string
 *               game:
 *                 type: string
 *               format:
 *                 type: string
 *                 enum: [SOLO, TEAM]
 *               maxParticipants:
 *                 type: integer
 *               prizePool:
 *                 type: number
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Tournament created
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post('/', authenticate, authorize('ORGANIZER', 'ADMIN'), validate(createTournamentSchema, 'body'), createNewTournament);

/**
 * @swagger
 * /api/tournaments/{id}:
 *   put:
 *     summary: Update a tournament
 *     tags: [Tournaments]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Tournament updated
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Tournament not found
 */
router.put('/:id', authenticate, authorize('ORGANIZER', 'ADMIN'), validate(updateTournamentSchema, 'body'), updateExistingTournament);

/**
 * @swagger
 * /api/tournaments/{id}:
 *   delete:
 *     summary: Delete a tournament
 *     tags: [Tournaments]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Tournament deleted
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Tournament not found
 */
router.delete('/:id', authenticate, authorize('ORGANIZER', 'ADMIN'), deleteExistingTournament);

/**
 * @swagger
 * /api/tournaments/{id}/status:
 *   patch:
 *     summary: Update tournament status
 *     tags: [Tournaments]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [DRAFT, OPEN, ONGOING, COMPLETED, CANCELLED]
 *     responses:
 *       200:
 *         description: Status updated
 */
router.patch('/:id/status', authenticate, validate(updateTournamentStatusSchema, 'body'), changeStatus);

export default router;
