/**
 * Obolus Shielded Vault Hook — Ghost-style privacy flow.
 *
 * Deposit flow:
 *   1. Approve token spend → on-chain
 *   2. Deposit into RWAVault → on-chain (visible, but temporary)
 *   3. Sign EIP-712 "Shielded Deposit" → proves intent
 *   4. Server creates deposit slot with TTL
 *   5. Encrypt amount with CRE public key
 *   6. Private transfer to pool wallet → funds become untraceable
 *   7. Server records shielded position (encrypted)
 *
 * Withdraw flow:
 *   1. Sign EIP-712 "Shielded Withdraw" → proves intent
 *   2. Server queues a pending transfer (pool → user)
 *   3. CRE picks up transfer, signs it, executes via vault
 *   4. User receives tokens back on-chain
 */

import { useState, useCallback } from 'react';
import { useAccount, useWriteContract, usePublicClient, useSignTypedData } from 'wagmi';
import { parseEther } from 'viem';
import { useQueryClient } from '@tanstack/react-query';
import { CONTRACT_ADDRESSES } from '@/lib/wagmi';
import { RWAVaultABI, MockERC20ABI } from '@/lib/abis';
import { ShieldedVaultABI } from '@/lib/shielded-vault-abi';
import { OBOLUS_DOMAIN, EIP712_TYPES } from '@/lib/eip712';

// Use ShieldedVault if deployed, otherwise fall back to RWAVault
const SHIELDED_VAULT_ADDRESS = process.env.NEXT_PUBLIC_SHIELDED_VAULT || '';
const VAULT_ADDRESS = SHIELDED_VAULT_ADDRESS || CONTRACT_ADDRESSES.RWAVault;
const VAULT_ABI = SHIELDED_VAULT_ADDRESS ? ShieldedVaultABI : RWAVaultABI;
import { encryptAmount } from '@/lib/encryption';
import { api } from '@/lib/api';

export type ShieldStep =
  | 'idle'
  | 'approving'
  | 'depositing'
  | 'signing'
  | 'encrypting'
  | 'shielding'
  | 'complete'
  | 'error';

export type WithdrawStep =
  | 'idle'
  | 'signing'
  | 'queued'
  | 'executing'
  | 'complete'
  | 'error';

export function useShieldedDeposit() {
  const { address } = useAccount();
  const queryClient = useQueryClient();
  const { writeContractAsync } = useWriteContract();
  const { signTypedDataAsync } = useSignTypedData();
  const publicClient = usePublicClient();

  const [step, setStep] = useState<ShieldStep>('idle');
  const [txHash, setTxHash] = useState('');
  const [error, setError] = useState('');

  const deposit = useCallback(async ({
    tokenSymbol,
    tokenAddress,
    amount,
  }: {
    tokenSymbol: string;
    tokenAddress: string;
    amount: string;
  }) => {
    if (!address) throw new Error('Wallet not connected');
    setError('');
    const parsedAmount = parseEther(amount);
    const timestamp = Math.floor(Date.now() / 1000);

    try {
      // Step 1: Approve
      setStep('approving');
      const approveTx = await writeContractAsync({
        address: tokenAddress as `0x${string}`,
        abi: MockERC20ABI,
        functionName: 'approve',
        args: [VAULT_ADDRESS as `0x${string}`, parsedAmount],
      });
      await publicClient?.waitForTransactionReceipt({ hash: approveTx });

      // Step 2: On-chain deposit (into ShieldedVault — no per-user tracking)
      setStep('depositing');
      const depositTx = await writeContractAsync({
        address: VAULT_ADDRESS as `0x${string}`,
        abi: VAULT_ABI,
        functionName: 'deposit',
        args: SHIELDED_VAULT_ADDRESS
          ? [tokenAddress as `0x${string}`, parsedAmount]  // ShieldedVault: deposit(token, amount)
          : [tokenAddress as `0x${string}`, parsedAmount, address],  // RWAVault: deposit(token, amount, receiver)
      });
      setTxHash(depositTx);
      await publicClient?.waitForTransactionReceipt({ hash: depositTx });

      // Step 3: Sign EIP-712 to authorize shielding
      setStep('signing');
      const signature = await signTypedDataAsync({
        domain: OBOLUS_DOMAIN,
        types: { 'Shielded Deposit': EIP712_TYPES['Shielded Deposit'] },
        primaryType: 'Shielded Deposit',
        message: {
          account: address,
          token: tokenAddress as `0x${string}`,
          amount: parsedAmount,
          timestamp: BigInt(timestamp),
        },
      });

      // Step 4: Encrypt amount for CRE
      setStep('encrypting');
      const encryptedAmt = await encryptAmount(amount);

      // Step 5: Shield — transfer to pool wallet via server
      setStep('shielding');
      await api.post('/vault/shield', {
        account: address,
        token: tokenAddress,
        amount: parsedAmount.toString(),
        encryptedAmount: encryptedAmt,
        depositTxHash: depositTx,
        vaultId: tokenSymbol.toLowerCase(),
        timestamp,
        auth: signature,
      });

      setStep('complete');
      queryClient.invalidateQueries({ queryKey: ['readContracts'] });
      queryClient.invalidateQueries({ queryKey: ['shieldedPositions'] });

      return { depositTxHash: depositTx };
    } catch (e: any) {
      console.error('[OBOLUS:SHIELD_DEPOSIT:ERROR]', e.message);
      setError(e.message || 'Shielded deposit failed');
      setStep('error');
      throw e;
    }
  }, [address, writeContractAsync, signTypedDataAsync, publicClient, queryClient]);

  const reset = useCallback(() => {
    setStep('idle');
    setTxHash('');
    setError('');
  }, []);

  return { deposit, step, txHash, error, reset };
}

export function useShieldedWithdraw() {
  const { address } = useAccount();
  const queryClient = useQueryClient();
  const { signTypedDataAsync } = useSignTypedData();

  const [step, setStep] = useState<WithdrawStep>('idle');
  const [transferId, setTransferId] = useState('');
  const [error, setError] = useState('');

  const withdraw = useCallback(async ({
    tokenSymbol,
    tokenAddress,
    shares,
  }: {
    tokenSymbol: string;
    tokenAddress: string;
    shares: string;
  }) => {
    if (!address) throw new Error('Wallet not connected');
    setError('');
    const timestamp = Math.floor(Date.now() / 1000);
    const parsedShares = parseEther(shares);

    try {
      // Step 1: Sign EIP-712 withdraw authorization
      setStep('signing');
      const signature = await signTypedDataAsync({
        domain: OBOLUS_DOMAIN,
        types: { 'Shielded Withdraw': EIP712_TYPES['Shielded Withdraw'] },
        primaryType: 'Shielded Withdraw',
        message: {
          account: address,
          token: tokenAddress as `0x${string}`,
          shares: parsedShares,
          timestamp: BigInt(timestamp),
        },
      });

      // Step 2: Queue withdrawal — CRE will execute the pool → user transfer
      setStep('queued');
      const result = await api.post<{ transferId: string }>('/vault/unshield', {
        account: address,
        token: tokenAddress,
        shares: parsedShares.toString(),
        vaultId: tokenSymbol.toLowerCase(),
        timestamp,
        auth: signature,
      });
      setTransferId(result.transferId);

      // Step 3: Poll for completion (CRE executes async)
      setStep('executing');
      let attempts = 0;
      const maxAttempts = 30; // 30s max wait
      while (attempts < maxAttempts) {
        await new Promise(r => setTimeout(r, 1000));
        const status = await api.get<{ status: string; txHash?: string }>(
          `/vault/transfer-status/${result.transferId}`
        );
        if (status.status === 'completed') {
          setStep('complete');
          queryClient.invalidateQueries({ queryKey: ['readContracts'] });
          queryClient.invalidateQueries({ queryKey: ['shieldedPositions'] });
          return { transferId: result.transferId, txHash: status.txHash };
        }
        if (status.status === 'failed') {
          throw new Error('CRE transfer execution failed');
        }
        attempts++;
      }

      // If we get here, CRE hasn't executed yet but it's queued
      setStep('complete');
      return { transferId: result.transferId };
    } catch (e: any) {
      console.error('[OBOLUS:SHIELD_WITHDRAW:ERROR]', e.message);
      setError(e.message || 'Shielded withdrawal failed');
      setStep('error');
      throw e;
    }
  }, [address, signTypedDataAsync, queryClient]);

  const reset = useCallback(() => {
    setStep('idle');
    setTransferId('');
    setError('');
  }, []);

  return { withdraw, step, transferId, error, reset };
}
