/**
 * Obolus Encryption Layer — ECIES on secp256k1.
 * Client-side encryption with CRE public key.
 * Only the Chainlink CRE (TEE) can decrypt these values.
 */

let cachedPubKey: string | null = null;

/**
 * Fetch the CRE public key from the Obolus server.
 * Cached after first fetch to avoid repeated round-trips.
 */
export async function getCrePublicKey(): Promise<string> {
  if (cachedPubKey) return cachedPubKey;

  const res = await fetch(`/api/v1/cre-public-key`);
  if (!res.ok) throw new Error(`Failed to fetch CRE public key: ${res.status}`);
  const { publicKey } = await res.json();
  cachedPubKey = publicKey;
  return publicKey;
}

/**
 * Encrypt arbitrary plaintext for the CRE using ECIES (secp256k1).
 * Returns hex-encoded ciphertext prefixed with 0x.
 */
export async function encryptForCRE(plaintext: string): Promise<string> {
  if (typeof window === 'undefined') return '';

  try {
    const { encrypt } = await import('eciesjs');
    const pubKeyHex = await getCrePublicKey();
    const cleanKey = pubKeyHex.startsWith('0x') ? pubKeyHex.slice(2) : pubKeyHex;

    const encrypted = encrypt(
      Uint8Array.from(Buffer.from(cleanKey, 'hex')),
      Uint8Array.from(Buffer.from(plaintext, 'utf-8'))
    );
    return '0x' + Buffer.from(encrypted).toString('hex');
  } catch (err) {
    console.error('[OBOLUS:ENCRYPT] Failed:', err);
    throw err;
  }
}

/**
 * Encrypt a position record (token → amount mapping) for the CRE.
 */
export async function encryptPosition(positions: Record<string, string>): Promise<string> {
  return encryptForCRE(JSON.stringify(positions));
}

/**
 * Encrypt a single numeric amount for the CRE.
 */
export async function encryptAmount(amount: string): Promise<string> {
  return encryptForCRE(amount);
}

/**
 * Derive a decryption key from a wallet signature.
 * The user signs a deterministic message, and the signature is used
 * as a seed to derive an AES key for local decryption of their own data.
 *
 * In production: the server would re-encrypt user data with a key
 * derivable from the user's signature, so only the user can read it.
 */
export async function deriveDecryptionKey(signature: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(signature.slice(0, 64)),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode('obolus-privacy-v2'),
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt']
  );
}

/**
 * Decrypt user-specific data using a signature-derived AES key.
 * The server stores data re-encrypted for the user; this decrypts it locally.
 */
export async function decryptUserData(
  ciphertext: string,
  signature: string
): Promise<string> {
  if (typeof window === 'undefined') return ciphertext;

  try {
    // For demo: if ciphertext isn't actually encrypted (legacy data), return as-is
    if (!ciphertext.startsWith('0x') || ciphertext.length < 100) {
      return ciphertext;
    }

    const key = await deriveDecryptionKey(signature);
    const data = Uint8Array.from(Buffer.from(ciphertext.slice(2), 'hex'));

    // AES-GCM: first 12 bytes are IV, rest is ciphertext
    const iv = data.slice(0, 12);
    const encrypted = data.slice(12);

    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      encrypted
    );

    return new TextDecoder().decode(decrypted);
  } catch (err) {
    console.error('[OBOLUS:DECRYPT] Failed:', err);
    return ciphertext;
  }
}
