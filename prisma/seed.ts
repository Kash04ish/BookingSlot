import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const DAYS = 7;
const START_HOUR = 9;
const END_HOUR = 18;
const CAPACITY = 5;

async function main() {
  const today = new Date();
  today.setMinutes(0, 0, 0);

  const slots: { startsAt: Date; endsAt: Date; capacity: number }[] = [];
  for (let d = 0; d < DAYS; d++) {
    for (let h = START_HOUR; h < END_HOUR; h++) {
      const startsAt = new Date(today);
      startsAt.setDate(today.getDate() + d);
      startsAt.setHours(h, 0, 0, 0);
      const endsAt = new Date(startsAt);
      endsAt.setHours(h + 1, 0, 0, 0);
      slots.push({ startsAt, endsAt, capacity: CAPACITY });
    }
  }

  let created = 0;
  let updated = 0;
  for (const slot of slots) {
    const result = await prisma.slot.upsert({
      where: { startsAt: slot.startsAt },
      update: { endsAt: slot.endsAt, capacity: slot.capacity },
      create: slot,
    });
    if (result.createdAt.getTime() > Date.now() - 5000) {
      created++;
    } else {
      updated++;
    }
  }

  console.log(
    `Seed complete: ${created} slots created, ${updated} updated (${slots.length} total).`,
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
