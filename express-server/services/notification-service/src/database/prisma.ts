import { PrismaClient } from '@prisma/client';
const g = globalThis as unknown as { prisma: PrismaClient | undefined };
export const prisma = g.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== 'production') g.prisma = prisma;
export async function connectDatabase() { await prisma.$connect(); }
export async function disconnectDatabase() { await prisma.$disconnect(); }
export async function checkDatabaseHealth(): Promise<boolean> { try { await prisma.$queryRaw`SELECT 1`; return true; } catch { return false; } }
