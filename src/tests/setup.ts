import { execSync } from 'node:child_process';
import { afterAll, beforeAll, beforeEach } from 'vitest';

process.env.DATABASE_URL = 'file:./prisma/test.db';

let prisma: typeof import('@/lib/prisma').prisma;

beforeAll(async () => {
  execSync('npx prisma db push --force-reset --accept-data-loss --skip-generate', {
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: 'file:./prisma/test.db' },
  });
  ({ prisma } = await import('@/lib/prisma'));
});

beforeEach(async () => {
  if (!prisma) {
    ({ prisma } = await import('@/lib/prisma'));
  }
  await prisma.booking.deleteMany();
  await prisma.slot.deleteMany();
});

afterAll(async () => {
  if (prisma) await prisma.$disconnect();
});
