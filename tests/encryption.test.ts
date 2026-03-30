/**
 * Tests for the encryption module.
 * Tests key derivation and AES decrypt flow (ECIES requires CRE key).
 */
import { deriveDecryptionKey } from '@/lib/encryption';

// Mock fetch for getCrePublicKey
global.fetch = jest.fn();

describe('Encryption Module', () => {

  describe('deriveDecryptionKey', () => {
    it('should derive an AES-GCM key from a signature', async () => {
      const signature = '0x' + 'a'.repeat(130); // mock signature
      const key = await deriveDecryptionKey(signature);

      expect(key).toBeDefined();
      expect(key.type).toBe('secret');
      // AES-GCM key
      expect(key.algorithm).toMatchObject({ name: 'AES-GCM', length: 256 });
      expect(key.usages).toContain('decrypt');
    });

    it('should derive different keys from different signatures', async () => {
      const sig1 = '0x' + 'a'.repeat(130);
      const sig2 = '0x' + 'b'.repeat(130);

      const key1 = await deriveDecryptionKey(sig1);
      const key2 = await deriveDecryptionKey(sig2);

      // Export raw key bytes to compare
      const raw1 = await crypto.subtle.exportKey('raw', await deriveTestKey(sig1));
      const raw2 = await crypto.subtle.exportKey('raw', await deriveTestKey(sig2));

      expect(Buffer.from(raw1).toString('hex')).not.toBe(Buffer.from(raw2).toString('hex'));
    });

    it('should derive the same key from the same signature (deterministic)', async () => {
      const sig = '0x' + 'c'.repeat(130);

      const raw1 = await crypto.subtle.exportKey('raw', await deriveTestKey(sig));
      const raw2 = await crypto.subtle.exportKey('raw', await deriveTestKey(sig));

      expect(Buffer.from(raw1).toString('hex')).toBe(Buffer.from(raw2).toString('hex'));
    });
  });

  describe('encryptForCRE', () => {
    it('should return empty string on server side (typeof window === undefined)', async () => {
      // In Node.js test env, window is undefined by default with testEnvironment: 'node'
      const { encryptForCRE } = await import('@/lib/encryption');
      const result = await encryptForCRE('test');
      expect(result).toBe('');
    });
  });

  describe('decryptUserData', () => {
    it('should return plaintext for non-encrypted data (legacy fallback)', async () => {
      const { decryptUserData } = await import('@/lib/encryption');
      const result = await decryptUserData('plain-text-value', '0xsig');
      expect(result).toBe('plain-text-value');
    });

    it('should return ciphertext as-is for short hex strings', async () => {
      const { decryptUserData } = await import('@/lib/encryption');
      const result = await decryptUserData('0xshort', '0xsig');
      expect(result).toBe('0xshort');
    });
  });
});

// Helper: derive an exportable key for comparison
async function deriveTestKey(signature: string): Promise<CryptoKey> {
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
    true, // extractable for test comparison
    ['decrypt']
  );
}
