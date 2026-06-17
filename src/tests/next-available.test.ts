import { describe, expect, it } from 'vitest';
import { prisma } from '@/lib/prisma';
import { getNextAvailable } from '@/lib/slots';

async function createSlot(opts: {
  hoursFromNow: number;
  capacity: number;
  filled?: number;
}) {
  const startsAt = new Date(Date.now() + opts.hoursFromNow * 60 * 60 * 1000);
  const endsAt = new Date(startsAt.getTime() + 60 * 60 * 1000);
  const slot = await prisma.slot.create({
    data: { startsAt, endsAt, capacity: opts.capacity },
  });
  for (let i = 0; i < (opts.filled ?? 0); i++) {
    await prisma.booking.create({
      data: {
        slotId: slot.id,
        customerName: `Filler ${i}`,
        customerEmail: `f${i}@example.com`,
      },
    });
  }
  return slot;
}

describe('getNextAvailable', () => {
  it('returns null when there are no future slots', async () => {
    expect(await getNextAvailable()).toBeNull();
  });

  it('returns the only future available slot', async () => {
    const slot = await createSlot({ hoursFromNow: 2, capacity: 3 });
    const next = await getNextAvailable();
    expect(next?.id).toBe(slot.id);
  });

  it('returns the earliest future slot with availability', async () => {
    const early = await createSlot({ hoursFromNow: 1, capacity: 2 });
    await createSlot({ hoursFromNow: 5, capacity: 2 });
    const next = await getNextAvailable();
    expect(next?.id).toBe(early.id);
  });

  it('skips full slots and returns the next slot with room', async () => {
    await createSlot({ hoursFromNow: 1, capacity: 1, filled: 1 });
    const later = await createSlot({ hoursFromNow: 3, capacity: 2 });
    const next = await getNextAvailable();
    expect(next?.id).toBe(later.id);
  });

  it('ignores past slots even if they have availability', async () => {
    await createSlot({ hoursFromNow: -2, capacity: 5 });
    const future = await createSlot({ hoursFromNow: 2, capacity: 5 });
    const next = await getNextAvailable();
    expect(next?.id).toBe(future.id);
  });
});
