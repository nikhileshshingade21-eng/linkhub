import { SquadsModel } from '../../modules/squads/squads.model.js';
import { ForbiddenError, NotFoundError } from '../utils/errors.js';

type SquadRole = 'owner' | 'admin' | 'member';

/**
 * Require that a user has one of the specified roles in a squad.
 * Throws ForbiddenError if they don't, NotFoundError if not a member.
 *
 * Usage:
 *   await requireSquadRole(userId, squadId, ['owner', 'admin']);
 */
export async function requireSquadRole(
  userId: string,
  squadId: string,
  allowedRoles: SquadRole[]
): Promise<SquadRole> {
  const member = await SquadsModel.getMember(squadId, userId);

  if (!member) {
    throw new NotFoundError('Not a member of this squad');
  }

  if (!allowedRoles.includes(member.role as SquadRole)) {
    throw new ForbiddenError(
      `Requires ${allowedRoles.join(' or ')} role. You are: ${member.role}`
    );
  }

  return member.role as SquadRole;
}

/**
 * Require that the requesting user owns a resource.
 * Generic ownership check for any entity.
 */
export function requireOwnership(
  resourceOwnerId: string,
  requesterId: string,
  resourceName: string = 'resource'
): void {
  if (resourceOwnerId !== requesterId) {
    throw new ForbiddenError(`You don't own this ${resourceName}`);
  }
}
