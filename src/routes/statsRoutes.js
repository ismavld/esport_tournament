import express from 'express';
import { getStats } from '../controllers/statsController.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router({ mergeParams: true });

/**
 * @swagger
 * /api/tournaments/{tournamentId}/stats:
 *   get:
 *     summary: Get tournament statistics
 *     description: Get comprehensive statistics for a tournament including registration status breakdown, capacity information, and confirmed participants list.
 *     tags: [Statistics]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tournamentId
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique identifier of the tournament
 *     responses:
 *       200:
 *         description: Tournament statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     tournament:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         game:
 *                           type: string
 *                         status:
 *                           type: string
 *                           enum: [DRAFT, OPEN, ONGOING, COMPLETED, CANCELLED]
 *                         format:
 *                           type: string
 *                           enum: [SOLO, TEAM]
 *                         maxParticipants:
 *                           type: number
 *                         startDate:
 *                           type: string
 *                           format: date-time
 *                         endDate:
 *                           type: string
 *                           format: date-time
 *                     registrations:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: number
 *                           description: Total number of registrations
 *                         statusBreakdown:
 *                           type: object
 *                           properties:
 *                             PENDING:
 *                               type: number
 *                             CONFIRMED:
 *                               type: number
 *                             REJECTED:
 *                               type: number
 *                             WITHDRAWN:
 *                               type: number
 *                         confirmed:
 *                           type: number
 *                           description: Number of confirmed registrations
 *                     capacity:
 *                       type: object
 *                       properties:
 *                         max:
 *                           type: number
 *                         confirmed:
 *                           type: number
 *                         available:
 *                           type: number
 *                         percentageFilled:
 *                           type: number
 *                     confirmedParticipants:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           registrationId:
 *                             type: string
 *                           registrationDate:
 *                             type: string
 *                             format: date-time
 *                           participant:
 *                             type: object
 *                             properties:
 *                               type:
 *                                 type: string
 *                                 enum: [PLAYER, TEAM]
 *                               id:
 *                                 type: string
 *                               username:
 *                                 type: string
 *       401:
 *         description: Unauthorized - missing or invalid token
 *       404:
 *         description: Tournament not found
 *       500:
 *         description: Internal server error
 */
router.get('/', authenticate, getStats);

export default router;
