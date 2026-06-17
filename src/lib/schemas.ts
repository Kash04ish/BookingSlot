import { z } from 'zod';

export const createBookingSchema = z.object({
  slotId: z.string().min(1, 'Slot is required'),
  customerName: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be at most 100 characters'),
  customerEmail: z.string().trim().email('Enter a valid email'),
  customerPhone: z
    .string()
    .trim()
    .max(20, 'Phone must be at most 20 characters')
    .optional()
    .or(z.literal('')),
  notes: z
    .string()
    .trim()
    .max(500, 'Notes must be at most 500 characters')
    .optional()
    .or(z.literal('')),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;

export const listSlotsQuerySchema = z.object({
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
});

export type ListSlotsQuery = z.infer<typeof listSlotsQuerySchema>;

export const emailQuerySchema = z.object({
  email: z.string().trim().email().optional(),
});
