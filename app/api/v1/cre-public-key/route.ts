/**
 * GET /api/v1/cre-public-key
 * Returns the CRE public key for client-side ECIES encryption.
 * If no key is configured, generates one for demo purposes.
 */
import { NextResponse } from 'next/server';
import { getOrCreateCREKeys } from '@/lib/server/cre-keys';

export async function GET() {
  const { publicKey } = getOrCreateCREKeys();
  return NextResponse.json({ publicKey });
}
