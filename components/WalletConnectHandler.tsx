"use client"

import { useEffect, useState } from 'react'
import { usePrivy, useWallets } from '@privy-io/react-auth'
import { api } from '@/lib/api'

/**
 * Handles backend user registration/connection when a wallet is connected.
 */
export function WalletConnectHandler() {
  const { authenticated, user, ready } = usePrivy()
  const { wallets } = useWallets()
  const [lastHandledAddress, setLastHandledAddress] = useState<string | null>(null)

  useEffect(() => {
    if (!ready) return

    const wallet = wallets[0]
    const address = wallet?.address || user?.wallet?.address

    if (authenticated && address && address !== lastHandledAddress) {
      const handleConnect = async () => {
        try {
          await api.post('/api/v1/user/connect', {
            walletAddress: address,
            chainId: wallet?.chainId || 0,
            walletClientType: wallet?.walletClientType || 'privy',
          })
          setLastHandledAddress(address)
          console.log('User connected to Obolus Backend:', address)
        } catch (error) {
          console.error('Failed to connect user to Obolus Backend:', error)
        }
      }

      handleConnect()
    } else if (!authenticated) {
      setLastHandledAddress(null)
    }
  }, [ready, authenticated, user, wallets, lastHandledAddress])

  return null
}
