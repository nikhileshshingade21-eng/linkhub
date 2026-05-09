import { Router } from 'express';
import { SquadsController } from './squads.controller.js';
import { validate, validateQuery } from '../../shared/middleware/validate.js';
import { authenticate, optionalAuth } from '../../shared/middleware/auth.js';
import {
  createSquadSchema,
  updateSquadSchema,
  inviteMemberSchema,
  updateMemberRoleSchema,
  searchSquadsSchema,
} from './squads.schema.js';

const router = Router();

// ---- Discovery ----
router.get('/search', optionalAuth, validateQuery(searchSquadsSchema), SquadsController.search);
router.get('/mine', authenticate, SquadsController.getMySquads);

// ---- CRUD ----
router.post('/', authenticate, validate(createSquadSchema), SquadsController.create);
router.get('/:id', optionalAuth, SquadsController.getById);
router.put('/:id', authenticate, validate(updateSquadSchema), SquadsController.update);
router.delete('/:id', authenticate, SquadsController.delete);

// ---- Membership ----
router.post('/:id/join', authenticate, SquadsController.join);
router.post('/:id/leave', authenticate, SquadsController.leave);
router.post('/:id/invite', authenticate, validate(inviteMemberSchema), SquadsController.invite);
router.delete('/:id/members/:userId', authenticate, SquadsController.removeMember);
router.put('/:id/members/:userId/role', authenticate, validate(updateMemberRoleSchema), SquadsController.updateRole);

export default router;
