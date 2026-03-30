/**
 * GET /api/v1/cre-public-key
 * Returns the CRE public key for client-side ECIES encryption.
 */
import { NextResponse } from 'next/server';

const CRE_PUBLIC_KEY = process.env.CRE_PUBLIC_KEY || '04placeholder_cre_public_key_hex';

export async function GET() {
  return NextResponse.json({ publicKey: CRE_PUBLIC_KEY });
}
