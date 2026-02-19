import { Role, Prisma } from '@prisma/client';
import { prisma } from '../database/prisma.js';

export const roleRepository = {
  async findById(id: string): Promise<Role | null> {
    return prisma.role.findUnique({
      where: { id },
      include: {
        rolePermissions: { include: { permission: true } },
      },
    });
  },

  async findByName(name: string): Promise<Role | null> {
    return prisma.role.findUnique({
      where: { name },
      include: { rolePermissions: { include: { permission: true } } },
    });
  },

  async findByNames(names: string[]): Promise<Role[]> {
    return prisma.role.findMany({
      where: { name: { in: names } },
      include: { rolePermissions: { include: { permission: true } } },
    });
  },

  async list(): Promise<Role[]> {
    return prisma.role.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { rolePermissions: true, userRoles: true } },
      },
    });
  },

  async create(data: Prisma.RoleCreateInput): Promise<Role> {
    return prisma.role.create({ data });
  },

  async update(id: string, data: Prisma.RoleUpdateInput): Promise<Role> {
    return prisma.role.update({ where: { id }, data });
  },

  async delete(id: string): Promise<void> {
    await prisma.role.delete({ where: { id } });
  },
};
