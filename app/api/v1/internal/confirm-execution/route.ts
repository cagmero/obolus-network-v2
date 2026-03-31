/**
 * POST /api/v1/internal/confirm-execution
 * Bridge endpoint to confirm Settler execution.
 */
import { NextRequest, NextResponse } from 'next/server';
import { confirmTransfer } from '@/lib/server/state';

const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY || 'obolus-dev-key';

export async function POST(req: NextRequest) {
  const apiKey = req.headers.get('x-api-key');
  if (apiKey !== INTERNAL_API_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { intentId, txHash, status } = await req.json();
  
  if (!intentId || !txHash) {
    return NextResponse.json({ error: 'Missing Id or Hash' }, { status: 400 });
  }

  // Update internal transfer state
  const updated = confirmTransfer(intentId, txHash, status);
  
  if (updated) {
    console.log(`[STATE] Settlement transfer ${intentId} confirmed in block ${txHash}`);
    return NextResponse.json({ success: true });
  } else {
    return NextResponse.json({ error: 'Transfer not found' }, { status: 404 });
  }
}
