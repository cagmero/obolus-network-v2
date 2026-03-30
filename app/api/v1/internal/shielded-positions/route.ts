/**
 * GET /api/v1/internal/shielded-positions
 * CRE-only endpoint: returns all active shielded positions (encrypted).
 * The CRE decrypts these inside the TEE for NAV settlement.
 */
import { NextRequest, NextResponse } from 'next/server';

const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY || 'dev-key';

// Import from server state
import { getShieldedPositions } from '@/lib/server/state';

export async function GET(req: NextRequest) {
  const apiKey = req.headers.get('x-api-key');
  if (apiKey !== INTERNAL_API_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Return ALL active positions (CRE needs the full set for settlement)
  // We can't filter by user here — CRE processes everything
  const allPositions = getShieldedPositions('*'); // special wildcard

  return NextResponse.json({ positions: allPositions });
}
