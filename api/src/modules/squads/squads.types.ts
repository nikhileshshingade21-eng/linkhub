export interface SquadRow {
  id: string;
  name: string;
  description: string;
  required_skills: string[];
  visibility: 'public' | 'private';
  max_members: number;
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

export interface SquadMemberRow {
  id: string;
  squad_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member';
  joined_at: Date;
}

export interface SquadWithMembers extends SquadRow {
  members: SquadMemberDetail[];
  memberCount: number;
}

export interface SquadMemberDetail {
  userId: string;
  name: string;
  avatarUrl: string | null;
  role: 'owner' | 'admin' | 'member';
  joinedAt: Date;
}

export interface PublicSquad {
  id: string;
  name: string;
  description: string;
  requiredSkills: string[];
  visibility: 'public' | 'private';
  maxMembers: number;
  memberCount: number;
  createdBy: string;
  createdAt: Date;
  members: SquadMemberDetail[];
}
