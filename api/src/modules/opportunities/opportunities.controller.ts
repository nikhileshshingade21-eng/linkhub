import type { Request, Response, NextFunction } from 'express';
import { OpportunitiesService } from './opportunities.service.js';
import { success, paginated } from '../../shared/utils/response.js';

export const OpportunitiesController = {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const opp = await OpportunitiesService.create(req.user!.userId, req.body);
      success(res, opp, 201);
    } catch (err) { next(err); }
  },

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const opp = await OpportunitiesService.getById(req.params.id);
      success(res, opp);
    } catch (err) { next(err); }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const opp = await OpportunitiesService.update(req.params.id, req.user!.userId, req.body);
      success(res, opp);
    } catch (err) { next(err); }
  },

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await OpportunitiesService.delete(req.params.id, req.user!.userId);
      success(res, { message: 'Opportunity deleted' });
    } catch (err) { next(err); }
  },

  async search(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await OpportunitiesService.search(req.query as any);
      paginated(res, result.opportunities, result.total, Number(req.query.page) || 1, Number(req.query.limit) || 20);
    } catch (err) { next(err); }
  },
};
