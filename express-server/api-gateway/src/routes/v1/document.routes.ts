// ============================================
// Document Routes - Proxy to Document Service
// ============================================

import { Router, Request, Response, NextFunction } from 'express';
import { proxyRequest } from '../../services/proxy.service.js';
import { requirePermissions } from '../../middlewares/authorization.middleware.js';
import { validate, uuidParamSchema, paginationSchema } from '../../middlewares/validation.middleware.js';
import { z } from 'zod';

const router = Router();

// ============================================
// Validation Schemas
// ============================================

const uploadDocumentSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  description: z.string().max(1000).optional(),
  folderId: z.string().uuid().optional(),
  entityType: z.string().optional(),
  entityId: z.string().uuid().optional(),
  tags: z.array(z.string()).optional(),
  metadata: z.record(z.unknown()).optional(),
});

const updateDocumentSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().max(1000).optional(),
  folderId: z.string().uuid().nullable().optional(),
  tags: z.array(z.string()).optional(),
  metadata: z.record(z.unknown()).optional(),
});

const createFolderSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  parentId: z.string().uuid().optional(),
  description: z.string().max(500).optional(),
});

const shareDocumentSchema = z.object({
  userIds: z.array(z.string().uuid()).optional(),
  roleIds: z.array(z.string().uuid()).optional(),
  permission: z.enum(['view', 'edit', 'admin']).default('view'),
  expiresAt: z.string().datetime().optional(),
});

// ============================================
// Proxy handler
// ============================================

const proxyToDocument = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const path = req.originalUrl.replace(/^\/api\/v1/, '');
    await proxyRequest(req, res, 'document', path);
  } catch (error) {
    next(error);
  }
};

// ============================================
// Document Routes
// ============================================

/**
 * @swagger
 * /api/v1/documents:
 *   get:
 *     tags: [Documents]
 *     summary: List documents
 *     description: Get paginated list of documents
 *     parameters:
 *       - in: query
 *         name: folderId
 *         schema:
 *           type: string
 *       - in: query
 *         name: entityType
 *         schema:
 *           type: string
 *       - in: query
 *         name: entityId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of documents
 */
router.get(
  '/',
  requirePermissions('documents:read'),
  validate({ query: paginationSchema }),
  proxyToDocument
);

/**
 * @swagger
 * /api/v1/documents:
 *   post:
 *     tags: [Documents]
 *     summary: Upload document
 *     description: Upload a new document
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               folderId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Document uploaded
 */
router.post(
  '/',
  requirePermissions('documents:create'),
  proxyToDocument // Note: multipart handling done by document service
);

/**
 * @swagger
 * /api/v1/documents/{id}:
 *   get:
 *     tags: [Documents]
 *     summary: Get document
 *     description: Get document details by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Document details
 */
router.get(
  '/:id',
  requirePermissions('documents:read'),
  validate({ params: uuidParamSchema }),
  proxyToDocument
);

/**
 * @swagger
 * /api/v1/documents/{id}:
 *   patch:
 *     tags: [Documents]
 *     summary: Update document
 *     description: Update document metadata
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Document updated
 */
router.patch(
  '/:id',
  requirePermissions('documents:update'),
  validate({ params: uuidParamSchema, body: updateDocumentSchema }),
  proxyToDocument
);

/**
 * @swagger
 * /api/v1/documents/{id}:
 *   delete:
 *     tags: [Documents]
 *     summary: Delete document
 *     description: Delete a document
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Document deleted
 */
router.delete(
  '/:id',
  requirePermissions('documents:delete'),
  validate({ params: uuidParamSchema }),
  proxyToDocument
);

/**
 * @swagger
 * /api/v1/documents/{id}/download:
 *   get:
 *     tags: [Documents]
 *     summary: Download document
 *     description: Download document file
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Document file
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 */
router.get(
  '/:id/download',
  requirePermissions('documents:read'),
  validate({ params: uuidParamSchema }),
  proxyToDocument
);

/**
 * @swagger
 * /api/v1/documents/{id}/versions:
 *   get:
 *     tags: [Documents]
 *     summary: Get document versions
 *     description: Get all versions of a document
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Document versions
 */
router.get(
  '/:id/versions',
  requirePermissions('documents:read'),
  validate({ params: uuidParamSchema }),
  proxyToDocument
);

/**
 * @swagger
 * /api/v1/documents/{id}/share:
 *   post:
 *     tags: [Documents]
 *     summary: Share document
 *     description: Share document with users or roles
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ShareDocument'
 *     responses:
 *       200:
 *         description: Document shared
 */
router.post(
  '/:id/share',
  requirePermissions('documents:share'),
  validate({ params: uuidParamSchema, body: shareDocumentSchema }),
  proxyToDocument
);

// ============================================
// Folder Routes
// ============================================

/**
 * @swagger
 * /api/v1/documents/folders:
 *   get:
 *     tags: [Documents]
 *     summary: List folders
 *     description: Get list of folders
 *     responses:
 *       200:
 *         description: List of folders
 */
router.get(
  '/folders',
  requirePermissions('documents:read'),
  proxyToDocument
);

/**
 * @swagger
 * /api/v1/documents/folders:
 *   post:
 *     tags: [Documents]
 *     summary: Create folder
 *     description: Create a new folder
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateFolder'
 *     responses:
 *       201:
 *         description: Folder created
 */
router.post(
  '/folders',
  requirePermissions('documents:create'),
  validate({ body: createFolderSchema }),
  proxyToDocument
);

export const documentRoutes = router;
