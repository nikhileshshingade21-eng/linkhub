/**
 * Centralized API client
 * All API calls go through here — no direct fetch() in components
 */

const API_BASE = '/api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  details?: Array<{ field: string; message: string }>;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

class ApiError extends Error {
  status: number;
  details?: Array<{ field: string; message: string }>;

  constructor(message: string, status: number, details?: Array<{ field: string; message: string }>) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

/**
 * Get stored access token
 */
function getToken(): string | null {
  return localStorage.getItem('linkhub_access_token');
}

/**
 * Get stored refresh token
 */
function getRefreshToken(): string | null {
  return localStorage.getItem('linkhub_refresh_token');
}

/**
 * Store tokens
 */
function setTokens(accessToken: string, refreshToken: string): void {
  localStorage.setItem('linkhub_access_token', accessToken);
  localStorage.setItem('linkhub_refresh_token', refreshToken);
}

/**
 * Clear tokens (logout)
 */
function clearTokens(): void {
  localStorage.removeItem('linkhub_access_token');
  localStorage.removeItem('linkhub_refresh_token');
}

/**
 * Core request function with auto token refresh
 */
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE}${endpoint}`;
  const token = getToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let response = await fetch(url, {
    ...options,
    headers,
  });

  // If 401 and we have a refresh token, try to refresh
  if (response.status === 401 && getRefreshToken()) {
    const refreshed = await refreshTokens();
    if (refreshed) {
      // Retry with new token
      headers['Authorization'] = `Bearer ${getToken()}`;
      response = await fetch(url, { ...options, headers });
    }
  }

  const data: ApiResponse<T> = await response.json();

  if (!response.ok || !data.success) {
    throw new ApiError(
      data.error || 'Something went wrong',
      response.status,
      data.details
    );
  }

  return data;
}

/**
 * Try to refresh the access token
 */
async function refreshTokens(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  try {
    const response = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      clearTokens();
      return false;
    }

    const data = await response.json();
    if (data.success && data.data) {
      setTokens(data.data.accessToken, data.data.refreshToken);
      return true;
    }

    clearTokens();
    return false;
  } catch {
    clearTokens();
    return false;
  }
}

// ---- Public API methods ----

export const api = {
  // Auth
  auth: {
    register: (body: { name: string; email: string; password: string }) =>
      request<{ user: any; tokens: { accessToken: string; refreshToken: string } }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(body),
      }),

    login: (body: { email: string; password: string }) =>
      request<{ user: any; tokens: { accessToken: string; refreshToken: string } }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(body),
      }),

    logout: () => {
      const refreshToken = getRefreshToken();
      clearTokens();
      return request('/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      });
    },

    getMe: () => request<any>('/auth/me'),
  },

  // Users
  users: {
    getProfile: () => request<any>('/users/profile'),
    getPublicProfile: (id: string) => request<any>(`/users/${id}`),
    updateProfile: (body: any) => request<any>('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(body),
    }),
    completeOnboarding: (body: any) => request<any>('/users/onboard', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
    search: (params: Record<string, string>) => {
      const qs = new URLSearchParams(params).toString();
      return request<any>(`/users/search?${qs}`);
    },
  },

  // Squads
  squads: {
    create: (body: any) => request<any>('/squads', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
    getById: (id: string) => request<any>(`/squads/${id}`),
    update: (id: string, body: any) => request<any>(`/squads/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),
    delete: (id: string) => request(`/squads/${id}`, { method: 'DELETE' }),
    join: (id: string) => request<any>(`/squads/${id}/join`, { method: 'POST' }),
    leave: (id: string) => request(`/squads/${id}/leave`, { method: 'POST' }),
    invite: (id: string, userId: string) => request(`/squads/${id}/invite`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    }),
    removeMember: (squadId: string, userId: string) =>
      request(`/squads/${squadId}/members/${userId}`, { method: 'DELETE' }),
    getMySquads: () => request<any[]>('/squads/mine'),
    search: (params: Record<string, string>) => {
      const qs = new URLSearchParams(params).toString();
      return request<any>(`/squads/search?${qs}`);
    },
  },

  // Opportunities
  opportunities: {
    create: (body: any) => request<any>('/opportunities', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
    getById: (id: string) => request<any>(`/opportunities/${id}`),
    update: (id: string, body: any) => request<any>(`/opportunities/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),
    delete: (id: string) => request(`/opportunities/${id}`, { method: 'DELETE' }),
    search: (params: Record<string, string>) => {
      const qs = new URLSearchParams(params).toString();
      return request<any>(`/opportunities/search?${qs}`);
    },
  },

  // Helpers
  setTokens,
  clearTokens,
  getToken,
};

export { ApiError };
