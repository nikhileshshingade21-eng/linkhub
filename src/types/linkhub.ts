export type ProjectStatus = 'idea' | 'building' | 'done';

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  bio?: string;
  interests: string[];
  rematchCount: number;
};

export type AuthResponse = {
  token: string;
  user: AuthUser;
};

export type SignupPayload = {
  name: string;
  email: string;
  password: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type UpdateProfilePayload = {
  name: string;
  bio: string;
  interests: string[];
};

export type SquadMember = {
  id: string;
  userId: string;
  name: string;
  bio?: string;
  interests: string[];
  role: 'owner' | 'member';
};

export type Squad = {
  id: string;
  name: string;
  createdAt: string;
  members: SquadMember[];
};

export type ProjectNote = {
  id: string;
  projectId: string;
  userId: string;
  authorName: string;
  content: string;
  createdAt: string;
};

export type Project = {
  id: string;
  squadId: string;
  title: string;
  description: string;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
};

export type ProjectDetails = Project & {
  notes: ProjectNote[];
};

export type ProjectPayload = {
  title: string;
  description: string;
  status: ProjectStatus;
};

export type AppSnapshot = {
  user: AuthUser | null;
  squad: Squad | null;
  projects: Project[];
};

export const INTEREST_OPTIONS = [
  'AI Agents',
  'Climate Tech',
  'Design Systems',
  'Fintech',
  'Frontend',
  'Gaming',
  'Health Tech',
  'Machine Learning',
  'Mobile Apps',
  'Product Strategy',
  'Robotics',
  'Social Impact',
  'Web3',
  'Hackathons',
  'Growth',
] as const;
