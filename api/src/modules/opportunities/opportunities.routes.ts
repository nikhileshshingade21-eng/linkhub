import { Router } from 'express';
import { OpportunitiesController } from './opportunities.controller.js';
import { validate, validateQuery } from '../../shared/middleware/validate.js';
import { authenticate, optionalAuth } from '../../shared/middleware/auth.js';
import {
  createOpportunitySchema,
  updateOpportunitySchema,
  searchOpportunitiesSchema,
} from './opportunities.schema.js';

const router = Router();

// Search/browse (public)
router.get('/search', optionalAuth, validateQuery(searchOpportunitiesSchema), OpportunitiesController.search);

// CRUD
router.post('/', authenticate, validate(createOpportunitySchema), OpportunitiesController.create);
router.get('/:id', optionalAuth, OpportunitiesController.getById);
router.put('/:id', authenticate, validate(updateOpportunitySchema), OpportunitiesController.update);
router.delete('/:id', authenticate, OpportunitiesController.delete);

export default router;
