// ============================================
// Authentication Service
// ============================================

import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../database/prisma.js';
import { tokenBlacklist, sessionCache } from '../database/redis.js';
import { 
  hashPassword, 
  verifyPassword, 
  validatePassword 
} from '../security/password.js';
import {
  generateTokenPair,
  verifyRefreshToken,
  AccessTokenPayload,
  RefreshTokenPayload,
  TokenPair,
} from '../security/jwt.js';
import {
  generateSecureToken,
  generateSessionId,
  generateFamilyId,
  hashToken,
} from '../security/tokens.js';
import { jwtConfig } from '../config/jwt.config.js';
import { securityConfig } from '../config/security.config.js';
import { logger } from '../utils/logger.js';
import { HttpError } from '../errors/http.error.js';
import { HTTP_STATUS, ERROR_CODES } from '@workflow/shared';
import { auditService } from './audit.service.js';
import { userClient } from './user-client.service.js';
import { permissionClient } from './permission-client.service.js';

// DTOs
export interface RegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface LoginDto {
  email: string;
  password: string;
  deviceInfo?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface LoginResult {
  tokens: TokenPair;
  user: {
    id: string;
    email: string;
    roles: string[];
    permissions: string[];
  };
}

export interface RefreshTokenDto {
  refreshToken: string;
  deviceInfo?: string;
  ipAddress?: string;
}

class AuthService {
  // Register new user credentials
  async register(data: RegisterDto): Promise<void> {
    // Validate password strength
    const passwordValidation = validatePassword(data.password);
    if (!passwordValidation.isValid) {
      throw new HttpError(
        HTTP_STATUS.BAD_REQUEST,
        'Password does not meet requirements',
        ERROR_CODES.AUTH.WEAK_PASSWORD,
        passwordValidation.errors
      );
    }

    // Check if email already exists
    const existing = await prisma.userCredential.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (existing) {
      throw new HttpError(
        HTTP_STATUS.CONFLICT,
        'Email already registered',
        ERROR_CODES.AUTH.EMAIL_EXISTS
      );
    }

    // Create user in user-service first (user-service owns user id)
    const user = await userClient.createUser(
      {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
      }
    );
    const userId = user.id;

    // Hash password
    const passwordHash = await hashPassword(data.password);

    // Create credentials
    const credential = await prisma.userCredential.create({
      data: {
        userId,
        email: data.email.toLowerCase(),
        passwordHash,
      },
    });

    // Create email verification token
    const verificationToken = generateSecureToken(32);
    const expiresAt = new Date(
      Date.now() + securityConfig.tokens.emailVerificationExpiresHours * 60 * 60 * 1000
    );

    await prisma.emailVerificationToken.create({
      data: {
        token: hashToken(verificationToken),
        credentialId: credential.id,
        expiresAt,
      },
    });

    // Log audit event
    await auditService.log({
      userId,
      email: data.email,
      eventType: 'REGISTER',
      eventStatus: 'success',
    });

    logger.info('User registered', { userId, email: data.email });

    // TODO: Send verification email via notification service
  }

  // Login user
  async login(data: LoginDto): Promise<LoginResult> {
    const email = data.email.toLowerCase();

    // Find credentials
    const credential = await prisma.userCredential.findUnique({
      where: { email },
    });

    if (!credential) {
      await auditService.log({
        email,
        eventType: 'LOGIN',
        eventStatus: 'failure',
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        errorMessage: 'User not found',
      });

      throw new HttpError(
        HTTP_STATUS.UNAUTHORIZED,
        'Invalid email or password',
        ERROR_CODES.AUTH.INVALID_CREDENTIALS
      );
    }

    // Check if account is locked
    if (credential.lockedUntil && credential.lockedUntil > new Date()) {
      await auditService.log({
        userId: credential.userId,
        email,
        eventType: 'LOGIN',
        eventStatus: 'failure',
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        errorMessage: 'Account locked',
      });

      const minutesRemaining = Math.ceil(
        (credential.lockedUntil.getTime() - Date.now()) / 60000
      );

      throw new HttpError(
        HTTP_STATUS.TOO_MANY_REQUESTS,
        `Account is locked. Try again in ${minutesRemaining} minutes`,
        ERROR_CODES.AUTH.ACCOUNT_LOCKED
      );
    }

    // Verify password
    const isValidPassword = await verifyPassword(data.password, credential.passwordHash);

    if (!isValidPassword) {
      // Increment failed attempts
      const failedAttempts = credential.failedAttempts + 1;
      const updateData: any = { failedAttempts };

      // Lock account if max attempts exceeded
      if (failedAttempts >= securityConfig.lockout.maxFailedAttempts) {
        updateData.lockedUntil = new Date(
          Date.now() + securityConfig.lockout.durationMinutes * 60 * 1000
        );
      }

      await prisma.userCredential.update({
        where: { id: credential.id },
        data: updateData,
      });

      await auditService.log({
        userId: credential.userId,
        email,
        eventType: 'LOGIN',
        eventStatus: 'failure',
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        errorMessage: 'Invalid password',
        metadata: { failedAttempts },
      });

      throw new HttpError(
        HTTP_STATUS.UNAUTHORIZED,
        'Invalid email or password',
        ERROR_CODES.AUTH.INVALID_CREDENTIALS
      );
    }

    // Check if email is verified (optional - can be enforced)
    // if (!credential.emailVerified) {
    //   throw new HttpError(
    //     HTTP_STATUS.FORBIDDEN,
    //     'Please verify your email before logging in',
    //     ERROR_CODES.AUTH.EMAIL_NOT_VERIFIED
    //   );
    // }

    // Reset failed attempts and update last login
    await prisma.userCredential.update({
      where: { id: credential.id },
      data: {
        failedAttempts: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
        lastLoginIp: data.ipAddress,
      },
    });

    // Create session
    const sessionId = generateSessionId();
    const familyId = generateFamilyId();

    const sessionExpiresAt = new Date(
      Date.now() + securityConfig.session.expiresHours * 60 * 60 * 1000
    );

    await prisma.session.create({
      data: {
        id: sessionId,
        credentialId: credential.id,
        deviceInfo: data.deviceInfo,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        expiresAt: sessionExpiresAt,
      },
    });

    // Enforce max sessions limit
    await this.enforceMaxSessions(credential.id);

    // Get roles and permissions from permission-service
    const { roles, permissions } = await permissionClient.getUserRolesAndPermissions(
      credential.userId
    );

    // Generate tokens
    const accessPayload: AccessTokenPayload = {
      sub: credential.userId,
      email: credential.email,
      roles,
      permissions,
      sessionId,
    };

    const refreshPayload: RefreshTokenPayload = {
      sub: credential.userId,
      sessionId,
      familyId,
      generation: 0,
    };

    const tokens = generateTokenPair(accessPayload, refreshPayload);

    // Store refresh token
    const refreshTokenExpiresAt = new Date(Date.now() + jwtConfig.refresh.expiresInMs);

    await prisma.refreshToken.create({
      data: {
        token: hashToken(tokens.refreshToken),
        credentialId: credential.id,
        familyId,
        generation: 0,
        deviceInfo: data.deviceInfo,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        expiresAt: refreshTokenExpiresAt,
      },
    });

    // Cache session in Redis
    await sessionCache.set(
      sessionId,
      {
        userId: credential.userId,
        email: credential.email,
        roles,
        permissions,
      },
      securityConfig.session.expiresHours * 60 * 60
    );

    await auditService.log({
      userId: credential.userId,
      email,
      eventType: 'LOGIN',
      eventStatus: 'success',
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      metadata: { sessionId },
    });

    logger.info('User logged in', {
      userId: credential.userId,
      email,
      sessionId,
    });

    return {
      tokens,
      user: {
        id: credential.userId,
        email: credential.email,
        roles,
        permissions,
      },
    };
  }

  // Refresh tokens
  async refreshTokens(data: RefreshTokenDto): Promise<TokenPair> {
    let payload: RefreshTokenPayload;

    try {
      payload = verifyRefreshToken(data.refreshToken);
    } catch (error) {
      throw new HttpError(
        HTTP_STATUS.UNAUTHORIZED,
        'Invalid or expired refresh token',
        ERROR_CODES.AUTH.INVALID_TOKEN
      );
    }

    // Find stored refresh token
    const tokenHash = hashToken(data.refreshToken);
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: tokenHash },
      include: { credential: true },
    });

    if (!storedToken) {
      // Token not found - possible token reuse attack
      // Revoke all tokens in this family
      await this.revokeTokenFamily(payload.familyId, 'Token reuse detected');

      throw new HttpError(
        HTTP_STATUS.UNAUTHORIZED,
        'Invalid refresh token',
        ERROR_CODES.AUTH.INVALID_TOKEN
      );
    }

    if (storedToken.isRevoked) {
      // Token was already revoked - possible token reuse attack
      await this.revokeTokenFamily(payload.familyId, 'Revoked token reuse');

      throw new HttpError(
        HTTP_STATUS.UNAUTHORIZED,
        'Refresh token has been revoked',
        ERROR_CODES.AUTH.TOKEN_REVOKED
      );
    }

    if (storedToken.expiresAt < new Date()) {
      throw new HttpError(
        HTTP_STATUS.UNAUTHORIZED,
        'Refresh token has expired',
        ERROR_CODES.AUTH.TOKEN_EXPIRED
      );
    }

    // Verify session is still active
    const session = await prisma.session.findUnique({
      where: { id: payload.sessionId },
    });

    if (!session || !session.isActive) {
      throw new HttpError(
        HTTP_STATUS.UNAUTHORIZED,
        'Session has expired',
        ERROR_CODES.AUTH.SESSION_EXPIRED
      );
    }

    // Revoke old refresh token (rotation)
    await prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: {
        isRevoked: true,
        revokedAt: new Date(),
        revokedReason: 'Token rotation',
      },
    });

    // Get roles and permissions from permission-service
    const { roles, permissions } = await permissionClient.getUserRolesAndPermissions(
      storedToken.credential.userId
    );

    // Generate new token pair
    const accessPayload: AccessTokenPayload = {
      sub: storedToken.credential.userId,
      email: storedToken.credential.email,
      roles,
      permissions,
      sessionId: payload.sessionId,
    };

    const refreshPayload: RefreshTokenPayload = {
      sub: storedToken.credential.userId,
      sessionId: payload.sessionId,
      familyId: payload.familyId,
      generation: payload.generation + 1,
    };

    const tokens = generateTokenPair(accessPayload, refreshPayload);

    // Store new refresh token
    const refreshTokenExpiresAt = new Date(Date.now() + jwtConfig.refresh.expiresInMs);

    await prisma.refreshToken.create({
      data: {
        token: hashToken(tokens.refreshToken),
        credentialId: storedToken.credentialId,
        familyId: payload.familyId,
        generation: payload.generation + 1,
        deviceInfo: data.deviceInfo,
        ipAddress: data.ipAddress,
        expiresAt: refreshTokenExpiresAt,
      },
    });

    // Update session activity
    await prisma.session.update({
      where: { id: payload.sessionId },
      data: { lastActivityAt: new Date() },
    });

    logger.debug('Tokens refreshed', {
      userId: storedToken.credential.userId,
      sessionId: payload.sessionId,
      generation: payload.generation + 1,
    });

    return tokens;
  }

  // Logout
  async logout(userId: string, sessionId: string, accessToken: string): Promise<void> {
    // Revoke session
    await prisma.session.update({
      where: { id: sessionId },
      data: { isActive: false },
    });

    // Revoke all refresh tokens for this session
    await prisma.refreshToken.updateMany({
      where: {
        credential: { userId },
        isRevoked: false,
      },
      data: {
        isRevoked: true,
        revokedAt: new Date(),
        revokedReason: 'User logout',
      },
    });

    // Blacklist access token
    const tokenExpiration = jwtConfig.access.expiresInMs / 1000;
    await tokenBlacklist.add(accessToken, tokenExpiration);

    // Remove session from cache
    await sessionCache.delete(sessionId);

    await auditService.log({
      userId,
      eventType: 'LOGOUT',
      eventStatus: 'success',
      metadata: { sessionId },
    });

    logger.info('User logged out', { userId, sessionId });
  }

  // Logout from all devices
  async logoutAll(userId: string): Promise<void> {
    // Find credential
    const credential = await prisma.userCredential.findUnique({
      where: { userId },
    });

    if (!credential) {
      throw new HttpError(
        HTTP_STATUS.NOT_FOUND,
        'User not found',
        ERROR_CODES.USER.NOT_FOUND
      );
    }

    // Revoke all sessions
    await prisma.session.updateMany({
      where: { credentialId: credential.id },
      data: { isActive: false },
    });

    // Revoke all refresh tokens
    await prisma.refreshToken.updateMany({
      where: { credentialId: credential.id, isRevoked: false },
      data: {
        isRevoked: true,
        revokedAt: new Date(),
        revokedReason: 'Logout from all devices',
      },
    });

    // Clear all cached sessions
    await sessionCache.deleteUserSessions(userId);

    await auditService.log({
      userId,
      eventType: 'LOGOUT_ALL',
      eventStatus: 'success',
    });

    logger.info('User logged out from all devices', { userId });
  }

  // Change password
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    // Find credential
    const credential = await prisma.userCredential.findUnique({
      where: { userId },
    });

    if (!credential) {
      throw new HttpError(
        HTTP_STATUS.NOT_FOUND,
        'User not found',
        ERROR_CODES.USER.NOT_FOUND
      );
    }

    // Verify current password
    const isValid = await verifyPassword(currentPassword, credential.passwordHash);
    if (!isValid) {
      await auditService.log({
        userId,
        eventType: 'CHANGE_PASSWORD',
        eventStatus: 'failure',
        errorMessage: 'Invalid current password',
      });

      throw new HttpError(
        HTTP_STATUS.UNAUTHORIZED,
        'Current password is incorrect',
        ERROR_CODES.AUTH.INVALID_CREDENTIALS
      );
    }

    // Validate new password
    const validation = validatePassword(newPassword);
    if (!validation.isValid) {
      throw new HttpError(
        HTTP_STATUS.BAD_REQUEST,
        'New password does not meet requirements',
        ERROR_CODES.AUTH.WEAK_PASSWORD,
        validation.errors
      );
    }

    // Hash new password
    const newPasswordHash = await hashPassword(newPassword);

    // Update password
    await prisma.userCredential.update({
      where: { id: credential.id },
      data: {
        passwordHash: newPasswordHash,
        lastPasswordChange: new Date(),
      },
    });

    // Revoke all sessions except current (force re-login)
    await this.logoutAll(userId);

    await auditService.log({
      userId,
      eventType: 'CHANGE_PASSWORD',
      eventStatus: 'success',
    });

    logger.info('Password changed', { userId });
  }

  // Request password reset
  async requestPasswordReset(email: string): Promise<void> {
    const credential = await prisma.userCredential.findUnique({
      where: { email: email.toLowerCase() },
    });

    // Always return success to prevent email enumeration
    if (!credential) {
      logger.debug('Password reset requested for non-existent email', { email });
      return;
    }

    // Generate reset token
    const resetToken = generateSecureToken(32);
    const expiresAt = new Date(
      Date.now() + securityConfig.tokens.passwordResetExpiresHours * 60 * 60 * 1000
    );

    // Invalidate existing tokens
    await prisma.passwordResetToken.updateMany({
      where: { credentialId: credential.id, isUsed: false },
      data: { isUsed: true },
    });

    // Create new token
    await prisma.passwordResetToken.create({
      data: {
        token: hashToken(resetToken),
        credentialId: credential.id,
        expiresAt,
      },
    });

    await auditService.log({
      userId: credential.userId,
      email,
      eventType: 'PASSWORD_RESET_REQUEST',
      eventStatus: 'success',
    });

    logger.info('Password reset requested', { email });

    // TODO: Send reset email via notification service
    // For now, log the token (development only)
    logger.debug('Password reset token (DEV ONLY)', { resetToken });
  }

  // Reset password with token
  async resetPassword(token: string, newPassword: string): Promise<void> {
    const tokenHash = hashToken(token);

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token: tokenHash },
      include: { credential: true },
    });

    if (!resetToken) {
      throw new HttpError(
        HTTP_STATUS.BAD_REQUEST,
        'Invalid or expired reset token',
        ERROR_CODES.AUTH.INVALID_TOKEN
      );
    }

    if (resetToken.isUsed) {
      throw new HttpError(
        HTTP_STATUS.BAD_REQUEST,
        'Reset token has already been used',
        ERROR_CODES.AUTH.TOKEN_USED
      );
    }

    if (resetToken.expiresAt < new Date()) {
      throw new HttpError(
        HTTP_STATUS.BAD_REQUEST,
        'Reset token has expired',
        ERROR_CODES.AUTH.TOKEN_EXPIRED
      );
    }

    // Validate new password
    const validation = validatePassword(newPassword);
    if (!validation.isValid) {
      throw new HttpError(
        HTTP_STATUS.BAD_REQUEST,
        'Password does not meet requirements',
        ERROR_CODES.AUTH.WEAK_PASSWORD,
        validation.errors
      );
    }

    // Hash new password
    const newPasswordHash = await hashPassword(newPassword);

    // Update password and mark token as used
    await prisma.$transaction([
      prisma.userCredential.update({
        where: { id: resetToken.credentialId },
        data: {
          passwordHash: newPasswordHash,
          lastPasswordChange: new Date(),
          failedAttempts: 0,
          lockedUntil: null,
        },
      }),
      prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: {
          isUsed: true,
          usedAt: new Date(),
        },
      }),
    ]);

    // Logout from all devices
    await this.logoutAll(resetToken.credential.userId);

    await auditService.log({
      userId: resetToken.credential.userId,
      eventType: 'PASSWORD_RESET',
      eventStatus: 'success',
    });

    logger.info('Password reset completed', { userId: resetToken.credential.userId });
  }

  // Verify email
  async verifyEmail(token: string): Promise<void> {
    const tokenHash = hashToken(token);

    const verificationToken = await prisma.emailVerificationToken.findUnique({
      where: { token: tokenHash },
      include: { credential: true },
    });

    if (!verificationToken) {
      throw new HttpError(
        HTTP_STATUS.BAD_REQUEST,
        'Invalid verification token',
        ERROR_CODES.AUTH.INVALID_TOKEN
      );
    }

    if (verificationToken.isUsed) {
      throw new HttpError(
        HTTP_STATUS.BAD_REQUEST,
        'Email has already been verified',
        ERROR_CODES.AUTH.EMAIL_ALREADY_VERIFIED
      );
    }

    if (verificationToken.expiresAt < new Date()) {
      throw new HttpError(
        HTTP_STATUS.BAD_REQUEST,
        'Verification token has expired',
        ERROR_CODES.AUTH.TOKEN_EXPIRED
      );
    }

    await prisma.$transaction([
      prisma.userCredential.update({
        where: { id: verificationToken.credentialId },
        data: {
          emailVerified: true,
          emailVerifiedAt: new Date(),
        },
      }),
      prisma.emailVerificationToken.update({
        where: { id: verificationToken.id },
        data: {
          isUsed: true,
          usedAt: new Date(),
        },
      }),
    ]);

    await auditService.log({
      userId: verificationToken.credential.userId,
      eventType: 'EMAIL_VERIFIED',
      eventStatus: 'success',
    });

    logger.info('Email verified', { userId: verificationToken.credential.userId });
  }

  // Get active sessions
  async getSessions(userId: string): Promise<any[]> {
    const credential = await prisma.userCredential.findUnique({
      where: { userId },
    });

    if (!credential) {
      throw new HttpError(
        HTTP_STATUS.NOT_FOUND,
        'User not found',
        ERROR_CODES.USER.NOT_FOUND
      );
    }

    const sessions = await prisma.session.findMany({
      where: {
        credentialId: credential.id,
        isActive: true,
        expiresAt: { gt: new Date() },
      },
      orderBy: { lastActivityAt: 'desc' },
    });

    return sessions.map((session) => ({
      id: session.id,
      deviceInfo: session.deviceInfo,
      ipAddress: session.ipAddress,
      location: session.location,
      lastActivityAt: session.lastActivityAt,
      createdAt: session.createdAt,
    }));
  }

  // Revoke specific session
  async revokeSession(userId: string, sessionId: string): Promise<void> {
    const credential = await prisma.userCredential.findUnique({
      where: { userId },
    });

    if (!credential) {
      throw new HttpError(
        HTTP_STATUS.NOT_FOUND,
        'User not found',
        ERROR_CODES.USER.NOT_FOUND
      );
    }

    const session = await prisma.session.findFirst({
      where: {
        id: sessionId,
        credentialId: credential.id,
      },
    });

    if (!session) {
      throw new HttpError(
        HTTP_STATUS.NOT_FOUND,
        'Session not found',
        ERROR_CODES.GENERAL.NOT_FOUND
      );
    }

    await prisma.session.update({
      where: { id: sessionId },
      data: { isActive: false },
    });

    await sessionCache.delete(sessionId);

    await auditService.log({
      userId,
      eventType: 'SESSION_REVOKED',
      eventStatus: 'success',
      metadata: { revokedSessionId: sessionId },
    });

    logger.info('Session revoked', { userId, sessionId });
  }

  // Private: Enforce max sessions per user
  private async enforceMaxSessions(credentialId: string): Promise<void> {
    const activeSessions = await prisma.session.findMany({
      where: {
        credentialId,
        isActive: true,
      },
      orderBy: { lastActivityAt: 'desc' },
    });

    if (activeSessions.length > securityConfig.session.maxPerUser) {
      // Deactivate oldest sessions
      const sessionsToDeactivate = activeSessions.slice(securityConfig.session.maxPerUser);

      for (const session of sessionsToDeactivate) {
        await prisma.session.update({
          where: { id: session.id },
          data: { isActive: false },
        });
        await sessionCache.delete(session.id);
      }
    }
  }

  // Private: Revoke all tokens in a family (token reuse detection)
  private async revokeTokenFamily(familyId: string, reason: string): Promise<void> {
    await prisma.refreshToken.updateMany({
      where: { familyId, isRevoked: false },
      data: {
        isRevoked: true,
        revokedAt: new Date(),
        revokedReason: reason,
      },
    });

    logger.warn('Token family revoked due to potential attack', { familyId, reason });
  }
}

export const authService = new AuthService();
