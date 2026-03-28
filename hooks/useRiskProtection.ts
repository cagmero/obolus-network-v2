"use client"

import { useState } from "react"
import { useAccount, useSignTypedData } from "wagmi"
import { encryptAmount, encryptPosition } from "@/lib/encryption"
import { OBOLUS_CONTRACTS } from "@/lib/wagmi"

const SERVER_URL = "http://localhost:3001"

/**
 * Hook to set encrypted stop-loss thresholds for tokens.
 */
export function useSetStopLoss() {
  const { address, chainId } = useAccount()
  const { signTypedDataAsync: signTypedData } = useSignTypedData()
  const [loading, setLoading] = useState(false)

  const execute = async (token: string, threshold: number) => {
    if (!address || !chainId) throw new Error("WALLET_NOT_CONNECTED")
    setLoading(true)

    try {
      // 1. Encrypt the stop price (which is just a percentage drop)
      const encryptedValue = await encryptAmount(threshold.toString())
      const timestamp = Math.floor(Date.now() / 1000)

      // 2. Sign EIP-712 Intent
      const domain = {
        name: "ObolusNetwork",
        version: "0.0.1",
        chainId,
        verifyingContract: OBOLUS_CONTRACTS.RWAVault.address,
      }

      const types = {
        "Set Stop Loss": [
          { name: "account", type: "address" },
          { name: "token", type: "string" },
          { name: "encryptedValue", type: "string" },
          { name: "timestamp", type: "uint256" },
        ],
      }

      const message = {
        account: address,
        token,
        encryptedValue,
        timestamp: BigInt(timestamp),
      }

      const auth = await signTypedData({
        domain,
        types,
        primaryType: "Set Stop Loss",
        message
      })

      // 3. Post to server
      const res = await fetch(`${SERVER_URL}/api/v1/risk/stop-loss`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          account: address,
          token,
          encryptedValue,
          timestamp,
          auth
        })
      })

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

/**
 * Hook to set rebalance drift threshold.
 */
export function useSetDriftTrigger() {
  const { address, chainId } = useAccount()
  const { signTypedDataAsync: signTypedData } = useSignTypedData()
  const [loading, setLoading] = useState(false)

  const execute = async (threshold: number) => {
    if (!address || !chainId) throw new Error("WALLET_NOT_CONNECTED")
    setLoading(true)

    try {
      const timestamp = Math.floor(Date.now() / 1000)

      const domain = {
        name: "ObolusNetwork",
        version: "0.0.1",
        chainId,
        verifyingContract: OBOLUS_CONTRACTS.RWAVault.address,
      }

      const types = {
        "Set Drift Trigger": [
          { name: "account", type: "address" },
          { name: "threshold", type: "uint256" },
          { name: "timestamp", type: "uint256" },
        ],
      }

      const message = {
        account: address,
        threshold: BigInt(threshold),
        timestamp: BigInt(timestamp),
      }

      const auth = await signTypedData({
        domain,
        types,
        primaryType: "Set Drift Trigger",
        message
      })

      const res = await fetch(`${SERVER_URL}/api/v1/risk/drift-trigger`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          account: address,
          threshold,
          timestamp,
          auth
        })
      })

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

/**
 * Hook to save generalized portfolio alerts (encrypted).
 */
export function useSaveAlerts() {
  const { address, chainId } = useAccount()
  const { signTypedDataAsync: signTypedData } = useSignTypedData()
  const [loading, setLoading] = useState(false)

  const execute = async (alertSettings: { navBelow: string, posAbove: string, lossAbove: string }) => {
    if (!address || !chainId) throw new Error("WALLET_NOT_CONNECTED")
    setLoading(true)

    try {
      // 1. Encrypt settings
      const encryptedSettings = await encryptPosition(alertSettings as any)
      const timestamp = Math.floor(Date.now() / 1000)

      // 2. Sign EIP-712 Intent
      const domain = {
        name: "ObolusNetwork",
        version: "0.0.1",
        chainId,
        verifyingContract: OBOLUS_CONTRACTS.RWAVault.address,
      }

      const types = {
        "Save Alerts": [
          { name: "account", type: "address" },
          { name: "encryptedSettings", type: "string" },
          { name: "timestamp", type: "uint256" },
        ],
      }

      const message = {
        account: address,
        encryptedSettings,
        timestamp: BigInt(timestamp),
      }

      const auth = await signTypedData({
        domain,
        types,
        primaryType: "Save Alerts",
        message
      })

      // 3. Post to server
      const res = await fetch(`${SERVER_URL}/api/v1/risk/alerts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          account: address,
          encryptedSettings,
          timestamp,
          auth
        })
      })

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
