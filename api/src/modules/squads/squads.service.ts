import { SquadsModel } from './squads.model.js';
import {
  BadRequestError,
  NotFoundError,
  ForbiddenError,
  ConflictError,
} from '../../shared/utils/errors.js';
import { requireSquadRole } from '../../shared/middleware/authorize.js';
import type { CreateSquadInput, UpdateSquadInput, SearchSquadsInput } from './squads.schema.js';
import type { PublicSquad, SquadMemberDetail } from './squads.types.js';

function formatMembers(rawMembers: any[]): SquadMemberDetail[] {
  return rawMembers.map(m => ({
    userId: m.user_id,
    name: m.name,
    avatarUrl: m.avatar_url,
    role: m.role,
    joinedAt: m.joined_at,
  }));
}

async function toPublicSquad(row: any): Promise<PublicSquad> {
  const members = await SquadsModel.getMembers(row.id);
  return {
    id: row.id,
    name: row.name,
    description: row.description || '',
    requiredSkills: row.required_skills || [],
    visibility: row.visibility,
    maxMembers: row.max_members,
    memberCount: row.member_count ? parseInt(row.member_count, 10) : members.length,
    createdBy: row.created_by,
    createdAt: row.created_at,
    members: formatMembers(members),
  };
}

export const SquadsService = {
  /**
   * Create a new squad
   */
  async create(userId: string, input: CreateSquadInput): Promise<PublicSquad> {
    const squad = await SquadsModel.create(
      input.name,
      input.description || '',
      input.requiredSkills || [],
      input.visibility,
      input.maxMembers,
      userId
    );
    return toPublicSquad(squad);
  },

  /**
   * Get squad by ID
   */
  async getById(squadId: string, requesterId?: string): Promise<PublicSquad> {
    const squad = await SquadsModel.findById(squadId);
    if (!squad) throw new NotFoundError('Squad not found');

    // Private squads only visible to members
    if (squad.visibility === 'private' && requesterId) {
      const member = await SquadsModel.getMember(squadId, requesterId);
      if (!member) throw new NotFoundError('Squad not found');
    }

    return toPublicSquad(squad);
  },

  /**
   * Update squad (owner/admin only)
   */
  async update(squadId: string, userId: string, input: UpdateSquadInput): Promise<PublicSquad> {
    await requireSquadRole(userId, squadId, ['owner', 'admin']);

    const updates: any = {};
    if (input.name !== undefined) updates.name = input.name;
    if (input.description !== undefined) updates.description = input.description;
    if (input.requiredSkills !== undefined) updates.required_skills = input.requiredSkills;
    if (input.visibility !== undefined) updates.visibility = input.visibility;
    if (input.maxMembers !== undefined) updates.max_members = input.maxMembers;

    const updated = await SquadsModel.update(squadId, updates);
    return toPublicSquad(updated);
  },

  /**
   * Delete squad (owner only)
   */
  async delete(squadId: string, userId: string): Promise<void> {
    await requireSquadRole(userId, squadId, ['owner']);
    await SquadsModel.delete(squadId);
  },

  /**
   * Join a public squad
   */
  async join(squadId: string, userId: string): Promise<PublicSquad> {
    const squad = await SquadsModel.findById(squadId);
    if (!squad) throw new NotFoundError('Squad not found');

    if (squad.visibility === 'private') {
      throw new ForbiddenError('This squad is invite-only');
    }

    // Check if already a member
    const existing = await SquadsModel.getMember(squadId, userId);
    if (existing) throw new ConflictError('Already a member');

    // Check capacity
    const count = await SquadsModel.getMemberCount(squadId);
    if (count >= squad.max_members) {
      throw new BadRequestError('Squad is full');
    }

    await SquadsModel.addMember(squadId, userId);
    return toPublicSquad(squad);
  },

  /**
   * Invite a user to a squad (owner/admin)
   */
  async invite(squadId: string, inviterId: string, inviteeId: string): Promise<void> {
    await requireSquadRole(inviterId, squadId, ['owner', 'admin']);

    const existing = await SquadsModel.getMember(squadId, inviteeId);
    if (existing) throw new ConflictError('User already in squad');

    const squad = await SquadsModel.findById(squadId);
    if (!squad) throw new NotFoundError('Squad not found');

    const count = await SquadsModel.getMemberCount(squadId);
    if (count >= squad.max_members) {
      throw new BadRequestError('Squad is full');
    }

    await SquadsModel.addMember(squadId, inviteeId);
  },

  /**
   * Leave a squad (non-owners)
   */
  async leave(squadId: string, userId: string): Promise<void> {
    const member = await SquadsModel.getMember(squadId, userId);
    if (!member) throw new NotFoundError('Not a member');

    if (member.role === 'owner') {
      throw new BadRequestError('Owner cannot leave. Transfer ownership or delete the squad.');
    }

    await SquadsModel.removeMember(squadId, userId);
  },

  /**
   * Remove a member (owner/admin)
   */
  async removeMember(squadId: string, removerId: string, targetId: string): Promise<void> {
    await requireSquadRole(removerId, squadId, ['owner', 'admin']);

    const target = await SquadsModel.getMember(squadId, targetId);
    if (!target) throw new NotFoundError('Member not found');

    if (target.role === 'owner') {
      throw new ForbiddenError('Cannot remove squad owner');
    }

    await SquadsModel.removeMember(squadId, targetId);
  },

  /**
   * Update member role (owner only)
   */
  async updateRole(squadId: string, ownerId: string, targetId: string, role: string): Promise<void> {
    await requireSquadRole(ownerId, squadId, ['owner']);

    const target = await SquadsModel.getMember(squadId, targetId);
    if (!target) throw new NotFoundError('Member not found');

    if (target.role === 'owner') {
      throw new ForbiddenError('Cannot change owner role');
    }

    await SquadsModel.updateMemberRole(squadId, targetId, role);
  },

  /**
   * Get all squads for a user
   */
  async getMySquads(userId: string): Promise<PublicSquad[]> {
    const squads = await SquadsModel.getUserSquads(userId);
    return Promise.all(squads.map(s => toPublicSquad(s)));
  },

  /**
   * Search/discover squads
   */
  async search(input: SearchSquadsInput) {
    const { rows, total } = await SquadsModel.search({
      q: input.q,
      skill: input.skill,
      page: input.page,
      limit: input.limit,
    });

    const squads = await Promise.all(rows.map(r => toPublicSquad(r)));
    return { squads, total };
  },
};
