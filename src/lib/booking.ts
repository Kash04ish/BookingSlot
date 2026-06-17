import { prisma } from './prisma';
import { BookingError } from './errors';
import { createBookingSchema, type CreateBookingInput } from './schemas';
import type { BookingDTO } from './types';

function emptyToNull(value: string | undefined | null): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
}

// Per-slot in-process mutex. Concurrent requests for the same slot queue here so
// the capacity check and the insert happen atomically, without relying solely on
// SQLite-level lock contention (which surfaces as transient driver errors).
const slotLocks = new Map<string, Promise<unknown>>();

async function withSlotLock<T>(
  slotId: string,
  fn: () => Promise<T>,
): Promise<T> {
  const prev = slotLocks.get(slotId) ?? Promise.resolve();
  const current = prev.then(fn, fn);
  const safe = current.then(
    () => {},
    () => {},
  );
  slotLocks.set(slotId, safe);
  try {
    return await current;
  } finally {
    if (slotLocks.get(slotId) === safe) slotLocks.delete(slotId);
  }
}

export async function bookSlot(
  input: CreateBookingInput,
): Promise<BookingDTO> {
  const parsed = createBookingSchema.safeParse(input);
  if (!parsed.success) {
    throw new BookingError(
      'INVALID_INPUT',
      'Invalid booking input',
      400,
      parsed.error.flatten(),
    );
  }

  const data = parsed.data;
  const customerPhone = emptyToNull(data.customerPhone);
  const notes = emptyToNull(data.notes);

  const booking = await withSlotLock(data.slotId, () =>
    prisma.$transaction(
      async (tx) => {
        const slot = await tx.slot.findUnique({
          where: { id: data.slotId },
          include: { _count: { select: { bookings: true } } },
        });
        if (!slot) {
          throw new BookingError('SLOT_NOT_FOUND', 'Slot not found', 404);
        }
        if (slot._count.bookings >= slot.capacity) {
          throw new BookingError('SLOT_FULL', 'This slot is fully booked', 409);
        }
        return tx.booking.create({
          data: {
            slotId: slot.id,
            customerName: data.customerName.trim(),
            customerEmail: data.customerEmail.trim().toLowerCase(),
            customerPhone,
            notes,
          },
        });
      },
      { maxWait: 15000, timeout: 15000 },
    ),
  );

  return {
    id: booking.id,
    slotId: booking.slotId,
    customerName: booking.customerName,
    customerEmail: booking.customerEmail,
    customerPhone: booking.customerPhone,
    notes: booking.notes,
    createdAt: booking.createdAt.toISOString(),
  };
}
