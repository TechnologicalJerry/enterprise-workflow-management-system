import { prisma } from '../database/prisma.js';

export const userRoleRepository = {
  async getRoleIdsByUserId(userId: string): Promise<string[]> {
    const rows = await prisma.userRole.findMany({
      where: { userId },
      select: { roleId: true },
    });
    return rows.map((r) => r.roleId);
  },

  async getUserRolesAndPermissions(userId: string): Promise<{
    roleNames: string[];
    permissionNames: string[];
  }> {
    const userRoles = await prisma.userRole.findMany({
      where: { userId },
      include: {
        role: {
          include: {
            rolePermissions: { include: { permission: true } },
          },
        },
      },
    });

    const roleNames = userRoles.map((ur) => ur.role.name);
    const permissionSet = new Set<string>();
    for (const ur of userRoles) {
      for (const rp of ur.role.rolePermissions) {
        permissionSet.add(rp.permission.name);
      }
    }

    return {
      roleNames,
      permissionNames: Array.from(permissionSet),
    };
  },

  async setUserRoles(userId: string, roleIds: string[]): Promise<void> {
    await prisma.$transaction(async (tx) => {
      await tx.userRole.deleteMany({ where: { userId } });
      if (roleIds.length > 0) {
        await tx.userRole.createMany({
          data: roleIds.map((roleId) => ({ userId, roleId })),
          skipDuplicates: true,
        });
      }
    });
  },

  async addRoleToUser(userId: string, roleId: string): Promise<void> {
    await prisma.userRole.upsert({
      where: {
        userId_roleId: { userId, roleId },
      },
      create: { userId, roleId },
      update: {},
    });
  },

  async removeRoleFromUser(userId: string, roleId: string): Promise<void> {
    await prisma.userRole.deleteMany({
      where: { userId, roleId },
    });
  },
};
