import { registerUser, loginUser } from '../services/authService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * Register controller
 */
export const register = asyncHandler(async (req, res) => {
  const { email, username, password, role } = req.body;

  const { user, token } = await registerUser({ email, username, password, role });

  res.status(201).json({
    message: 'User registered successfully',
    token,
    user,
  });
});

/**
 * Login controller
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const { user, token } = await loginUser(email, password);

  res.json({
    message: 'Login successful',
    token,
    user,
  });
});
