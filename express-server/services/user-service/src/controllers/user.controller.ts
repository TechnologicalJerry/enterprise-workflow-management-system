// ============================================
// User Controller
// ============================================

import { Request, Response, NextFunction } from 'express';
import { userService } from '../services/user.service.js';
import { HTTP_STATUS } from '@workflow/shared';

declare global {
  namespace Express {
    interface Request {
      correlationId: string;
      userId?: string;
    }
  }
}

class UserController {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;
      const search = req.query.search as string | undefined;
      const status = req.query.status as string | undefined;
      const departmentId = req.query.departmentId as string | undefined;
      const role = req.query.role as string | undefined;
      const sortBy = req.query.sortBy as string | undefined;
      const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc';

      const result = await userService.list(
        {
          page,
          limit,
          search,
          status: status as any,
          departmentId,
          role,
          sortBy,
          sortOrder,
        },
        req.correlationId
      );

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: result.users,
        pagination: {
          currentPage: result.page,
          itemsPerPage: result.limit,
          totalItems: result.total,
          totalPages: result.totalPages,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await userService.create(req.body, req.correlationId);
      res.status(HTTP_STATUS.CREATED).json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId || req.params.id;
      if (!userId) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          error: { code: 'ERR_2010', message: 'User context required' },
        });
        return;
      }
      const user = await userService.getMe(userId, req.correlationId);
      res.status(HTTP_STATUS.OK).json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  async updateMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          error: { code: 'ERR_2010', message: 'User context required' },
        });
        return;
      }
      const user = await userService.update(userId, req.body, req.correlationId);
      res.status(HTTP_STATUS.OK).json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const includeRoles = req.query.includeRoles === 'true';
      const user = await userService.getById(id, includeRoles, req.correlationId);
      if (!user) {
        res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          error: { code: 'ERR_4000', message: 'User not found' },
        });
        return;
      }
      res.status(HTTP_STATUS.OK).json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const user = await userService.update(id, req.body, req.correlationId);
      res.status(HTTP_STATUS.OK).json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await userService.delete(id, req.correlationId);
      res.status(HTTP_STATUS.OK).json({ success: true, message: 'User deleted' });
    } catch (error) {
      next(error);
    }
  }

  async updateRoles(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { roles } = req.body as { roles: string[] };
      const user = await userService.updateRoles(id, roles, req.correlationId);
      res.status(HTTP_STATUS.OK).json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  async activate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const user = await userService.activate(id, req.correlationId);
      res.status(HTTP_STATUS.OK).json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  async deactivate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const user = await userService.deactivate(id, req.correlationId);
      res.status(HTTP_STATUS.OK).json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();
