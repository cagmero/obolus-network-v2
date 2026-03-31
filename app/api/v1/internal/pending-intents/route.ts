/**
 * GET /api/v1/internal/pending-intents
 * Bridge endpoint to support Link-style Settler logic.
 * Aligned with 'pending-transfers' but uses the format expected by execute-withdrawals/main.ts.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getPendingTransfers } from '@/lib/server/state';

const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY || 'obolus-dev-key';

export async function GET(req: NextRequest) {
  const apiKey = req.headers.get('x-api-key');
  if (apiKey !== INTERNAL_API_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const transfers = getPendingTransfers();
  
  // Transform for Settler
  const intents = transfers.map(t => ({
    id: t.transferId,
    userAddress: t.recipient, // Receives tokens on withdrawal
    tokenAddress: t.token,
    encryptedAmount: t.amount, // For unshield, this is the plain amount string
    status: t.status,
    type: t.reason === 'unshield' ? 'withdraw' : 'deposit', // Align with main.ts filter
    vaultId: 'shared-pool'
  }));

  return NextResponse.json({ intents });
}
