import express from 'express';
import { signup, login, getCurrentUser } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { signupValidator, loginValidator } from '../middleware/validators.js';

const router = express.Router();

// Register new user
router.post('/signup', signupValidator, signup);

// Login user
router.post('/login', loginValidator, login);

// Get current user
router.get('/me', protect, getCurrentUser);

export default router;