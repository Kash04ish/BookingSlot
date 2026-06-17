import { prisma } from './prisma';
import type { BookingDTO, SlotWithAvailability } from './types';

const DEFAULT_WINDOW_DAYS = 7;

type SlotRow = {
  id: string;
  startsAt: Date;
  endsAt: Date;
  capacity: number;
  _count: { bookings: number };
};

function toView(slot: SlotRow): SlotWithAvailability {
  const bookedCount = slot._count.bookings;
  const available = Math.max(0, slot.capacity - bookedCount);
  return {
    id: slot.id,
    startsAt: slot.startsAt.toISOString(),
    endsAt: slot.endsAt.toISOString(),
    capacity: slot.capacity,
    bookedCount,
    available,
    isFull: bookedCount >= slot.capacity,
  };
}

export async function listSlots(args?: {
  from?: string;
  to?: string;
}): Promise<SlotWithAvailability[]> {
  const now = new Date();
  const from = args?.from ? new Date(args.from) : now;
  const to = args?.to
    ? new Date(args.to)
    : new Date(now.getTime() + DEFAULT_WINDOW_DAYS * 24 * 60 * 60 * 1000);

  const slots = await prisma.slot.findMany({
    where: { startsAt: { gte: from, lte: to } },
    orderBy: { startsAt: 'asc' },
    include: { _count: { select: { bookings: true } } },
  });

  return slots.map(toView);
}

export async function getNextAvailable(): Promise<SlotWithAvailability | null> {
  const now = new Date();
  const slots = await prisma.slot.findMany({
    where: { startsAt: { gt: now } },
    orderBy: { startsAt: 'asc' },
    include: { _count: { select: { bookings: true } } },
  });
  for (const slot of slots) {
    if (slot._count.bookings < slot.capacity) {
      return toView(slot);
    }
  }
  return null;
}

export async function getBookingsForEmail(
  email: string,
): Promise<BookingDTO[]> {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return [];
  const rows = await prisma.booking.findMany({
    where: { customerEmail: normalized },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });
  return rows.map((b) => ({
    id: b.id,
    slotId: b.slotId,
    customerName: b.customerName,
    customerEmail: b.customerEmail,
    customerPhone: b.customerPhone,
    notes: b.notes,
    createdAt: b.createdAt.toISOString(),
  }));
}
