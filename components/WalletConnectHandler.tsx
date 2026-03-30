"use client"

import { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'
import { api } from '@/lib/api'

/**
 * Handles backend user registration/connection when a wallet is connected.
 */
export function WalletConnectHandler() {
  const { address, isConnected, chainId } = useAccount()
  const [lastHandledAddress, setLastHandledAddress] = useState<string | null>(null)

  useEffect(() => {
    if (isConnected && address && address !== lastHandledAddress) {
      const handleConnect = async () => {
        try {
          await api.post('/api/v1/user/connect', {
            walletAddress: address,
            chainId,
          })
          setLastHandledAddress(address)
          console.log('User connected to Obolus Backend:', address)
        } catch (error) {
          console.error('Failed to connect user to Obolus Backend:', error)
        }
      }

      handleConnect()
    } else if (!isConnected) {
      setLastHandledAddress(null)
    }
  }, [isConnected, address, chainId, lastHandledAddress])

  return null // This component doesn't render anything
}
