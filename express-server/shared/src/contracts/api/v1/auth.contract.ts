// ============================================
// Auth API Contract v1
// ============================================

import { z } from 'zod';
import { BasicEmailSchema } from '../../../validators/email.validator.js';
import { StrongPasswordSchema } from '../../../validators/password.validator.js';

/**
 * Login request schema
 */
export const LoginRequestSchema = z.object({
  email: BasicEmailSchema,
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional().default(false),
});

export type LoginRequest = z.infer<typeof LoginRequestSchema>;

/**
 * Login response schema
 */
export const LoginResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresIn: z.number(),
  tokenType: z.literal('Bearer'),
  user: z.object({
    id: z.string().uuid(),
    email: z.string().email(),
    firstName: z.string(),
    lastName: z.string(),
    roles: z.array(z.string()),
  }),
});

export type LoginResponse = z.infer<typeof LoginResponseSchema>;

/**
 * Register request schema
 */
export const RegisterRequestSchema = z.object({
  email: BasicEmailSchema,
  password: StrongPasswordSchema,
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
});

export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;

/**
 * Refresh token request schema
 */
export const RefreshTokenRequestSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export type RefreshTokenRequest = z.infer<typeof RefreshTokenRequestSchema>;

/**
 * Logout request schema
 */
export const LogoutRequestSchema = z.object({
  refreshToken: z.string().optional(),
  allDevices: z.boolean().optional().default(false),
});

export type LogoutRequest = z.infer<typeof LogoutRequestSchema>;

/**
 * Password reset request schema
 */
export const PasswordResetRequestSchema = z.object({
  email: BasicEmailSchema,
});

export type PasswordResetRequest = z.infer<typeof PasswordResetRequestSchema>;

/**
 * Password reset confirmation schema
 */
export const PasswordResetConfirmSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: StrongPasswordSchema,
});

export type PasswordResetConfirm = z.infer<typeof PasswordResetConfirmSchema>;

/**
 * Change password request schema
 */
export const ChangePasswordRequestSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: StrongPasswordSchema,
});

export type ChangePasswordRequest = z.infer<typeof ChangePasswordRequestSchema>;
