// ============================================
// Auth Routes v1
// ============================================

import { Router } from 'express';
import { authController } from '../../controllers/auth.controller.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { validate } from '../validation.js';
import { z } from 'zod';

const router = Router();

// ============================================
// Validation Schemas
// ============================================

const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email format'),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
});

const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Verification token is required'),
});

// ============================================
// Public Routes
// ============================================

// POST /auth/register
router.post('/register', validate({ body: registerSchema }), authController.register);

// POST /auth/login
router.post('/login', validate({ body: loginSchema }), authController.login);

// POST /auth/refresh
router.post('/refresh', validate({ body: refreshTokenSchema }), authController.refreshTokens);

// POST /auth/forgot-password
router.post('/forgot-password', validate({ body: forgotPasswordSchema }), authController.forgotPassword);

// POST /auth/reset-password
router.post('/reset-password', validate({ body: resetPasswordSchema }), authController.resetPassword);

// GET /auth/verify-email
router.get('/verify-email', validate({ query: verifyEmailSchema }), authController.verifyEmail);

// ============================================
// Protected Routes
// ============================================

// POST /auth/logout
router.post('/logout', authMiddleware, authController.logout);

// POST /auth/logout-all
router.post('/logout-all', authMiddleware, authController.logoutAll);

// POST /auth/change-password
router.post('/change-password', authMiddleware, validate({ body: changePasswordSchema }), authController.changePassword);

// GET /auth/sessions
router.get('/sessions', authMiddleware, authController.getSessions);

// DELETE /auth/sessions/:sessionId
router.delete('/sessions/:sessionId', authMiddleware, authController.revokeSession);

export const authRoutes = router;
