import {
  getTournaments,
  getTournamentById,
  createTournament,
  updateTournament,
  deleteTournament,
  updateTournamentStatus,
} from '../services/tournamentService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * Get all tournaments
 */
export const getAllTournaments = asyncHandler(async (req, res) => {
  const filters = {
    status: req.query.status,
    game: req.query.game,
    format: req.query.format,
    page: req.query.page ? parseInt(req.query.page) : 1,
    limit: req.query.limit ? parseInt(req.query.limit) : 10,
  };

  const data = await getTournaments(filters);
  res.json(data);
});

/**
 * Get a single tournament
 */
export const getOneTournament = asyncHandler(async (req, res) => {
  const tournament = await getTournamentById(req.params.id);
  res.json(tournament);
});

/**
 * Create a tournament
 */
export const createNewTournament = asyncHandler(async (req, res) => {
  const tournament = await createTournament({ ...req.body, organizerId: req.user.id });
  res.status(201).json(tournament);
});

/**
 * Update a tournament
 */
export const updateExistingTournament = asyncHandler(async (req, res) => {
  const tournament = await updateTournament(req.params.id, req.body, req.user.id, req.user.role);
  res.json(tournament);
});

/**
 * Delete a tournament
 */
export const deleteExistingTournament = asyncHandler(async (req, res) => {
  const result = await deleteTournament(req.params.id, req.user.id, req.user.role);
  res.json(result);
});

/**
 * Update tournament status
 */
export const changeStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const tournament = await updateTournamentStatus(req.params.id, status, req.user.id, req.user.role);
  res.json(tournament);
});
