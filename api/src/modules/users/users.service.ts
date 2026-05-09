import { UsersModel } from './users.model.js';
import { NotFoundError } from '../../shared/utils/errors.js';
import type { UpdateProfileInput, CompleteOnboardingInput, SearchUsersInput } from './users.schema.js';
import type { PublicProfile, SearchResult } from './users.types.js';

function toPublicProfile(row: any): PublicProfile {
  return {
    id: row.user_id,
    name: row.name,
    college: row.college,
    branch: row.branch,
    year: row.year,
    bio: row.bio || '',
    skills: row.skills || [],
    interests: row.interests || [],
    socials: row.socials || {},
    avatarUrl: row.avatar_url,
    isOnboarded: row.is_onboarded,
    createdAt: row.created_at,
  };
}

export const UsersService = {
  /**
   * Get a user's public profile
   */
  async getProfile(userId: string): Promise<PublicProfile> {
    const profile = await UsersModel.getProfile(userId);
    if (!profile) {
      throw new NotFoundError('Profile not found');
    }
    return toPublicProfile(profile);
  },

  /**
   * Update profile fields
   */
  async updateProfile(userId: string, input: UpdateProfileInput): Promise<PublicProfile> {
    // Map camelCase input to snake_case DB fields
    const updates: any = {};
    if (input.name !== undefined) updates.name = input.name;
    if (input.college !== undefined) updates.college = input.college;
    if (input.branch !== undefined) updates.branch = input.branch;
    if (input.year !== undefined) updates.year = input.year;
    if (input.bio !== undefined) updates.bio = input.bio;
    if (input.skills !== undefined) updates.skills = input.skills;
    if (input.interests !== undefined) updates.interests = input.interests;
    if (input.socials !== undefined) updates.socials = input.socials;
    if (input.avatarUrl !== undefined) updates.avatar_url = input.avatarUrl;

    const row = await UsersModel.updateProfile(userId, updates);
    return toPublicProfile(row);
  },

  /**
   * Complete onboarding — sets core fields + marks as onboarded
   */
  async completeOnboarding(userId: string, input: CompleteOnboardingInput): Promise<PublicProfile> {
    const row = await UsersModel.updateProfile(userId, {
      name: input.name,
      college: input.college,
      branch: input.branch,
      year: input.year,
      interests: input.interests,
      bio: input.bio || '',
      is_onboarded: true,
    });
    return toPublicProfile(row);
  },

  /**
   * Search/discover users
   */
  async search(input: SearchUsersInput): Promise<SearchResult> {
    const { rows, total } = await UsersModel.search({
      q: input.q,
      skill: input.skill,
      interest: input.interest,
      college: input.college,
      page: input.page,
      limit: input.limit,
    });

    return {
      users: rows.map(toPublicProfile),
      total,
    };
  },
};
