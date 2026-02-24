// ============================================
// Department Repository
// ============================================

import { Department, Prisma } from '@prisma/client';
import { prisma } from '../database/prisma.js';

export const departmentRepository = {
  async findById(id: string): Promise<Department | null> {
    return prisma.department.findUnique({
      where: { id },
      include: { parent: true, _count: { select: { users: true } } },
    });
  },

  async findByCode(code: string): Promise<Department | null> {
    return prisma.department.findUnique({ where: { code } });
  },

  async list(options: { parentId?: string | null } = {}): Promise<Department[]> {
    const where: Prisma.DepartmentWhereInput = {};
    if (options.parentId !== undefined) {
      where.parentId = options.parentId;
    }
    return prisma.department.findMany({
      where,
      orderBy: { name: 'asc' },
      include: { _count: { select: { users: true } } },
    });
  },

  async create(data: Prisma.DepartmentCreateInput): Promise<Department> {
    return prisma.department.create({ data });
  },

  async update(id: string, data: Prisma.DepartmentUpdateInput): Promise<Department> {
    return prisma.department.update({ where: { id }, data });
  },

  async delete(id: string): Promise<void> {
    await prisma.department.delete({ where: { id } });
  },
};
