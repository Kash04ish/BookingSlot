import { NextResponse } from 'next/server';
import { getNextAvailable } from '@/lib/slots';
import { toApiErrorResponse } from '@/lib/errors';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const slot = await getNextAvailable();
    return NextResponse.json({ slot });
  } catch (err) {
    const { status, body } = toApiErrorResponse(err);
    return NextResponse.json(body, { status });
  }
}
