// ============================================
// User Repository
// ============================================

import { Prisma, User, UserStatus } from '@prisma/client';
import { prisma } from '../database/prisma.js';

export interface ListUsersOptions {
  page?: number;
  limit?: number;
  search?: string;
  status?: UserStatus;
  departmentId?: string;
  role?: string; // Filter by role name (requires permission service join in app layer)
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ListUsersResult {
  users: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const defaultOrderBy: Prisma.UserOrderByWithRelationInput = { createdAt: 'desc' };

export const userRepository = {
  async findById(id: string): Promise<User | null> {
    return prisma.user.findFirst({
      where: { id, deletedAt: null },
      include: { department: true },
    });
  },

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findFirst({
      where: { email: email.toLowerCase(), deletedAt: null },
      include: { department: true },
    });
  },

  async list(options: ListUsersOptions = {}): Promise<ListUsersResult> {
    const page = Math.max(1, options.page ?? 1);
    const limit = Math.min(100, Math.max(1, options.limit ?? 20));
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = { deletedAt: null };

    if (options.status) {
      where.status = options.status;
    }

    if (options.departmentId) {
      where.departmentId = options.departmentId;
    }

    if (options.search && options.search.trim()) {
      const term = options.search.trim();
      where.OR = [
        { email: { contains: term, mode: 'insensitive' } },
        { firstName: { contains: term, mode: 'insensitive' } },
        { lastName: { contains: term, mode: 'insensitive' } },
      ];
    }

    const orderBy = options.sortBy
      ? { [options.sortBy]: options.sortOrder ?? 'desc' }
      : defaultOrderBy;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: orderBy as Prisma.UserOrderByWithRelationInput,
        skip,
        take: limit,
        include: { department: true },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return prisma.user.create({
      data,
      include: { department: true },
    });
  },

  async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return prisma.user.update({
      where: { id },
      data,
      include: { department: true },
    });
  },

  async softDelete(id: string): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'INACTIVE' },
      include: { department: true },
    });
  },

  async exists(id: string): Promise<boolean> {
    const count = await prisma.user.count({
      where: { id, deletedAt: null },
    });
    return count > 0;
  },
};
