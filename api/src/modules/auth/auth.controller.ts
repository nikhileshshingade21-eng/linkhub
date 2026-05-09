import type { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service.js';
import { success } from '../../shared/utils/response.js';

/**
 * Auth controller — thin layer, delegates to service
 */
export const AuthController = {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await AuthService.register(req.body, {
        userAgent: req.headers['user-agent'],
        ip: req.ip,
      });

      success(res, result, 201);
    } catch (err) {
      next(err);
    }
  },

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await AuthService.login(req.body, {
        userAgent: req.headers['user-agent'],
        ip: req.ip,
      });

      success(res, result);
    } catch (err) {
      next(err);
    }
  },

  async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tokens = await AuthService.refresh(req.body.refreshToken);
      success(res, tokens);
    } catch (err) {
      next(err);
    }
  },

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;
      if (refreshToken) {
        await AuthService.logout(refreshToken);
      }
      success(res, { message: 'Logged out' });
    } catch (err) {
      next(err);
    }
  },

  async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await AuthService.getMe(req.user!.userId);
      success(res, user);
    } catch (err) {
      next(err);
    }
  },
};
