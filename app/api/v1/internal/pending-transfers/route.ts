/**
 * GET /api/v1/internal/pending-transfers
 * CRE-only endpoint: returns all pending transfers for execution.
 * Authenticated via x-api-key header.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getPendingTransfers } from '@/lib/server/state';

const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY || 'dev-key';

export async function GET(req: NextRequest) {
  const apiKey = req.headers.get('x-api-key');
  if (apiKey !== INTERNAL_API_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const transfers = getPendingTransfers();
  return NextResponse.json({ transfers });
}
