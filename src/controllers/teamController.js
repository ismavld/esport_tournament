import {
  getTeams,
  getTeamById,
  createTeam,
  updateTeam,
  deleteTeam,
} from '../services/teamService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * Get all teams
 */
export const getAllTeams = asyncHandler(async (req, res) => {
  const teams = await getTeams();
  res.json(teams);
});

/**
 * Get a single team
 */
export const getOneTeam = asyncHandler(async (req, res) => {
  const team = await getTeamById(req.params.id);
  res.json(team);
});

/**
 * Create a team
 */
export const createNewTeam = asyncHandler(async (req, res) => {
  const team = await createTeam(req.body, req.user.id);
  res.status(201).json(team);
});

/**
 * Update a team
 */
export const updateExistingTeam = asyncHandler(async (req, res) => {
  const team = await updateTeam(req.params.id, req.body, req.user.id);
  res.json(team);
});

/**
 * Delete a team
 */
export const deleteExistingTeam = asyncHandler(async (req, res) => {
  const result = await deleteTeam(req.params.id, req.user.id);
  res.json(result);
});
