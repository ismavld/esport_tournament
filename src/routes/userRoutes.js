import express from 'express';
import { getAllUsers } from '../controllers/userController.js';

const router = express.Router();

/**
 * @route   GET /api/users
 * @desc    Get all users
 * @access  Public
 */
router.get('/', getAllUsers);

export default router;
