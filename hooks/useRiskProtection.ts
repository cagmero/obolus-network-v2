"use client"

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAccount } from 'wagmi'
import { api } from '@/lib/api'
import { useObolusAuth } from './useVaults'

/**
 * Hook for saving risk settings to the Obolus Server.
 */
export function useSaveRiskSettings() {
  const { address } = useAccount()
  const { getSignature } = useObolusAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ stopLosses, driftTrigger, alerts }: { stopLosses: any[], driftTrigger: number, alerts: any }) => {
      if (!address) throw new Error("WALLET_NOT_CONNECTED")

      const { signature, nonce } = await getSignature()

      return api.post('/api/v1/risk/settings', {
        userAddress: address,
        stopLosses,
        driftTrigger,
        alerts
      }, { walletAddress: address, signature, nonce })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['risk-settings', address] })
    }
  })
}

/**
 * Hook for fetching risk settings.
 */
export function useRiskSettings() {
  const { address } = useAccount()
  return useQuery({
    queryKey: ['risk-settings', address],
    queryFn: () => api.get<{ settings: any }>(`/api/v1/risk/settings/${address}`, { walletAddress: address }),
    enabled: !!address,
  })
}
