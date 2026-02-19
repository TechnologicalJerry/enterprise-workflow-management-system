// ============================================
// Permission Service - Seed roles and permissions from shared constants
// ============================================

import { PrismaClient } from '@prisma/client';
import { PERMISSIONS, ROLES, ROLE_PERMISSIONS } from '@workflow/shared';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding permission-service...');

  // Create permissions from shared PERMISSIONS
  const permissionNames = Object.values(PERMISSIONS);
  const createdPerms: Record<string, string> = {};

  for (const name of permissionNames) {
    const [resource, action] = name.split(':');
    const p = await prisma.permission.upsert({
      where: { name },
      update: {},
      create: { name, resource, action },
    });
    createdPerms[name] = p.id;
  }

  // Create roles from shared ROLES
  const roleNames = Object.values(ROLES);
  const createdRoles: Record<string, string> = {};

  for (const name of roleNames) {
    const r = await prisma.role.upsert({
      where: { name },
      update: {},
      create: { name, description: `System role: ${name}`, isSystem: true },
    });
    createdRoles[name] = r.id;
  }

  // Assign permissions to roles per ROLE_PERMISSIONS
  for (const [roleName, perms] of Object.entries(ROLE_PERMISSIONS)) {
    const roleId = createdRoles[roleName];
    if (!roleId) continue;

    for (const permName of perms) {
      const permissionId = createdPerms[permName];
      if (!permissionId) continue;

      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: { roleId, permissionId },
        },
        create: { roleId, permissionId },
        update: {},
      });
    }
  }

  // Assign default roles to seed users (admin and test from user-service)
  const adminUserId = '00000000-0000-0000-0000-000000000001';
  const testUserId = '00000000-0000-0000-0000-000000000002';

  await prisma.userRole.upsert({
    where: {
      userId_roleId: { userId: adminUserId, roleId: createdRoles[ROLES.SUPER_ADMIN] },
    },
    create: { userId: adminUserId, roleId: createdRoles[ROLES.SUPER_ADMIN] },
    update: {},
  });

  await prisma.userRole.upsert({
    where: {
      userId_roleId: { userId: testUserId, roleId: createdRoles[ROLES.USER] },
    },
    create: { userId: testUserId, roleId: createdRoles[ROLES.USER] },
    update: {},
  });

  console.log('Permission-service seed completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
