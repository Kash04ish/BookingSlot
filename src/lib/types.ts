export type SlotWithAvailability = {
  id: string;
  startsAt: string;
  endsAt: string;
  capacity: number;
  bookedCount: number;
  available: number;
  isFull: boolean;
};

export type BookingDTO = {
  id: string;
  slotId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  notes: string | null;
  createdAt: string;
};

export type ApiError = {
  error: { code: string; message: string; details?: unknown };
};
