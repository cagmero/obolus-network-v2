/**
 * POST /api/v1/vault/unshield
 * Initiates withdrawal: queues a pool → user transfer for CRE execution.
 *
 * Body: { account, token, shares, vaultId, timestamp, auth }
 */
import { NextRequest, NextResponse } from 'next/server';
import { verifyEIP712Signature } from '@/lib/server/auth';
import { queueTransfer, closeShieldedPosition } from '@/lib/server/state';

const POOL_WALLET = process.env.POOL_WALLET_ADDRESS || '0x0000000000000000000000000000000000000000';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { account, token, shares, vaultId, timestamp, auth } = body;

    if (!account || !token || !shares || !auth) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify EIP-712 signature
    const valid = await verifyEIP712Signature({
      primaryType: 'Shielded Withdraw',
      message: { account, token, shares: BigInt(shares), timestamp: BigInt(timestamp) },
      signature: auth,
      expectedSigner: account,
    });

    if (!valid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // Close the shielded position
    closeShieldedPosition(account.toLowerCase(), token.toLowerCase());

    // Queue transfer: pool → user (CRE will execute via on-chain vault)
    const transfer = queueTransfer({
      sender: POOL_WALLET.toLowerCase(),
      recipient: account.toLowerCase(),
      token: token.toLowerCase(),
      amount: shares,
      reason: 'unshield',
    });

    return NextResponse.json({
      transferId: transfer.transferId,
      status: 'pending',
      estimatedCompletion: Date.now() + 30_000, // ~30s for CRE cycle
    });
  } catch (e: any) {
    console.error('[API:UNSHIELD]', e.message);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
