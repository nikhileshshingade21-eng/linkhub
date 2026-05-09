import { create } from 'zustand';
import { api } from '@/services/api';

interface User {
  id: string;
  email: string;
  name: string;
  isOnboarded: boolean;
  createdAt: string;
}

interface Profile {
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
}

interface AuthState {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // Actions
  register: (name: string, email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  loadProfile: () => Promise<void>;
  completeOnboarding: (data: any) => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  isLoading: true,
  isAuthenticated: false,

  register: async (name, email, password) => {
    const { data } = await api.auth.register({ name, email, password });
    api.setTokens(data.tokens.accessToken, data.tokens.refreshToken);
    set({
      user: data.user,
      isAuthenticated: true,
      isLoading: false,
    });
  },

  login: async (email, password) => {
    const { data } = await api.auth.login({ email, password });
    api.setTokens(data.tokens.accessToken, data.tokens.refreshToken);
    set({
      user: data.user,
      isAuthenticated: true,
      isLoading: false,
    });
  },

  logout: async () => {
    try {
      await api.auth.logout();
    } catch {
      // Ignore logout errors
    }
    set({ user: null, profile: null, isAuthenticated: false, isLoading: false });
  },

  loadUser: async () => {
    const token = api.getToken();
    if (!token) {
      set({ isLoading: false });
      return;
    }

    try {
      const { data } = await api.auth.getMe();
      set({ user: data, isAuthenticated: true, isLoading: false });
    } catch {
      api.clearTokens();
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  loadProfile: async () => {
    try {
      const { data } = await api.users.getProfile();
      set({ profile: data });
    } catch {
      // Profile might not exist yet
    }
  },

  completeOnboarding: async (data) => {
    const { data: profile } = await api.users.completeOnboarding(data);
    set({
      profile,
      user: get().user ? { ...get().user!, isOnboarded: true } : null,
    });
  },

  updateProfile: async (data) => {
    const { data: profile } = await api.users.updateProfile(data);
    set({ profile });
  },

  setUser: (user) => set({ user, isAuthenticated: !!user }),
}));
