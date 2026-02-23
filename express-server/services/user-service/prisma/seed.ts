import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding user-service...');

  const engineering = await prisma.department.upsert({
    where: { code: 'ENG' },
    update: {},
    create: {
      name: 'Engineering',
      code: 'ENG',
      description: 'Software development and IT',
    },
  });

  const hr = await prisma.department.upsert({
    where: { code: 'HR' },
    update: {},
    create: {
      name: 'Human Resources',
      code: 'HR',
      description: 'HR and People',
    },
  });

  await prisma.user.upsert({
    where: { email: 'admin@workflow.local' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      email: 'admin@workflow.local',
      firstName: 'Admin',
      lastName: 'User',
      status: 'ACTIVE',
      emailVerified: true,
      departmentId: engineering.id,
    },
  });

  await prisma.user.upsert({
    where: { email: 'test@workflow.local' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000002',
      email: 'test@workflow.local',
      firstName: 'Test',
      lastName: 'User',
      status: 'ACTIVE',
      emailVerified: true,
      departmentId: engineering.id,
    },
  });

  console.log('User-service seed completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
