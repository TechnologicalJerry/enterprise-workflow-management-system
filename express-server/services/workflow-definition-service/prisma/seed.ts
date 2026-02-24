import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  await prisma.workflowDefinition.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Sample Approval Workflow',
      description: 'Simple approval flow',
      version: '1.0.0',
      status: 'active',
      steps: [{ id: 'start', name: 'Start', type: 'task' }, { id: 'approve', name: 'Approve', type: 'approval' }, { id: 'end', name: 'End', type: 'task' }],
    },
  });
}
main().finally(() => prisma.$disconnect());
