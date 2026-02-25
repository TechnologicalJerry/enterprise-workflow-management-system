import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  // No seed required for instances; they are created at runtime.
}
main().finally(() => prisma.$disconnect());
