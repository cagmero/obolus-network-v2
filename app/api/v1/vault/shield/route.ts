/**
 * POST /api/v1/vault/shield
 * Initiates the shielding process: records encrypted position,
 * queues a transfer from user → pool wallet.
 *
 * Body: { account, token, amount, encryptedAmount, depositTxHash, vaultId, timestamp, auth }
 */
import { NextRequest, NextResponse } from 'next/server';
import { verifyEIP712Signature } from '@/lib/server/auth';
import { createDepositSlot, createShieldedPosition, queueTransfer } from '@/lib/server/state';

const POOL_WALLET = process.env.POOL_WALLET_ADDRESS || '0x0000000000000000000000000000000000000000';
const SLOT_TTL_MS = 10 * 60 * 1000; // 10 minutes

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { account, token, amount, encryptedAmount, depositTxHash, vaultId, timestamp, auth } = body;

    if (!account || !token || !amount || !encryptedAmount || !auth) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify EIP-712 signature
    const valid = await verifyEIP712Signature({
      primaryType: 'Shielded Deposit',
      message: { account, token, amount: BigInt(amount), timestamp: BigInt(timestamp) },
      signature: auth,
      expectedSigner: account,
    });

    if (!valid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // Create deposit slot with TTL
    const slot = createDepositSlot({
      userAddress: account.toLowerCase(),
      token: token.toLowerCase(),
      amount,
      depositTxHash,
      expiresAt: Date.now() + SLOT_TTL_MS,
    });

    // Create shielded position (encrypted — server cannot read amount)
    const position = createShieldedPosition({
      userAddress: account.toLowerCase(),
      token: token.toLowerCase(),
      encryptedAmount,
      shares: amount, // 1:1 for now, oracle-adjusted in production
      vaultId,
    });

    // Queue transfer: user → pool wallet (CRE will execute)
    const transfer = queueTransfer({
      sender: account.toLowerCase(),
      recipient: POOL_WALLET.toLowerCase(),
      token: token.toLowerCase(),
      amount,
      reason: 'shield',
    });

    return NextResponse.json({
      slotId: slot.slotId,
      positionId: position.positionId,
      transferId: transfer.transferId,
      status: 'shielded',
    });
  } catch (e: any) {
    console.error('[API:SHIELD]', e.message);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
