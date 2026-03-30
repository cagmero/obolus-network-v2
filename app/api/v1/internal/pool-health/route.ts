/**
 * GET /api/v1/internal/pool-health
 * CRE-only endpoint: returns pool health metrics for monitoring.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getShieldedPositions, getPendingTransfers } from '@/lib/server/state';

const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY || 'dev-key';

export async function GET(req: NextRequest) {
  const apiKey = req.headers.get('x-api-key');
  if (apiKey !== INTERNAL_API_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const positions = getShieldedPositions('*');
  const transfers = getPendingTransfers();

  // Aggregate shielded totals per token (amounts are encrypted, so we count)
  const tokenCounts: Record<string, number> = {};
  for (const pos of positions) {
    tokenCounts[pos.token] = (tokenCounts[pos.token] || 0) + 1;
  }

  return NextResponse.json({
    activePositions: positions.length,
    pendingTransfers: transfers.length,
    tokenCounts,
    timestamp: Date.now(),
  });
}
