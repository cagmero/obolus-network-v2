import { useQuery } from '@tanstack/react-query'
import { getAllPrices, getTokenPrice, GM_TOKEN_ADDRESSES, MOCK_PRICES } from '@/lib/ondoOracle'

export function useAllPrices() {
  return useQuery({
    queryKey: ['allPrices'],
    queryFn: getAllPrices,
    refetchInterval: 30000, // refresh every 30s
    staleTime: 25000,
  })
}

export function useTokenPrice(symbol: string) {
  return useQuery({
    queryKey: ['price', symbol],
    queryFn: async () => {
      const address = GM_TOKEN_ADDRESSES[symbol]
      if (!address || address.includes('fetch')) return MOCK_PRICES[symbol] || 0
      const raw = await getTokenPrice(address)
      if (raw === BigInt(0)) return MOCK_PRICES[symbol] || 0
      return Number(raw) / 1e18
    },
    refetchInterval: 30000,
    enabled: !!symbol,
  })
}
