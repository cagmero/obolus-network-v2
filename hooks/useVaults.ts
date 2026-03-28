"use client"

import { useReadContract, useWriteContract, useAccount } from 'wagmi'
import { OBOLUS_CONTRACTS } from '@/lib/wagmi'
import { GM_TOKENS } from '@/lib/constants'
import { parseUnits, parseAbi, formatUnits } from 'viem'
import { useState } from 'react'
import { BSC_TESTNET_CHAIN_ID } from '@/lib/constants'

export const DEMO_MODE = true

// Generic ERC20 ABI for Approval
const ERC20_ABI = parseAbi([
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)"
])

/**
 * Get user's vault share balance (Encrypted Handle)
 */
export function useVaultBalance(userAddress?: `0x${string}`) {
  const result = useReadContract({
    ...OBOLUS_CONTRACTS.RWAVault,
    functionName: 'balanceOf',
    args: userAddress ? [userAddress] : undefined,
    query: { enabled: !!userAddress }
  })

  if (DEMO_MODE) {
    return { ...result, data: BigInt("12450000000000000000000") }
  }

  return result
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
  let balance = decryptedRaw ? formatUnits(decryptedRaw as bigint, 18) : "0"
  
  if (DEMO_MODE) {
    balance = "12,450.00"
  }

  return { balance, reveal, isLoading, isError, hasData: DEMO_MODE ? true : !!decryptedRaw }
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
  
  if (DEMO_MODE) {
    const mockData = {
      TSLAon: parseUnits("12.4", 18),
      NVDAon: parseUnits("8.2", 18),
      SPYon: parseUnits("5.1", 18),
      QQQon: parseUnits("3.7", 18)
    }
    return { data: mockData, loading: false }
  }

  const data = Object.keys(GM_TOKENS).reduce((acc, symbol, i) => {
    acc[symbol] = results[i].data as bigint || BigInt(0)
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

  const loading = results.some(r => r.isLoading)
  const data = Object.keys(GM_TOKENS).reduce((acc, symbol, i) => {
    acc[symbol] = results[i].data as bigint || BigInt(0)
    return acc
  }, {} as Record<string, bigint>)

  return { data, loading, results }
}

/**
 * Get portfolio NAV across all tokens
 */
export function usePortfolioNAV() {
  const result = useReadContract({
    ...OBOLUS_CONTRACTS.RWAVault,
    functionName: 'totalAssets',
    query: { enabled: true }
  })

  if (DEMO_MODE) {
    return { ...result, data: parseUnits("24890", 18) }
  }

  return result
}

/**
 * Performance Data Hook
 */
export function usePerformanceData() {
  if (DEMO_MODE) {
    return { change24h: "+2.4%", volatility: "Low", alpha: "4.2%" }
  }
  return { change24h: "0%", volatility: "N/A", alpha: "N/A" }
}

/**
 * Recent Transactions Hook
 */
export function useRecentTransactions() {
  if (DEMO_MODE) {
    return [
      { hash: "0x7a3e...b41d", type: "VAULT_DEPOSIT", asset: "NVDAon", amount: "2.4", time: "2M AGO", status: "CONFIRMED" },
      { hash: "0x8b2f...c92a", type: "VAULT_DEPOSIT", asset: "TSLAon", amount: "5.0", time: "1H AGO", status: "CONFIRMED" },
      { hash: "0x1c4d...e2f3", type: "VAULT_DEPOSIT", asset: "SPYon", amount: "1.2", time: "4H AGO", status: "CONFIRMED" }
    ]
  }
  return []
}
