// ============================================
// API v1 Routes
// ============================================

import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { rateLimitConfig } from '../../config/rate-limit.config.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';

// Route imports
import { authRoutes } from './auth.routes.js';
import { userRoutes } from './user.routes.js';
import { workflowRoutes } from './workflow.routes.js';
import { taskRoutes } from './task.routes.js';
import { approvalRoutes } from './approval.routes.js';
import { documentRoutes } from './document.routes.js';
import { notificationRoutes } from './notification.routes.js';
import { reportingRoutes } from './reporting.routes.js';

const router = Router();

// ============================================
// Public Routes (no auth required)
// ============================================

// Auth routes with stricter rate limiting
router.use('/auth', rateLimit(rateLimitConfig.auth), authRoutes);

// ============================================
// Protected Routes (auth required)
// ============================================

// Apply authentication to all routes below
router.use(authMiddleware);

// Apply API rate limiting
router.use(rateLimit(rateLimitConfig.api));

// User management
router.use('/users', userRoutes);

// Workflow management
router.use('/workflows', workflowRoutes);

// Task management
router.use('/tasks', taskRoutes);

// Approval management
router.use('/approvals', approvalRoutes);

// Document management
router.use('/documents', documentRoutes);

// Notification management
router.use('/notifications', notificationRoutes);

// Reporting
router.use('/reports', reportingRoutes);

export const apiRoutes = router;
