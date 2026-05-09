import { z } from 'zod';

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).trim().optional(),
  college: z.string().max(200).trim().optional(),
  branch: z.string().max(200).trim().optional(),
  year: z.string().max(20).trim().optional(),
  bio: z.string().max(500).trim().optional(),
  skills: z.array(z.string().max(50)).max(20).optional(),
  interests: z.array(z.string().max(50)).max(15).optional(),
  socials: z.record(z.string().max(200)).optional(),
  avatarUrl: z.string().url().optional().nullable(),
});

export const completeOnboardingSchema = z.object({
  name: z.string().min(2).max(100).trim(),
  college: z.string().min(2).max(200).trim(),
  branch: z.string().min(2).max(200).trim(),
  year: z.string().min(1).max(20).trim(),
  interests: z.array(z.string().max(50)).min(3, 'Pick at least 3 interests').max(15),
  bio: z.string().max(500).trim().optional(),
});

export const searchUsersSchema = z.object({
  q: z.string().min(1).max(100).optional(),
  skill: z.string().max(50).optional(),
  interest: z.string().max(50).optional(),
  college: z.string().max(200).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type CompleteOnboardingInput = z.infer<typeof completeOnboardingSchema>;
export type SearchUsersInput = z.infer<typeof searchUsersSchema>;
