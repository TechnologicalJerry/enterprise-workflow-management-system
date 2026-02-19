import { Permission, Prisma } from '@prisma/client';
import { prisma } from '../database/prisma.js';

export const permissionRepository = {
  async findById(id: string): Promise<Permission | null> {
    return prisma.permission.findUnique({ where: { id } });
  },

  async findByName(name: string): Promise<Permission | null> {
    return prisma.permission.findUnique({ where: { name } });
  },

  async list(options: { resource?: string } = {}): Promise<Permission[]> {
    const where: Prisma.PermissionWhereInput = {};
    if (options.resource) where.resource = options.resource;
    return prisma.permission.findMany({
      where,
      orderBy: [{ resource: 'asc' }, { action: 'asc' }],
    });
  },

  async create(data: Prisma.PermissionCreateInput): Promise<Permission> {
    return prisma.permission.create({ data });
  },

  async update(id: string, data: Prisma.PermissionUpdateInput): Promise<Permission> {
    return prisma.permission.update({ where: { id }, data });
  },

  async delete(id: string): Promise<void> {
    await prisma.permission.delete({ where: { id } });
  },
};
