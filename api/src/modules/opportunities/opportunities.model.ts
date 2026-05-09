import { query } from '../../shared/db/pool.js';
import type { OpportunityRow } from './opportunities.types.js';

export const OpportunitiesModel = {
  async create(
    title: string,
    description: string,
    type: string,
    tags: string[],
    link: string | null,
    deadline: string | null,
    postedBy: string
  ): Promise<OpportunityRow> {
    const { rows } = await query<OpportunityRow>(
      `INSERT INTO opportunities (title, description, type, tags, link, deadline, posted_by)
       VALUES ($1, $2, $3, $4::text[], $5, $6, $7) RETURNING *`,
      [title, description, type, tags, link, deadline, postedBy]
    );
    return rows[0];
  },

  async findById(id: string): Promise<OpportunityRow | null> {
    const { rows } = await query<OpportunityRow>(
      'SELECT * FROM opportunities WHERE id = $1',
      [id]
    );
    return rows[0] || null;
  },

  async update(id: string, updates: Partial<{
    title: string;
    description: string;
    type: string;
    tags: string[];
    link: string | null;
    deadline: string | null;
  }>): Promise<OpportunityRow> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        if (key === 'tags') {
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
    const { rows } = await query<OpportunityRow>(
      `UPDATE opportunities SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );
    return rows[0];
  },

  async delete(id: string): Promise<void> {
    await query('DELETE FROM opportunities WHERE id = $1', [id]);
  },

  async search(params: {
    q?: string;
    type?: string;
    tag?: string;
    page: number;
    limit: number;
  }): Promise<{ rows: (OpportunityRow & { poster_name: string })[]; total: number }> {
    const conditions: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (params.q) {
      conditions.push(`(o.title ILIKE $${paramIndex} OR o.description ILIKE $${paramIndex})`);
      values.push(`%${params.q}%`);
      paramIndex++;
    }

    if (params.type) {
      conditions.push(`o.type = $${paramIndex}`);
      values.push(params.type);
      paramIndex++;
    }

    if (params.tag) {
      conditions.push(`$${paramIndex} = ANY(o.tags)`);
      values.push(params.tag);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countResult = await query(
      `SELECT COUNT(*) as total FROM opportunities o ${whereClause}`,
      values
    );
    const total = parseInt(countResult.rows[0].total, 10);

    const offset = (params.page - 1) * params.limit;
    values.push(params.limit, offset);

    const { rows } = await query(
      `SELECT o.*, p.name as poster_name
       FROM opportunities o
       JOIN user_profiles p ON o.posted_by = p.user_id
       ${whereClause}
       ORDER BY o.created_at DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      values
    );

    return { rows, total };
  },
};
