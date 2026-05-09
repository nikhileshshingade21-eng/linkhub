import { query, transaction } from '../../shared/db/pool.js';
import type { SquadRow, SquadMemberRow } from './squads.types.js';

export const SquadsModel = {
  /**
   * Create a squad + add creator as owner (transactional)
   */
  async create(
    name: string,
    description: string,
    requiredSkills: string[],
    visibility: string,
    maxMembers: number,
    createdBy: string
  ): Promise<SquadRow> {
    return transaction(async (client) => {
      // Create the squad
      const { rows } = await client.query<SquadRow>(
        `INSERT INTO squads (name, description, required_skills, visibility, max_members, created_by)
         VALUES ($1, $2, $3::text[], $4, $5, $6) RETURNING *`,
        [name, description, requiredSkills, visibility, maxMembers, createdBy]
      );
      const squad = rows[0];

      // Add creator as owner
      await client.query(
        `INSERT INTO squad_members (squad_id, user_id, role)
         VALUES ($1, $2, 'owner')`,
        [squad.id, createdBy]
      );

      return squad;
    });
  },

  /**
   * Get squad by ID
   */
  async findById(id: string): Promise<SquadRow | null> {
    const { rows } = await query<SquadRow>(
      'SELECT * FROM squads WHERE id = $1',
      [id]
    );
    return rows[0] || null;
  },

  /**
   * Update squad
   */
  async update(id: string, updates: Partial<{
    name: string;
    description: string;
    required_skills: string[];
    visibility: string;
    max_members: number;
  }>): Promise<SquadRow> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        if (key === 'required_skills') {
          fields.push(`${key} = $${paramIndex}::text[]`);
        } else {
          fields.push(`${key} = $${paramIndex}`);
        }
        values.push(value);
        paramIndex++;
      }
    }

    if (fields.length === 0) {
      return (await this.findById(id))!;
    }

    values.push(id);
    const { rows } = await query<SquadRow>(
      `UPDATE squads SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );
    return rows[0];
  },

  /**
   * Delete squad
   */
  async delete(id: string): Promise<void> {
    await query('DELETE FROM squads WHERE id = $1', [id]);
  },

  /**
   * Get squad members with profile info
   */
  async getMembers(squadId: string): Promise<Array<SquadMemberRow & { name: string; avatar_url: string | null }>> {
    const { rows } = await query(
      `SELECT sm.*, p.name, p.avatar_url
       FROM squad_members sm
       JOIN user_profiles p ON sm.user_id = p.user_id
       WHERE sm.squad_id = $1
       ORDER BY sm.role = 'owner' DESC, sm.joined_at ASC`,
      [squadId]
    );
    return rows;
  },

  /**
   * Get member count for a squad
   */
  async getMemberCount(squadId: string): Promise<number> {
    const { rows } = await query(
      'SELECT COUNT(*) as count FROM squad_members WHERE squad_id = $1',
      [squadId]
    );
    return parseInt(rows[0].count, 10);
  },

  /**
   * Add a member to a squad
   */
  async addMember(squadId: string, userId: string, role: string = 'member'): Promise<SquadMemberRow> {
    const { rows } = await query<SquadMemberRow>(
      `INSERT INTO squad_members (squad_id, user_id, role)
       VALUES ($1, $2, $3) RETURNING *`,
      [squadId, userId, role]
    );
    return rows[0];
  },

  /**
   * Remove a member
   */
  async removeMember(squadId: string, userId: string): Promise<void> {
    await query(
      'DELETE FROM squad_members WHERE squad_id = $1 AND user_id = $2',
      [squadId, userId]
    );
  },

  /**
   * Get a specific member
   */
  async getMember(squadId: string, userId: string): Promise<SquadMemberRow | null> {
    const { rows } = await query<SquadMemberRow>(
      'SELECT * FROM squad_members WHERE squad_id = $1 AND user_id = $2',
      [squadId, userId]
    );
    return rows[0] || null;
  },

  /**
   * Update member role
   */
  async updateMemberRole(squadId: string, userId: string, role: string): Promise<void> {
    await query(
      'UPDATE squad_members SET role = $3 WHERE squad_id = $1 AND user_id = $2',
      [squadId, userId, role]
    );
  },

  /**
   * Get all squads a user belongs to
   */
  async getUserSquads(userId: string): Promise<SquadRow[]> {
    const { rows } = await query<SquadRow>(
      `SELECT s.* FROM squads s
       JOIN squad_members sm ON s.id = sm.squad_id
       WHERE sm.user_id = $1
       ORDER BY sm.joined_at DESC`,
      [userId]
    );
    return rows;
  },

  /**
   * Search squads
   */
  async search(params: {
    q?: string;
    skill?: string;
    page: number;
    limit: number;
  }): Promise<{ rows: (SquadRow & { member_count: string })[]; total: number }> {
    const conditions: string[] = ["s.visibility = 'public'"];
    const values: any[] = [];
    let paramIndex = 1;

    if (params.q) {
      conditions.push(`(s.name ILIKE $${paramIndex} OR s.description ILIKE $${paramIndex})`);
      values.push(`%${params.q}%`);
      paramIndex++;
    }

    if (params.skill) {
      conditions.push(`$${paramIndex} = ANY(s.required_skills)`);
      values.push(params.skill);
      paramIndex++;
    }

    const whereClause = conditions.length > 0
      ? `WHERE ${conditions.join(' AND ')}`
      : '';

    const countResult = await query(
      `SELECT COUNT(*) as total FROM squads s ${whereClause}`,
      values
    );
    const total = parseInt(countResult.rows[0].total, 10);

    const offset = (params.page - 1) * params.limit;
    values.push(params.limit, offset);

    const { rows } = await query(
      `SELECT s.*, (SELECT COUNT(*) FROM squad_members WHERE squad_id = s.id) as member_count
       FROM squads s
       ${whereClause}
       ORDER BY s.created_at DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      values
    );

    return { rows, total };
  },
};
