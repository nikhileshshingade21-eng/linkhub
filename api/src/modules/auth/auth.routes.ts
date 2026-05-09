import { Router } from 'express';
import { AuthController } from './auth.controller.js';
import { validate } from '../../shared/middleware/validate.js';
import { authenticate } from '../../shared/middleware/auth.js';
import { registerSchema, loginSchema, refreshSchema } from './auth.schema.js';

const router = Router();

/**
 * POST /api/auth/register
 * Create a new user account
 */
router.post('/register', validate(registerSchema), AuthController.register);

/**
 * POST /api/auth/login
 * Login with email + password
 */
router.post('/login', validate(loginSchema), AuthController.login);

/**
 * POST /api/auth/refresh
 * Exchange refresh token for new access + refresh tokens
 */
router.post('/refresh', validate(refreshSchema), AuthController.refresh);

/**
 * POST /api/auth/logout
 * Invalidate refresh token
 */
router.post('/logout', AuthController.logout);

/**
 * GET /api/auth/me
 * Get current authenticated user
 */
router.get('/me', authenticate, AuthController.getMe);

export default router;
