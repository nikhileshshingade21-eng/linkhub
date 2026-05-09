import { Router } from 'express';
import { UsersController } from './users.controller.js';
import { validate, validateQuery } from '../../shared/middleware/validate.js';
import { authenticate, optionalAuth } from '../../shared/middleware/auth.js';
import {
  updateProfileSchema,
  completeOnboardingSchema,
  searchUsersSchema,
} from './users.schema.js';

const router = Router();

/**
 * GET /api/users/search
 * Search/discover users (public, but only shows onboarded users)
 */
router.get('/search', optionalAuth, validateQuery(searchUsersSchema), UsersController.search);

/**
 * GET /api/users/profile
 * Get own profile (authenticated)
 */
router.get('/profile', authenticate, UsersController.getMyProfile);

/**
 * PUT /api/users/profile
 * Update own profile
 */
router.put('/profile', authenticate, validate(updateProfileSchema), UsersController.updateProfile);

/**
 * POST /api/users/onboard
 * Complete onboarding flow
 */
router.post('/onboard', authenticate, validate(completeOnboardingSchema), UsersController.completeOnboarding);

/**
 * GET /api/users/:id
 * View someone's public profile
 */
router.get('/:id', optionalAuth, UsersController.getProfile);

export default router;
