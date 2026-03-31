/**
 * POST /api/v1/vault/reveal
 * Returns the user's shielded positions.
 * Server decrypts with CRE private key (demo mode) after verifying EIP-712 auth.
 *
 * Body: { account, timestamp, auth }
 */
import { NextRequest, NextResponse } from 'next/server';
import { verifyEIP712Signature } from '@/lib/server/auth';
import { getShieldedPositions } from '@/lib/server/state';
import { TOKEN_ADDRESSES } from '@/lib/tokenAddresses';
import { getCREPrivateKey } from '@/lib/server/cre-keys';

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

    // Decrypt amounts server-side with CRE private key (demo mode)
    const { decrypt } = await import('eciesjs');
    const privKeyHex = getCREPrivateKey();

    const decryptedPositions = positions.map(p => {
      let amount = p.encryptedAmount;
      try {
        if (amount && amount.startsWith('0x') && amount.length > 10) {
          const cipherBytes = Uint8Array.from(Buffer.from(amount.slice(2), 'hex'));
          const plainBytes = decrypt(
            Uint8Array.from(Buffer.from(privKeyHex, 'hex')),
            cipherBytes
          );
          amount = new TextDecoder().decode(plainBytes);
        }
      } catch (e) {
        console.warn('[API:REVEAL] Could not decrypt amount, returning raw:', (e as Error).message);
      }
      return {
        token: p.token,
        tokenSymbol: ADDRESS_TO_SYMBOL[p.token?.toLowerCase()] || 'UNKNOWN',
        encryptedAmount: amount,
        shares: p.shares,
      };
    });

    return NextResponse.json({ positions: decryptedPositions });
  } catch (e: any) {
    console.error('[API:REVEAL]', e.message);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
