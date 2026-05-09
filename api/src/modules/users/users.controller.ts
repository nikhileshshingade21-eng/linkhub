import type { Request, Response, NextFunction } from 'express';
import { UsersService } from './users.service.js';
import { success, paginated } from '../../shared/utils/response.js';

export const UsersController = {
  /**
   * GET /api/users/profile — own profile
   */
  async getMyProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const profile = await UsersService.getProfile(req.user!.userId);
      success(res, profile);
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/users/:id — public profile
   */
  async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const profile = await UsersService.getProfile(req.params.id);
      success(res, profile);
    } catch (err) {
      next(err);
    }
  },

  /**
   * PUT /api/users/profile — update own profile
   */
  async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const profile = await UsersService.updateProfile(req.user!.userId, req.body);
      success(res, profile);
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/users/onboard — complete onboarding
   */
  async completeOnboarding(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const profile = await UsersService.completeOnboarding(req.user!.userId, req.body);
      success(res, profile);
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/users/search — discover users
   */
  async search(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await UsersService.search(req.query as any);
      paginated(res, result.users, result.total, Number(req.query.page) || 1, Number(req.query.limit) || 20);
    } catch (err) {
      next(err);
    }
  },
};
