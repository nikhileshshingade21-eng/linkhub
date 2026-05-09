import bcrypt from 'bcryptjs';
import { AuthModel } from './auth.model.js';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../../shared/middleware/auth.js';
import {
  ConflictError,
  UnauthorizedError,
  NotFoundError,
} from '../../shared/utils/errors.js';
import type { RegisterInput, LoginInput } from './auth.schema.js';
import type { AuthTokens, SafeUser } from './auth.types.js';

const SALT_ROUNDS = 12;

/**
 * Auth business logic — fat service, thin controller
 */
export const AuthService = {
  /**
   * Register a new user
   */
  async register(
    input: RegisterInput,
    meta?: { userAgent?: string; ip?: string }
  ): Promise<{ user: SafeUser; tokens: AuthTokens }> {
    // Check if email already exists
    const existing = await AuthModel.findByEmail(input.email);
    if (existing) {
      throw new ConflictError('Email already registered');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

    // Create user + profile in sequence
    const user = await AuthModel.create(input.email, passwordHash);
    const profile = await AuthModel.createProfile(user.id, input.name);

    // Generate tokens
    const jwtPayload = { userId: user.id, email: user.email };
    const accessToken = generateAccessToken(jwtPayload);
    const refreshToken = generateRefreshToken(jwtPayload);

    // Store refresh token session
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await AuthModel.createSession(
      user.id,
      refreshToken,
      expiresAt,
      meta?.userAgent,
      meta?.ip
    );

    return {
      user: {
        id: user.id,
        email: user.email,
        name: profile.name,
        isOnboarded: profile.is_onboarded,
        createdAt: user.created_at,
      },
      tokens: { accessToken, refreshToken },
    };
  },

  /**
   * Login with email and password
   */
  async login(
    input: LoginInput,
    meta?: { userAgent?: string; ip?: string }
  ): Promise<{ user: SafeUser; tokens: AuthTokens }> {
    const user = await AuthModel.findByEmail(input.email);
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const passwordValid = await bcrypt.compare(input.password, user.password_hash);
    if (!passwordValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Get profile
    const profile = await AuthModel.getProfile(user.id);

    // Generate tokens
    const jwtPayload = { userId: user.id, email: user.email };
    const accessToken = generateAccessToken(jwtPayload);
    const refreshToken = generateRefreshToken(jwtPayload);

    // Store session
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await AuthModel.createSession(
      user.id,
      refreshToken,
      expiresAt,
      meta?.userAgent,
      meta?.ip
    );

    return {
      user: {
        id: user.id,
        email: user.email,
        name: profile?.name || '',
        isOnboarded: profile?.is_onboarded || false,
        createdAt: user.created_at,
      },
      tokens: { accessToken, refreshToken },
    };
  },

  /**
   * Refresh access token
   */
  async refresh(refreshToken: string): Promise<AuthTokens> {
    // Verify the token cryptographically
    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw new UnauthorizedError('Invalid refresh token');
    }

    // Check the session exists in DB
    const session = await AuthModel.findSession(refreshToken);
    if (!session) {
      throw new UnauthorizedError('Session expired or revoked');
    }

    // Delete old session (rotate)
    await AuthModel.deleteSession(refreshToken);

    // Issue new tokens
    const jwtPayload = { userId: payload.userId, email: payload.email };
    const newAccessToken = generateAccessToken(jwtPayload);
    const newRefreshToken = generateRefreshToken(jwtPayload);

    // Store new session
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await AuthModel.createSession(session.user_id, newRefreshToken, expiresAt);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  },

  /**
   * Logout — delete session
   */
  async logout(refreshToken: string): Promise<void> {
    await AuthModel.deleteSession(refreshToken);
  },

  /**
   * Get current user info
   */
  async getMe(userId: string): Promise<SafeUser> {
    const user = await AuthModel.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const profile = await AuthModel.getProfile(userId);

    return {
      id: user.id,
      email: user.email,
      name: profile?.name || '',
      isOnboarded: profile?.is_onboarded || false,
      createdAt: user.created_at,
    };
  },
};
