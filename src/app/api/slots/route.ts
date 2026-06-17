import { NextResponse, type NextRequest } from 'next/server';
import { listSlots } from '@/lib/slots';
import { listSlotsQuerySchema } from '@/lib/schemas';
import { toApiErrorResponse } from '@/lib/errors';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const params = Object.fromEntries(request.nextUrl.searchParams.entries());
    const query = listSlotsQuerySchema.parse(params);
    const slots = await listSlots(query);
    return NextResponse.json({ slots });
  } catch (err) {
    const { status, body } = toApiErrorResponse(err);
    return NextResponse.json(body, { status });
  }
}
