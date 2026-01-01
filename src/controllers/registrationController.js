import {
  registerToTournament,
  getTournamentRegistrations,
  updateRegistrationStatus,
  cancelRegistration,
} from '../services/registrationService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * Register to a tournament
 */
export const register = asyncHandler(async (req, res) => {
  const registration = await registerToTournament(req.params.tournamentId, req.body, req.user.id);
  res.status(201).json(registration);
});

/**
 * Get tournament registrations
 */
export const getRegistrations = asyncHandler(async (req, res) => {
  const registrations = await getTournamentRegistrations(req.params.tournamentId);
  res.json(registrations);
});

/**
 * Update registration status
 */
export const updateStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const registration = await updateRegistrationStatus(
    req.params.tournamentId,
    req.params.id,
    status,
    req.user.id,
    req.user.role
  );
  res.json(registration);
});

/**
 * Cancel registration
 */
export const cancel = asyncHandler(async (req, res) => {
  const result = await cancelRegistration(req.params.tournamentId, req.params.id, req.user.id, req.user.role);
  res.json(result);
});
