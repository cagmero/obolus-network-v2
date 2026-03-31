/**
 * POST /api/v1/vault/unshield
 * Initiates withdrawal: queues a pool → user transfer for CRE execution.
 *
 * Body: { account, token, shares, vaultId, timestamp, auth }
 */
import { NextRequest, NextResponse } from 'next/server';
import { verifyEIP712Signature } from '@/lib/server/auth';
import { queueTransfer, closeShieldedPosition, confirmTransfer } from '@/lib/server/state';

const POOL_WALLET = process.env.POOL_WALLET_ADDRESS || '0x0121Cb33BdAeEb8f400b27c0D5f3C7916C77F453';

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

    // DEMO OVERRIDE: Automatically confirm the transfer since the 
    // off-chain CRE worker might not be running in all environments.
    // In production, the CRE worker calls /confirm-execution to mark this.
    const MOCK_TX_HASH = '0x' + Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('');
    setTimeout(() => {
      confirmTransfer(transfer.transferId, MOCK_TX_HASH, 'completed');
    }, 2000);

    return NextResponse.json({
      transferId: transfer.transferId,
      status: 'pending',
      estimatedCompletion: Date.now() + 2_000, // 2s simulated CRE cycle
    });
  } catch (e: any) {
    console.error('[API:UNSHIELD]', e.message);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
