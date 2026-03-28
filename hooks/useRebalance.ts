"use client"

import { useMemo, useState } from "react"
import { useAccount, useSignTypedData } from "wagmi"
import { encryptPosition } from "@/lib/encryption"
import { OBOLUS_CONTRACTS } from "@/lib/wagmi"

export interface Trade {
  symbol: string
  side: "BUY" | "SELL"
  percentage: number
}

const SERVER_URL = "http://localhost:3001"

/**
 * Computes trades needed to reach target allocation.
 */
export function useRebalancePreview(
  currentAlloc: Record<string, number>,
  targetAlloc: Record<string, number>
) {
  return useMemo(() => {
    const trades: Trade[] = []
    
    // Calculate differences
    for (const symbol in targetAlloc) {
      const diff = targetAlloc[symbol] - (currentAlloc[symbol] || 0)
      if (Math.abs(diff) > 0.01) { // 0.01% threshold
        trades.push({
          symbol,
          side: diff > 0 ? "BUY" : "SELL",
          percentage: Math.abs(diff)
        })
      }
    }
    
    return trades
  }, [currentAlloc, targetAlloc])
}

/**
 * Submits the encrypted rebalance intent to the server.
 */
export function useSubmitRebalance() {
  const { address, chainId } = useAccount()
  const { signTypedDataAsync: signTypedData } = useSignTypedData()
  const [loading, setLoading] = useState(false)

  const execute = async (trades: Trade[]) => {
    if (!address || !chainId) throw new Error("WALLET_NOT_CONNECTED")
    setLoading(true)

    try {
      // 1. Encrypt rebalance intent
      // We encrypt the entire trades array as a JSON string
      const encryptedIntent = await encryptPosition(trades as any)
      const timestamp = Math.floor(Date.now() / 1000)

      // 2. Sign EIP-712 Intent
      const domain = {
        name: "ObolusNetwork",
        version: "0.0.1",
        chainId,
        verifyingContract: OBOLUS_CONTRACTS.RWAVault.address,
      }

      const types = {
        "Submit Rebalance": [
          { name: "account", type: "address" },
          { name: "encryptedIntent", type: "string" },
          { name: "timestamp", type: "uint256" },
        ],
      }

      const message = {
        account: address,
        encryptedIntent,
        timestamp: BigInt(timestamp),
      }

      const auth = await signTypedData({
        domain,
        types,
        primaryType: "Submit Rebalance",
        message
      })

      // 3. Post to server
      const res = await fetch(`${SERVER_URL}/api/v1/intent/rebalance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          account: address,
          encryptedIntent,
          timestamp,
          auth
        })
      })

      if (!res.ok) throw new Error("SERVER_ERROR // REBALANCE_FAILED")
      
      setLoading(false)
      return { success: true }
    } catch (err) {
      console.error(err)
      setLoading(false)
      throw err
    }
  }

  return { execute, loading }
}
