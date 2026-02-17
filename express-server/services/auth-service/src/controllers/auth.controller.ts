// ============================================
// Authentication Controller
// ============================================

import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service.js';
import { HTTP_STATUS } from '@workflow/shared';
import { logger } from '../utils/logger.js';

// Extend Express Request
declare global {
  namespace Express {
    interface Request {
      correlationId: string;
      user?: {
        sub: string;
        email: string;
        roles: string[];
        permissions: string[];
        sessionId: string;
      };
    }
  }
}

class AuthController {
  // POST /auth/register
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password, firstName, lastName } = req.body;

      await authService.register({
        email,
        password,
        firstName,
        lastName,
      });

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: 'Registration successful. Please verify your email.',
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /auth/login
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;

      const result = await authService.login({
        email,
        password,
        deviceInfo: req.headers['x-device-info'] as string,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: {
          accessToken: result.tokens.accessToken,
          refreshToken: result.tokens.refreshToken,
          expiresIn: result.tokens.expiresIn,
          tokenType: 'Bearer',
          user: result.user,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /auth/refresh
  async refreshTokens(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;

      const tokens = await authService.refreshTokens({
        refreshToken,
        deviceInfo: req.headers['x-device-info'] as string,
        ipAddress: req.ip,
      });

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresIn: tokens.expiresIn,
          tokenType: 'Bearer',
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /auth/logout
  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const accessToken = req.headers.authorization?.split(' ')[1] || '';

      await authService.logout(
        req.user!.sub,
        req.user!.sessionId,
        accessToken
      );

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /auth/logout-all
  async logoutAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await authService.logoutAll(req.user!.sub);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Logged out from all devices',
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /auth/change-password
  async changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { currentPassword, newPassword } = req.body;

      await authService.changePassword(
        req.user!.sub,
        currentPassword,
        newPassword
      );

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Password changed successfully. Please log in again.',
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /auth/forgot-password
  async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.body;

      await authService.requestPasswordReset(email);

      // Always return success to prevent email enumeration
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'If an account exists with this email, you will receive a password reset link.',
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /auth/reset-password
  async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token, password } = req.body;

      await authService.resetPassword(token, password);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Password reset successfully. Please log in with your new password.',
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /auth/verify-email
  async verifyEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token } = req.query;

      await authService.verifyEmail(token as string);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Email verified successfully.',
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /auth/sessions
  async getSessions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const sessions = await authService.getSessions(req.user!.sub);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: sessions,
      });
    } catch (error) {
      next(error);
    }
  }

  // DELETE /auth/sessions/:sessionId
  async revokeSession(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sessionId } = req.params;

      await authService.revokeSession(req.user!.sub, sessionId);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Session revoked successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
