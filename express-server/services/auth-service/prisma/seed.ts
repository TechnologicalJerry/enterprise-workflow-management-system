// ============================================
// Database Seed Script
// ============================================

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user credentials
  const adminPasswordHash = await bcrypt.hash('Admin@123456', 12);
  
  const adminCredential = await prisma.userCredential.upsert({
    where: { email: 'admin@workflow.local' },
    update: {},
    create: {
      userId: '00000000-0000-0000-0000-000000000001',
      email: 'admin@workflow.local',
      passwordHash: adminPasswordHash,
      emailVerified: true,
      emailVerifiedAt: new Date(),
    },
  });

  console.log('✅ Admin user created:', adminCredential.email);

  // Create test user credentials
  const testPasswordHash = await bcrypt.hash('Test@123456', 12);
  
  const testCredential = await prisma.userCredential.upsert({
    where: { email: 'test@workflow.local' },
    update: {},
    create: {
      userId: '00000000-0000-0000-0000-000000000002',
      email: 'test@workflow.local',
      passwordHash: testPasswordHash,
      emailVerified: true,
      emailVerifiedAt: new Date(),
    },
  });

  console.log('✅ Test user created:', testCredential.email);

  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
