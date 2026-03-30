"use client"

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAccount } from 'wagmi'
import { api } from '@/lib/api'
import { useObolusAuth } from './useVaults'

/**
 * Hook for submitting a rebalance job to the Obolus Server.
 */
export function useSubmitRebalance() {
  const { address } = useAccount()
  const { getSignature } = useObolusAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ targetAllocation, strategy }: { targetAllocation: Record<string, number>, strategy: string }) => {
      if (!address) throw new Error("WALLET_NOT_CONNECTED")

      const { signature, nonce } = await getSignature()

      return api.post('/api/v1/rebalance/submit', {
        userAddress: address,
        targetAllocation,
        strategy
      }, { walletAddress: address, signature, nonce })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rebalance-history', address] })
    }
  })
}

/**
 * Hook for fetching rebalance history.
 */
export function useRebalanceHistory(limit: number = 10) {
  const { address } = useAccount()
  return useQuery({
    queryKey: ['rebalance-history', address, limit],
    queryFn: () => api.get<{ jobs: any[] }>(`/api/v1/rebalance/history/${address}?limit=${limit}`, { walletAddress: address }),
    enabled: !!address,
  })
}

/**
 * Hook for fetching the status of a specific rebalance job.
 */
export function useRebalanceStatus(jobId: string) {
  return useQuery({
    queryKey: ['rebalance-status', jobId],
    queryFn: () => api.get<{ job: any }>(`/api/v1/rebalance/status/${jobId}`),
    enabled: !!jobId,
    refetchInterval: (query) => {
      const status = query.state.data?.job?.status
      return (status === 'pending' || status === 'processing') ? 3000 : false
    }
  })
}
/**
 * Helper hook to calculate rebalance trades.
 */
export function useRebalancePreview(current: Record<string, number>, target: Record<string, number>) {
  const symbols = Object.keys(current);
  const trades: { symbol: string; side: 'BUY' | 'SELL'; percentage: number }[] = [];

  symbols.forEach(symbol => {
    const diff = target[symbol] - current[symbol];
    if (Math.abs(diff) > 0.1) {
      trades.push({
        symbol,
        side: diff > 0 ? 'BUY' : 'SELL',
        percentage: Math.abs(diff)
      });
    }
  });

  return trades;
}
