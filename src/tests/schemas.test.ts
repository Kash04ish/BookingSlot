import { describe, expect, it } from 'vitest';
import { createBookingSchema } from '@/lib/schemas';

const valid = {
  slotId: 'slot_123',
  customerName: 'Alex Doe',
  customerEmail: 'alex@example.com',
  customerPhone: '555-1234',
  notes: 'Leave at the door',
};

describe('createBookingSchema', () => {
  it('accepts a valid input', () => {
    expect(createBookingSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects empty name', () => {
    const result = createBookingSchema.safeParse({ ...valid, customerName: '' });
    expect(result.success).toBe(false);
  });

  it('rejects names shorter than 2 characters', () => {
    const result = createBookingSchema.safeParse({ ...valid, customerName: 'A' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid email', () => {
    const result = createBookingSchema.safeParse({
      ...valid,
      customerEmail: 'not-an-email',
    });
    expect(result.success).toBe(false);
  });

  it('trims whitespace on name and email', () => {
    const result = createBookingSchema.safeParse({
      ...valid,
      customerName: '  Alex Doe  ',
      customerEmail: '  alex@example.com  ',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.customerName).toBe('Alex Doe');
      expect(result.data.customerEmail).toBe('alex@example.com');
    }
  });

  it('allows empty string for phone and notes', () => {
    const result = createBookingSchema.safeParse({
      ...valid,
      customerPhone: '',
      notes: '',
    });
    expect(result.success).toBe(true);
  });

  it('rejects notes longer than 500 characters', () => {
    const result = createBookingSchema.safeParse({
      ...valid,
      notes: 'x'.repeat(501),
    });
    expect(result.success).toBe(false);
  });
});
