/**
 * Privacy Reveal Hook — lets users decrypt their own shielded positions.
 *
 * Flow:
 *   1. User signs EIP-712 "Privacy Reveal" message
 *   2. Signature is sent to server as proof of ownership
 *   3. Server returns positions re-encrypted for the user's derived key
 *   4. Client decrypts locally using signature-derived AES key
 */

import { useState, useCallback } from 'react';
import { useAccount, useSignTypedData } from 'wagmi';
import { OBOLUS_DOMAIN, EIP712_TYPES } from '@/lib/eip712';
import { decryptUserData } from '@/lib/encryption';
import { api } from '@/lib/api';

export interface RevealedPosition {
  token: string;
  tokenSymbol: string;
  amount: string;
  shares: string;
  usdValue?: string;
}

export function usePrivacyReveal() {
  const { address } = useAccount();
  const { signTypedDataAsync } = useSignTypedData();

  const [revealed, setRevealed] = useState(false);
  const [positions, setPositions] = useState<RevealedPosition[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const reveal = useCallback(async () => {
    if (!address) throw new Error('Wallet not connected');
    setLoading(true);
    setError('');

    try {
      const timestamp = Math.floor(Date.now() / 1000);

      // Sign privacy reveal request
      const signature = await signTypedDataAsync({
        domain: OBOLUS_DOMAIN,
        types: { 'Privacy Reveal': EIP712_TYPES['Privacy Reveal'] },
        primaryType: 'Privacy Reveal',
        message: {
          account: address,
          timestamp: BigInt(timestamp),
        },
      });

      // Fetch encrypted positions from server
      const result = await api.post<{
        positions: Array<{
          token: string;
          tokenSymbol: string;
          encryptedAmount: string;
          shares: string;
        }>;
      }>('/vault/reveal', {
        account: address,
        timestamp,
        auth: signature,
      });

      // Decrypt each position locally
      const decrypted: RevealedPosition[] = [];
      for (const pos of result.positions) {
        const amount = await decryptUserData(pos.encryptedAmount, signature);
        decrypted.push({
          token: pos.token,
          tokenSymbol: pos.tokenSymbol,
          amount,
          shares: pos.shares,
        });
      }

      setPositions(decrypted);
      setRevealed(true);
    } catch (e: any) {
      console.error('[OBOLUS:REVEAL:ERROR]', e.message);
      setError(e.message || 'Privacy reveal failed');
    } finally {
      setLoading(false);
    }
  }, [address, signTypedDataAsync]);

  const hide = useCallback(() => {
    setRevealed(false);
    setPositions([]);
  }, []);

  return { reveal, hide, revealed, positions, loading, error };
}
