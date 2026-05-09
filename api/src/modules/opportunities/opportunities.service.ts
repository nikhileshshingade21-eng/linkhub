import { OpportunitiesModel } from './opportunities.model.js';
import { NotFoundError } from '../../shared/utils/errors.js';
import { requireOwnership } from '../../shared/middleware/authorize.js';
import type { CreateOpportunityInput, UpdateOpportunityInput, SearchOpportunitiesInput } from './opportunities.schema.js';
import type { PublicOpportunity } from './opportunities.types.js';

function toPublic(row: any): PublicOpportunity {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    type: row.type,
    tags: row.tags || [],
    link: row.link,
    deadline: row.deadline,
    postedBy: {
      id: row.posted_by,
      name: row.poster_name || '',
    },
    createdAt: row.created_at,
  };
}

export const OpportunitiesService = {
  async create(userId: string, input: CreateOpportunityInput): Promise<PublicOpportunity> {
    const row = await OpportunitiesModel.create(
      input.title,
      input.description,
      input.type,
      input.tags || [],
      input.link || null,
      input.deadline || null,
      userId
    );
    // Fetch with poster name
    const results = await OpportunitiesModel.search({ page: 1, limit: 1, q: undefined, type: undefined, tag: undefined });
    const found = results.rows.find(r => r.id === row.id);
    return toPublic(found || { ...row, poster_name: '' });
  },

  async getById(id: string): Promise<PublicOpportunity> {
    const row = await OpportunitiesModel.findById(id);
    if (!row) throw new NotFoundError('Opportunity not found');
    return toPublic({ ...row, poster_name: '' });
  },

  async update(id: string, userId: string, input: UpdateOpportunityInput): Promise<PublicOpportunity> {
    const existing = await OpportunitiesModel.findById(id);
    if (!existing) throw new NotFoundError('Opportunity not found');
    requireOwnership(existing.posted_by, userId, 'opportunity');

    const updates: any = {};
    if (input.title !== undefined) updates.title = input.title;
    if (input.description !== undefined) updates.description = input.description;
    if (input.type !== undefined) updates.type = input.type;
    if (input.tags !== undefined) updates.tags = input.tags;
    if (input.link !== undefined) updates.link = input.link;
    if (input.deadline !== undefined) updates.deadline = input.deadline;

    const row = await OpportunitiesModel.update(id, updates);
    return toPublic({ ...row, poster_name: '' });
  },

  async delete(id: string, userId: string): Promise<void> {
    const existing = await OpportunitiesModel.findById(id);
    if (!existing) throw new NotFoundError('Opportunity not found');
    requireOwnership(existing.posted_by, userId, 'opportunity');
    await OpportunitiesModel.delete(id);
  },

  async search(input: SearchOpportunitiesInput) {
    const { rows, total } = await OpportunitiesModel.search({
      q: input.q,
      type: input.type,
      tag: input.tag,
      page: input.page,
      limit: input.limit,
    });
    return { opportunities: rows.map(toPublic), total };
  },
};
