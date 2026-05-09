export interface PublicProfile {
  id: string;
  name: string;
  college: string | null;
  branch: string | null;
  year: string | null;
  bio: string;
  skills: string[];
  interests: string[];
  socials: Record<string, string>;
  avatarUrl: string | null;
  isOnboarded: boolean;
  createdAt: Date;
}

export interface SearchResult {
  users: PublicProfile[];
  total: number;
}
