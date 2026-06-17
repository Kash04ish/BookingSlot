import { describe, expect, it } from 'vitest';
import { prisma } from '@/lib/prisma';
import { bookSlot } from '@/lib/booking';
import { BookingError } from '@/lib/errors';

async function createSlot(capacity = 1, hoursFromNow = 1) {
  const startsAt = new Date(Date.now() + hoursFromNow * 60 * 60 * 1000);
  const endsAt = new Date(startsAt.getTime() + 60 * 60 * 1000);
  return prisma.slot.create({ data: { startsAt, endsAt, capacity } });
}

function input(slotId: string, suffix = '') {
  return {
    slotId,
    customerName: `Alex${suffix || ''}`,
    customerEmail: `alex${suffix || ''}@example.com`,
    customerPhone: '',
    notes: '',
  };
}

describe('bookSlot', () => {
  it('books a slot successfully when capacity is available', async () => {
    const slot = await createSlot(2);
    const booking = await bookSlot(input(slot.id));
    expect(booking.slotId).toBe(slot.id);
    expect(booking.customerName).toBe('Alex');
    const count = await prisma.booking.count({ where: { slotId: slot.id } });
    expect(count).toBe(1);
  });

  it('throws SLOT_NOT_FOUND for an unknown slotId', async () => {
    await expect(bookSlot(input('nope'))).rejects.toMatchObject({
      name: 'BookingError',
      code: 'SLOT_NOT_FOUND',
    });
  });

  it('throws SLOT_FULL when the slot is already at capacity', async () => {
    const slot = await createSlot(1);
    await bookSlot(input(slot.id, '1'));
    await expect(bookSlot(input(slot.id, '2'))).rejects.toMatchObject({
      name: 'BookingError',
      code: 'SLOT_FULL',
    });
  });

  it('throws INVALID_INPUT when input fails validation', async () => {
    const slot = await createSlot(1);
    await expect(
      bookSlot({ ...input(slot.id), customerName: '' }),
    ).rejects.toMatchObject({ name: 'BookingError', code: 'INVALID_INPUT' });
  });

  it('prevents overbooking under concurrent requests', { timeout: 30000 }, async () => {
    const CAPACITY = 5;
    const ATTEMPTS = 12;
    const slot = await createSlot(CAPACITY);

    const results = await Promise.allSettled(
      Array.from({ length: ATTEMPTS }, (_, i) =>
        bookSlot(input(slot.id, String(i))),
      ),
    );

    const fulfilled = results.filter((r) => r.status === 'fulfilled');
    const rejected = results.filter((r) => r.status === 'rejected');

    expect(fulfilled).toHaveLength(CAPACITY);
    expect(rejected).toHaveLength(ATTEMPTS - CAPACITY);

    for (const r of rejected) {
      const reason = (r as PromiseRejectedResult).reason;
      expect(reason).toBeInstanceOf(BookingError);
      expect(reason.code).toBe('SLOT_FULL');
    }

    const dbCount = await prisma.booking.count({ where: { slotId: slot.id } });
    expect(dbCount).toBe(CAPACITY);
  });
});
