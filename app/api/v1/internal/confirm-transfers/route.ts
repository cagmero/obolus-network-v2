/**
 * POST /api/v1/internal/confirm-transfers
 * CRE-only endpoint: marks transfers as completed after on-chain execution.
 *
 * Body: { transfers: [{ transferId, txHash, status }] }
 */
import { NextRequest, NextResponse } from 'next/server';
import { confirmTransfer } from '@/lib/server/state';

const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY || 'dev-key';

export async function POST(req: NextRequest) {
  const apiKey = req.headers.get('x-api-key');
  if (apiKey !== INTERNAL_API_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { transfers } = await req.json();
  if (!Array.isArray(transfers)) {
    return NextResponse.json({ error: 'transfers must be an array' }, { status: 400 });
  }

  let confirmed = 0;
  for (const t of transfers) {
    const ok = confirmTransfer(t.transferId, t.txHash, t.status || 'completed');
    if (ok) confirmed++;
  }

  return NextResponse.json({ confirmed, total: transfers.length });
}
