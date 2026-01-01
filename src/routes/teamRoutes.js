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
 * @swagger
 * /api/teams:
 *   get:
 *     summary: Get all teams
 *     description: Retrieve a paginated list of all teams in the system
 *     tags: [Teams]
 *     responses:
 *       200:
 *         description: List of teams retrieved successfully
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
 *                     $ref: '#/components/schemas/Team'
 *       500:
 *         description: Internal server error
 */
router.get('/', getAllTeams);

/**
 * @swagger
 * /api/teams/{id}:
 *   get:
 *     summary: Get a single team by ID
 *     description: Retrieve detailed information about a specific team including its captain and members
 *     tags: [Teams]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique identifier of the team
 *     responses:
 *       200:
 *         description: Team retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Team'
 *       404:
 *         description: Team not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', getOneTeam);

/**
 * @swagger
 * /api/teams:
 *   post:
 *     summary: Create a new team
 *     description: Create a new team with the authenticated user as the captain (requires PLAYER role)
 *     tags: [Teams]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 50
 *                 example: "Dragons United"
 *               tag:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 5
 *                 pattern: '^[A-Z0-9]+$'
 *                 example: "DRAG"
 *             required:
 *               - name
 *               - tag
 *     responses:
 *       201:
 *         description: Team created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Team'
 *       400:
 *         description: Validation error (invalid name/tag or team already exists)
 *       401:
 *         description: Unauthorized - missing or invalid token
 *       500:
 *         description: Internal server error
 */
router.post('/', authenticate, validate(createTeamSchema, 'body'), createNewTeam);

/**
 * @swagger
 * /api/teams/{id}:
 *   put:
 *     summary: Update an existing team
 *     description: Update team details. Only the team captain can perform this action.
 *     tags: [Teams]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique identifier of the team
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 50
 *               tag:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 5
 *                 pattern: '^[A-Z0-9]+$'
 *     responses:
 *       200:
 *         description: Team updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Team'
 *       400:
 *         description: Validation error or duplicate team name/tag
 *       401:
 *         description: Unauthorized - missing or invalid token
 *       403:
 *         description: Forbidden - only team captain can update
 *       404:
 *         description: Team not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', authenticate, validate(updateTeamSchema, 'body'), updateExistingTeam);

/**
 * @swagger
 * /api/teams/{id}:
 *   delete:
 *     summary: Delete a team
 *     description: Delete a team. Only the team captain can delete, and the team must not have active tournament registrations.
 *     tags: [Teams]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique identifier of the team
 *     responses:
 *       200:
 *         description: Team deleted successfully
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
 *         description: Forbidden - only team captain can delete, or team has active registrations
 *       404:
 *         description: Team not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', authenticate, deleteExistingTeam);

export default router;
