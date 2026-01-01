import express from 'express';
import { register, login } from '../controllers/authController.js';
import { validate } from '../middlewares/validate.js';
import { registerSchema, loginSchema } from '../validations/auth.js';

const router = express.Router();

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', validate(registerSchema, 'body'), register);

/**
 * POST /api/auth/login
 * Login a user
 */
router.post('/login', validate(loginSchema, 'body'), login);

export default router;
