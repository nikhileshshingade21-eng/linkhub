export interface UserRow {
  id: string;
  email: string;
  password_hash: string;
  created_at: Date;
  updated_at: Date;
}

export interface SessionRow {
  id: string;
  user_id: string;
  refresh_token: string;
  user_agent: string | null;
  ip_address: string | null;
  expires_at: Date;
  created_at: Date;
}

export interface UserProfileRow {
  user_id: string;
  name: string;
  college: string | null;
  branch: string | null;
  year: string | null;
  bio: string;
  skills: string[];
  interests: string[];
  socials: Record<string, string>;
  avatar_url: string | null;
  is_onboarded: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface SafeUser {
  id: string;
  email: string;
  name: string;
  isOnboarded: boolean;
  createdAt: Date;
}
