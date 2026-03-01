// ============================================
// Authentication Types
// ============================================

import type { UUID } from './common.types.js';
import type { Permission, Role } from '../constants/permissions.constants.js';

export interface JwtAccessPayload {
  sub: UUID; // User ID
  email: string;
  roles: Role[];
  permissions: Permission[];
  sessionId: UUID;
  iat: number;
  exp: number;
  iss: string;
  aud: string;
}

export interface JwtRefreshPayload {
  sub: UUID; // User ID
  tokenId: UUID;
  sessionId: UUID;
  iat: number;
  exp: number;
  iss: string;
  aud: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
}

export interface AuthenticatedUser {
  id: UUID;
  email: string;
  roles: Role[];
  permissions: Permission[];
  sessionId: UUID;
}

export interface Session {
  id: UUID;
  userId: UUID;
  deviceInfo: DeviceInfo;
  ipAddress: string;
  userAgent: string;
  createdAt: Date;
  lastActivityAt: Date;
  expiresAt: Date;
  isActive: boolean;
}

export interface DeviceInfo {
  type: 'desktop' | 'mobile' | 'tablet' | 'unknown';
  os: string;
  browser: string;
  fingerprint?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
  deviceInfo?: DeviceInfo;
}

export interface RegistrationData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirmation {
  token: string;
  newPassword: string;
}

export interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
}

export interface MfaSetupResponse {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
}

export interface MfaVerificationRequest {
  code: string;
  trustDevice?: boolean;
}

export type AuthEvent =
  | 'login'
  | 'logout'
  | 'token_refresh'
  | 'password_change'
  | 'password_reset'
  | 'mfa_enable'
  | 'mfa_disable'
  | 'session_revoked';
