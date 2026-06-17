import { NextResponse, type NextRequest } from 'next/server';
import { bookSlot } from '@/lib/booking';
import { getBookingsForEmail } from '@/lib/slots';
import { createBookingSchema, emailQuerySchema } from '@/lib/schemas';
import { toApiErrorResponse } from '@/lib/errors';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const json = await request.json().catch(() => ({}));
    const input = createBookingSchema.parse(json);
    const booking = await bookSlot(input);
    return NextResponse.json({ booking }, { status: 201 });
  } catch (err) {
    const { status, body } = toApiErrorResponse(err);
    return NextResponse.json(body, { status });
  }
}

export async function GET(request: NextRequest) {
  try {
    const params = Object.fromEntries(request.nextUrl.searchParams.entries());
    const { email } = emailQuerySchema.parse(params);
    if (!email) return NextResponse.json({ bookings: [] });
    const bookings = await getBookingsForEmail(email);
    return NextResponse.json({ bookings });
  } catch (err) {
    const { status, body } = toApiErrorResponse(err);
    return NextResponse.json(body, { status });
  }
}
