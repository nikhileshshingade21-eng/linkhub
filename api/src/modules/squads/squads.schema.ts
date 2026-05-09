import { z } from 'zod';

export const createSquadSchema = z.object({
  name: z.string().min(2, 'Squad name must be at least 2 characters').max(100).trim(),
  description: z.string().max(1000).trim().optional(),
  requiredSkills: z.array(z.string().max(50)).max(10).optional(),
  visibility: z.enum(['public', 'private']).default('public'),
  maxMembers: z.number().int().min(2).max(20).default(8),
});

export const updateSquadSchema = z.object({
  name: z.string().min(2).max(100).trim().optional(),
  description: z.string().max(1000).trim().optional(),
  requiredSkills: z.array(z.string().max(50)).max(10).optional(),
  visibility: z.enum(['public', 'private']).optional(),
  maxMembers: z.number().int().min(2).max(20).optional(),
});

export const inviteMemberSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
});

export const updateMemberRoleSchema = z.object({
  role: z.enum(['admin', 'member']),
});

export const searchSquadsSchema = z.object({
  q: z.string().min(1).max(100).optional(),
  skill: z.string().max(50).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export type CreateSquadInput = z.infer<typeof createSquadSchema>;
export type UpdateSquadInput = z.infer<typeof updateSquadSchema>;
export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;
export type UpdateMemberRoleInput = z.infer<typeof updateMemberRoleSchema>;
export type SearchSquadsInput = z.infer<typeof searchSquadsSchema>;
