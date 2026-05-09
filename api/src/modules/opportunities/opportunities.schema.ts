import { z } from 'zod';

export const createOpportunitySchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200).trim(),
  description: z.string().min(10, 'Description must be at least 10 characters').max(2000).trim(),
  type: z.enum(['hackathon', 'internship', 'event', 'gig']),
  tags: z.array(z.string().max(50)).max(10).optional(),
  link: z.string().url().optional().nullable(),
  deadline: z.string().datetime().optional().nullable(),
});

export const updateOpportunitySchema = z.object({
  title: z.string().min(3).max(200).trim().optional(),
  description: z.string().min(10).max(2000).trim().optional(),
  type: z.enum(['hackathon', 'internship', 'event', 'gig']).optional(),
  tags: z.array(z.string().max(50)).max(10).optional(),
  link: z.string().url().optional().nullable(),
  deadline: z.string().datetime().optional().nullable(),
});

export const searchOpportunitiesSchema = z.object({
  q: z.string().min(1).max(100).optional(),
  type: z.enum(['hackathon', 'internship', 'event', 'gig']).optional(),
  tag: z.string().max(50).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export type CreateOpportunityInput = z.infer<typeof createOpportunitySchema>;
export type UpdateOpportunityInput = z.infer<typeof updateOpportunitySchema>;
export type SearchOpportunitiesInput = z.infer<typeof searchOpportunitiesSchema>;
