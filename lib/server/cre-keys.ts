/**
 * CRE Key Management — generates and caches ECIES keypair.
 * In production, the private key lives ONLY in the CRE TEE.
 * For demo, we generate and store it server-side.
 */
import { PrivateKey } from 'eciesjs';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const KEY_FILE = join(process.cwd(), '.cre-keys.json');

interface CREKeys {
  publicKey: string;
  privateKey: string;
}

let cachedKeys: CREKeys | null = null;

export function getOrCreateCREKeys(): CREKeys {
  // Return cached
  if (cachedKeys) return cachedKeys;

  // Check env vars first
  if (process.env.CRE_PUBLIC_KEY && process.env.CRE_PRIVATE_KEY) {
    cachedKeys = {
      publicKey: process.env.CRE_PUBLIC_KEY,
      privateKey: process.env.CRE_PRIVATE_KEY,
    };
    return cachedKeys;
  }

  // Check file
  if (existsSync(KEY_FILE)) {
    try {
      const data = JSON.parse(readFileSync(KEY_FILE, 'utf-8'));
      cachedKeys = data;
      console.log('[CRE:KEYS] Loaded existing keypair from .cre-keys.json');
      return cachedKeys!;
    } catch {
      // Fall through to generate
    }
  }

  // Generate new keypair
  console.log('[CRE:KEYS] Generating new ECIES keypair for demo...');
  const sk = new PrivateKey();
  cachedKeys = {
    publicKey: sk.publicKey.toHex(),
    privateKey: Buffer.from(sk.secret).toString('hex'),
  };

  // Persist to file
  try {
    writeFileSync(KEY_FILE, JSON.stringify(cachedKeys, null, 2));
    console.log('[CRE:KEYS] Saved keypair to .cre-keys.json');
  } catch (err) {
    console.warn('[CRE:KEYS] Could not persist keys:', err);
  }

  return cachedKeys;
}

export function getCREPrivateKey(): string {
  return getOrCreateCREKeys().privateKey;
}
