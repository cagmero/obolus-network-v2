"use client"

import { useReadContract, useWriteContract, useAccount } from 'wagmi'
import { OBOLUS_CONTRACTS } from '@/lib/wagmi'
import { GM_TOKENS } from '@/lib/constants'
import { parseUnits, parseAbi, formatUnits } from 'viem'
import { useState } from 'react'

// Generic ERC20 ABI for Approval
const ERC20_ABI = parseAbi([
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)"
])

/**
 * Get user's vault share balance (Encrypted Handle)
 */
export function useVaultBalance(userAddress?: `0x${string}`) {
  return useReadContract({
    ...OBOLUS_CONTRACTS.RWAVault,
    functionName: 'balanceOf',
    args: userAddress ? [userAddress] : undefined,
    query: { enabled: !!userAddress }
  })
}

/**
 * Reveal Balance Hook (Decryption)
 */
export function useDecryptBalance(userAddress?: `0x${string}`) {
  const { data: decryptedRaw, refetch, isLoading, isError } = useReadContract({
    ...OBOLUS_CONTRACTS.RWAVault,
    functionName: 'decryptBalance',
    args: userAddress ? [userAddress] : undefined,
    query: { enabled: false } // Triggered manually
  })

  const reveal = () => refetch()

  // Formatted decrypted balance
  const balance = decryptedRaw ? formatUnits(decryptedRaw as bigint, 18) : "0"

  return { balance, reveal, isLoading, isError, hasData: !!decryptedRaw }
}

/**
 * Get user's individual GM token positions (Encrypted)
 */
export function usePortfolioPositions(userAddress?: `0x${string}`) {
  const results = Object.entries(GM_TOKENS).map(([key, token]) => {
    return useReadContract({
      ...OBOLUS_CONTRACTS.PositionManager,
      functionName: 'getPosition',
      args: userAddress ? [userAddress, token.address as `0x${string}`] : undefined,
      query: { enabled: !!userAddress }
    })
  })

  const loading = results.some(r => r.isLoading)
  const data = Object.keys(GM_TOKENS).reduce((acc, symbol, i) => {
    acc[symbol] = results[i].data as bigint || 0n
    return acc
  }, {} as Record<string, bigint>)

  return { data, loading }
}

/**
 * Execute a Deposit Flow: Approve -> Deposit
 */
export function useDeposit() {
  const { writeContractAsync: approve } = useWriteContract()
  const { writeContractAsync: deposit } = useWriteContract()

  const execute = async (tokenAddress: `0x${string}`, amount: string) => {
    const units = parseUnits(amount, 18)
    
    // 1. Approve
    await approve({
      address: tokenAddress,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [OBOLUS_CONTRACTS.RWAVault.address, units],
    })

    // 2. Deposit (Plaintext amount, internal encryption in contract)
    return deposit({
      ...OBOLUS_CONTRACTS.RWAVault,
      functionName: 'depositGM',
      args: [tokenAddress, units],
    })
  }

  return { execute }
}

/**
 * Execute a Withdraw Flow
 */
export function useWithdraw() {
  const { writeContractAsync: withdraw } = useWriteContract()

  const execute = async (tokenAddress: `0x${string}`, shares: string) => {
    return withdraw({
      ...OBOLUS_CONTRACTS.RWAVault,
      functionName: 'withdrawGM',
      args: [tokenAddress, parseUnits(shares, 18)],
    })
  }

  return { execute }
}

/**
 * Get latest GM token prices from ObolusOracle
 */
export function useGMTokenPrices() {
  const results = Object.entries(GM_TOKENS).map(([key, token]) => {
    return useReadContract({
      ...OBOLUS_CONTRACTS.ObolusOracle,
      functionName: 'getGMTokenPrice',
      args: [token.address as `0x${string}`],
    })
  })

  const data = Object.keys(GM_TOKENS).reduce((acc, symbol, i) => {
    acc[symbol] = results[i].data as bigint || 0n
    return acc
  }, {} as Record<string, bigint>)

  return { data, results }
}

/**
 * Get portfolio NAV across all tokens
 */
export function usePortfolioNAV() {
  return useReadContract({
    ...OBOLUS_CONTRACTS.RWAVault,
    functionName: 'totalAssets',
    query: { enabled: true }
  })
}
