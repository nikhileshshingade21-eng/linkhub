import { query } from '../../shared/db/pool.js';
import type { UserRow, SessionRow, UserProfileRow } from './auth.types.js';

/**
 * Auth data access — pure SQL, no business logic
 */
export const AuthModel = {
  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<UserRow | null> {
    const { rows } = await query<UserRow>(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return rows[0] || null;
  },

  /**
   * Find user by ID
   */
  async findById(id: string): Promise<UserRow | null> {
    const { rows } = await query<UserRow>(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );
    return rows[0] || null;
  },

  /**
   * Create a new user
   */
  async create(email: string, passwordHash: string): Promise<UserRow> {
    const { rows } = await query<UserRow>(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING *',
      [email, passwordHash]
    );
    return rows[0];
  },

  /**
   * Create user profile (called right after user creation)
   */
  async createProfile(userId: string, name: string): Promise<UserProfileRow> {
    const { rows } = await query<UserProfileRow>(
      `INSERT INTO user_profiles (user_id, name)
       VALUES ($1, $2) RETURNING *`,
      [userId, name]
    );
    return rows[0];
  },

  /**
   * Get user profile
   */
  async getProfile(userId: string): Promise<UserProfileRow | null> {
    const { rows } = await query<UserProfileRow>(
      'SELECT * FROM user_profiles WHERE user_id = $1',
      [userId]
    );
    return rows[0] || null;
  },

  /**
   * Store a refresh token session
   */
  async createSession(
    userId: string,
    refreshToken: string,
    expiresAt: Date,
    userAgent?: string,
    ipAddress?: string
  ): Promise<SessionRow> {
    const { rows } = await query<SessionRow>(
      `INSERT INTO sessions (user_id, refresh_token, expires_at, user_agent, ip_address)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [userId, refreshToken, expiresAt, userAgent || null, ipAddress || null]
    );
    return rows[0];
  },

  /**
   * Find session by refresh token
   */
  async findSession(refreshToken: string): Promise<SessionRow | null> {
    const { rows } = await query<SessionRow>(
      'SELECT * FROM sessions WHERE refresh_token = $1 AND expires_at > NOW()',
      [refreshToken]
    );
    return rows[0] || null;
  },

  /**
   * Delete a session (logout)
   */
  async deleteSession(refreshToken: string): Promise<void> {
    await query('DELETE FROM sessions WHERE refresh_token = $1', [refreshToken]);
  },

  /**
   * Delete all sessions for a user (logout everywhere)
   */
  async deleteAllSessions(userId: string): Promise<void> {
    await query('DELETE FROM sessions WHERE user_id = $1', [userId]);
  },

  /**
   * Clean expired sessions (housekeeping)
   */
  async cleanExpiredSessions(): Promise<number> {
    const { rowCount } = await query('DELETE FROM sessions WHERE expires_at < NOW()');
    return rowCount || 0;
  },
};
