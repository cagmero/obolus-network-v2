/**
 * GET /api/v1/vault/transfer-status/:id
 * Returns the status of a pending transfer (used for polling).
 */
import { NextRequest, NextResponse } from 'next/server';
import { getTransfer } from '@/lib/server/state';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const transfer = getTransfer(id);

  if (!transfer) {
    return NextResponse.json({ error: 'Transfer not found' }, { status: 404 });
  }

  return NextResponse.json({
    transferId: transfer.transferId,
    status: transfer.status,
    txHash: transfer.txHash,
    reason: transfer.reason,
  });
}
