/**
 * Seed script — creates a single demo user for local development.
 * Never run in production.
 */
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const email = 'demo@picflow.local';
  const passwordHash = await bcrypt.hash('demodemo', 10);

  await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      username: 'demo',
      passwordHash,
    },
  });

  // eslint-disable-next-line no-console
  console.log(`Seeded demo user: ${email} / demodemo`);
}

main()
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
