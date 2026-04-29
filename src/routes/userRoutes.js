// src/routes/userRoutes.js
import express from 'express';
import { createUser } from '../controllers/userController.js';
import { signup, login, getProfile } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Auth routes
router.post('/signup', signup);
router.post('/login', login);
router.get('/profile', authenticateToken, getProfile);

// Legacy route (kept for backwards compatibility)
router.post('/create', createUser);

export default router;