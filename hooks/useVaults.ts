"use client"

import { useReadContract, useWriteContract, useAccount } from 'wagmi'
import { OBOLUS_CONTRACTS } from '@/lib/wagmi'
import { GM_TOKENS } from '@/lib/constants'
import { parseUnits, parseAbi, formatUnits } from 'viem'
import { useState } from 'react'
import { encryptAmount, encryptPosition } from '@/lib/encryption'
import { ethers } from 'ethers'

export const DEMO_MODE = true
const SERVER_URL = "http://localhost:3001"

// Generic ERC20 ABI for Approval
const ERC20_ABI = parseAbi([
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)"
])

/**
 * Submit encrypted initial positions to Obolus Server.
 */
export function useEncryptedSubmit() {
  const { address } = useAccount()

  const execute = async (positions: Record<string, string>) => {
    if (!address) throw new Error("WALLET_NOT_CONNECTED")
    
    // 1. Encrypt positions for CRE
    const encryptedPositions = await encryptPosition(positions)
    const encryptedNAV = await encryptAmount("0") // Initial NAV

    // 2. Prepare EIP-712 Signature (Simplified for demo, real uses signTypedData)
    const nonce = Math.random().toString(36).substring(7)
    const timestamp = Math.floor(Date.now() / 1000)
    
    // In a real app, we'd call signer.signTypedData 
    const signature = "0x0000000000000000000000000000000000000000000000000000000000000000"

    // 3. Post to Obolus Server
    const res = await fetch(`${SERVER_URL}/api/v1/position/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userAddress: address,
        encryptedPositions,
        encryptedNAV,
        publicKey: "0x0000000000000000000000000000000000000000000000000000000000000000",
        nonce,
        signature,
        timestamp
      })
    })

    return res.json()
  }

  return { execute }
}

/**
 * Reveal Position (TODO: CRE Decryption Flow)
 */
export function useRevealPosition() {
  const { address } = useAccount()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const reveal = async () => {
    if (!address) return
    setLoading(true)
    
    // Fetch encrypted blob from server
    const res = await fetch(`${SERVER_URL}/api/v1/position/${address}`)
    const json = await res.json()
    
    // TODO: Real decryption requires CRE callback flow or user private key access
    // For now, return mock decrypted data if in DEMO_MODE
    if (DEMO_MODE) {
       setData({
         TSLAon: "12.4",
         NVDAon: "8.2",
         SPYon: "5.1",
         QQQon: "3.7"
       })
    } else {
       setData(json)
    }
    setLoading(false)
  }

  return { data, reveal, loading }
}

/**
 * Execute a Deposit Flow: Approve -> Deposit -> Submit Intent
 */
export function useVaultDeposit() {
  const { address } = useAccount()
  const { writeContractAsync: approve } = useWriteContract()
  const { writeContractAsync: deposit } = useWriteContract()

  const execute = async (tokenAddress: `0x${string}`, amount: string) => {
    if (!address) throw new Error("WALLET_NOT_CONNECTED")
    const units = parseUnits(amount, 18)
    
    // 1. Approve
    await approve({
      address: tokenAddress,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [OBOLUS_CONTRACTS.RWAVault.address, units],
    })

    // 2. Deposit on-chain (public tx)
    const tx = await deposit({
      ...OBOLUS_CONTRACTS.RWAVault,
      functionName: 'deposit', // Updated from depositGM
      args: [tokenAddress, units],
    })

    // 3. Submit Encrypted Intent to Obolus Server for CRE matching
    const encryptedAmount = await encryptAmount(amount)
    const nonce = Math.random().toString(36).substring(7)
    const timestamp = Math.floor(Date.now() / 1000)

    await fetch(`${SERVER_URL}/api/v1/intent/deposit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userAddress: address,
        token: tokenAddress,
        encryptedAmount,
        expiresAt: new Date(Date.now() + 3600 * 1000).toISOString(),
        nonce,
        signature: "0x0000",
        timestamp
      })
    })

    return tx
  }

  return { execute }
}

/**
 * Execute a Withdraw Flow
 */
export function useVaultWithdraw() {
  const { address } = useAccount()
  const { writeContractAsync: withdraw } = useWriteContract()

  const execute = async (tokenAddress: `0x${string}`, shares: string) => {
    if (!address) throw new Error("WALLET_NOT_CONNECTED")
    const units = parseUnits(shares, 18)

    // 1. Withdraw on-chain
    const tx = await withdraw({
      ...OBOLUS_CONTRACTS.RWAVault,
      functionName: 'withdraw', // Updated from withdrawGM
      args: [tokenAddress, units],
    })

    // 2. Submit Encrypted Intent
    const encryptedAmount = await encryptAmount(shares)
    const nonce = Math.random().toString(36).substring(7)
    const timestamp = Math.floor(Date.now() / 1000)

    await fetch(`${SERVER_URL}/api/v1/intent/withdraw`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userAddress: address,
        token: tokenAddress,
        encryptedAmount,
        expiresAt: new Date(Date.now() + 3600 * 1000).toISOString(),
        nonce,
        signature: "0x0000",
        timestamp
      })
    })

    return tx
  }

  return { execute }
}

// Fallback hooks for UI compatibility
export const useVaultBalance = (addr?: any) => ({ data: BigInt(12450000000000000000000n), isLoading: false })
export const useGMTokenPrices = () => ({ data: {}, loading: false })
export const usePortfolioNAV = () => ({ data: parseUnits("24890", 18), isLoading: false })
export const usePerformanceData = () => ({ change24h: "+2.4%", volatility: "Low", alpha: "4.2%" })
export const useRecentTransactions = () => [
  { hash: "0x7a3e...b41d", type: "VAULT_DEPOSIT", asset: "NVDAon", amount: "2.4", time: "2M AGO", status: "CONFIRMED" },
  { hash: "0x8b2f...c92a", type: "VAULT_DEPOSIT", asset: "TSLAon", amount: "5.0", time: "1H AGO", status: "CONFIRMED" }
]
