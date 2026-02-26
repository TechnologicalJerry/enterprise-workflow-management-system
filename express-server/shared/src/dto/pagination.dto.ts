// ============================================
// Pagination DTOs
// ============================================

import { z } from 'zod';
import { DEFAULT_PAGE, DEFAULT_LIMIT, MAX_LIMIT } from '../types/pagination.types.js';

export const PaginationQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : DEFAULT_PAGE))
    .pipe(z.number().int().positive()),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : DEFAULT_LIMIT))
    .pipe(z.number().int().positive().max(MAX_LIMIT)),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

export type PaginationQueryDto = z.infer<typeof PaginationQuerySchema>;

export const CursorPaginationQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : DEFAULT_LIMIT))
    .pipe(z.number().int().positive().max(MAX_LIMIT)),
  direction: z.enum(['forward', 'backward']).optional().default('forward'),
});

export type CursorPaginationQueryDto = z.infer<typeof CursorPaginationQuerySchema>;
