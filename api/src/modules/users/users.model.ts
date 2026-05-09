import { query } from '../../shared/db/pool.js';
import type { UserProfileRow } from '../auth/auth.types.js';

export const UsersModel = {
  /**
   * Get profile by user ID
   */
  async getProfile(userId: string): Promise<UserProfileRow | null> {
    const { rows } = await query<UserProfileRow>(
      'SELECT * FROM user_profiles WHERE user_id = $1',
      [userId]
    );
    return rows[0] || null;
  },

  /**
   * Update profile fields (partial update)
   */
  async updateProfile(
    userId: string,
    updates: Partial<{
      name: string;
      college: string;
      branch: string;
      year: string;
      bio: string;
      skills: string[];
      interests: string[];
      socials: Record<string, string>;
      avatar_url: string | null;
      is_onboarded: boolean;
    }>
  ): Promise<UserProfileRow> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    // Build dynamic SET clause
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        if (key === 'socials') {
          fields.push(`${key} = $${paramIndex}::jsonb`);
        } else if (key === 'skills' || key === 'interests') {
          fields.push(`${key} = $${paramIndex}::text[]`);
        } else {
          fields.push(`${key} = $${paramIndex}`);
        }
        values.push(value);
        paramIndex++;
      }
    }

    if (fields.length === 0) {
      const existing = await this.getProfile(userId);
      return existing!;
    }

    values.push(userId);

    const { rows } = await query<UserProfileRow>(
      `UPDATE user_profiles SET ${fields.join(', ')}
       WHERE user_id = $${paramIndex} RETURNING *`,
      values
    );
    return rows[0];
  },

  /**
   * Search users with filters
   */
  async search(params: {
    q?: string;
    skill?: string;
    interest?: string;
    college?: string;
    page: number;
    limit: number;
  }): Promise<{ rows: UserProfileRow[]; total: number }> {
    const conditions: string[] = ['p.is_onboarded = true'];
    const values: any[] = [];
    let paramIndex = 1;

    if (params.q) {
      conditions.push(`(
        p.name ILIKE $${paramIndex}
        OR p.college ILIKE $${paramIndex}
        OR p.branch ILIKE $${paramIndex}
        OR p.bio ILIKE $${paramIndex}
      )`);
      values.push(`%${params.q}%`);
      paramIndex++;
    }

    if (params.skill) {
      conditions.push(`$${paramIndex} = ANY(p.skills)`);
      values.push(params.skill);
      paramIndex++;
    }

    if (params.interest) {
      conditions.push(`$${paramIndex} = ANY(p.interests)`);
      values.push(params.interest);
      paramIndex++;
    }

    if (params.college) {
      conditions.push(`p.college ILIKE $${paramIndex}`);
      values.push(`%${params.college}%`);
      paramIndex++;
    }

    const whereClause = conditions.length > 0
      ? `WHERE ${conditions.join(' AND ')}`
      : '';

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) as total FROM user_profiles p ${whereClause}`,
      values
    );
    const total = parseInt(countResult.rows[0].total, 10);

    // Get paginated results
    const offset = (params.page - 1) * params.limit;
    values.push(params.limit, offset);

    const { rows } = await query<UserProfileRow>(
      `SELECT p.* FROM user_profiles p
       ${whereClause}
       ORDER BY p.created_at DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      values
    );

    return { rows, total };
  },
};
