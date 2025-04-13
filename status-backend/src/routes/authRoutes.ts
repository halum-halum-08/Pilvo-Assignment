import express from 'express';
import * as authController from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes
router.get('/me', authenticateToken, authController.getCurrentUser);

export default router;
