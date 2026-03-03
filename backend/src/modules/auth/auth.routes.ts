import { Router } from 'express';
import { signup, login, getMe } from './auth.controller';
import { authenticate } from '../../middleware/auth';
import rateLimit from 'express-rate-limit';

const router = Router();

// Stricter rate limit for auth endpoints
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20,
    message: { success: false, message: 'Too many auth attempts. Try again in 15 minutes.' },
    standardHeaders: true,
    legacyHeaders: false,
});

// Public routes
router.post('/signup', authLimiter, signup);
router.post('/login', authLimiter, login);

// Protected routes
router.get('/me', authenticate, getMe);

export default router;
