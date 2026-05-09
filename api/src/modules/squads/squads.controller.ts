import type { Request, Response, NextFunction } from 'express';
import { SquadsService } from './squads.service.js';
import { success, paginated } from '../../shared/utils/response.js';

export const SquadsController = {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const squad = await SquadsService.create(req.user!.userId, req.body);
      success(res, squad, 201);
    } catch (err) { next(err); }
  },

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const squad = await SquadsService.getById(req.params.id, req.user?.userId);
      success(res, squad);
    } catch (err) { next(err); }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const squad = await SquadsService.update(req.params.id, req.user!.userId, req.body);
      success(res, squad);
    } catch (err) { next(err); }
  },

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await SquadsService.delete(req.params.id, req.user!.userId);
      success(res, { message: 'Squad deleted' });
    } catch (err) { next(err); }
  },

  async join(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const squad = await SquadsService.join(req.params.id, req.user!.userId);
      success(res, squad);
    } catch (err) { next(err); }
  },

  async invite(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await SquadsService.invite(req.params.id, req.user!.userId, req.body.userId);
      success(res, { message: 'Member invited' });
    } catch (err) { next(err); }
  },

  async leave(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await SquadsService.leave(req.params.id, req.user!.userId);
      success(res, { message: 'Left squad' });
    } catch (err) { next(err); }
  },

  async removeMember(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await SquadsService.removeMember(req.params.id, req.user!.userId, req.params.userId);
      success(res, { message: 'Member removed' });
    } catch (err) { next(err); }
  },

  async updateRole(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await SquadsService.updateRole(req.params.id, req.user!.userId, req.params.userId, req.body.role);
      success(res, { message: 'Role updated' });
    } catch (err) { next(err); }
  },

  async getMySquads(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const squads = await SquadsService.getMySquads(req.user!.userId);
      success(res, squads);
    } catch (err) { next(err); }
  },

  async search(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await SquadsService.search(req.query as any);
      paginated(res, result.squads, result.total, Number(req.query.page) || 1, Number(req.query.limit) || 20);
    } catch (err) { next(err); }
  },
};
