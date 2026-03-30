/**
 * POST /api/v1/vault/reveal
 * Returns the user's shielded positions (encrypted).
 * The client decrypts locally using the signature-derived key.
 *
 * Body: { account, timestamp, auth }
 */
import { NextRequest, NextResponse } from 'next/server';
import { verifyEIP712Signature } from '@/lib/server/auth';
import { getShieldedPositions } from '@/lib/server/state';
import { TOKEN_ADDRESSES } from '@/lib/tokenAddresses';

// Reverse lookup: address → symbol
const ADDRESS_TO_SYMBOL: Record<string, string> = {};
for (const [symbol, addr] of Object.entries(TOKEN_ADDRESSES)) {
  ADDRESS_TO_SYMBOL[addr.toLowerCase()] = symbol;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { account, timestamp, auth } = body;

    if (!account || !auth) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify EIP-712 signature
    const valid = await verifyEIP712Signature({
      primaryType: 'Privacy Reveal',
      message: { account, timestamp: BigInt(timestamp) },
      signature: auth,
      expectedSigner: account,
    });

    if (!valid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // Fetch shielded positions for this user
    const positions = getShieldedPositions(account.toLowerCase());

    return NextResponse.json({
      positions: positions.map(p => ({
        token: p.token,
        tokenSymbol: ADDRESS_TO_SYMBOL[p.token] || 'UNKNOWN',
        encryptedAmount: p.encryptedAmount,
        shares: p.shares,
      })),
    });
  } catch (e: any) {
    console.error('[API:REVEAL]', e.message);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
