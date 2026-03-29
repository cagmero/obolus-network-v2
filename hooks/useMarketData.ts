import { useQuery } from '@tanstack/react-query'
import { getAllTokenPrices, getSingleTokenPrice, TokenPrice } from '@/lib/priceEngine'
import { fetchPriceHistory, generateMockHistory, UNDERLYING_TICKERS } from '@/lib/twelvedata'

export function useAllPrices() {
  return useQuery({
    queryKey: ['allPrices'],
    queryFn: getAllTokenPrices,
    refetchInterval: 30_000,
    staleTime: 25_000,
  })
}

export function useTokenPrice(symbol: string) {
  return useQuery({
    queryKey: ['price', symbol],
    queryFn: () => getSingleTokenPrice(symbol),
    refetchInterval: 30_000,
    staleTime: 25_000,
    enabled: !!symbol,
  })
}

export function usePriceHistory(symbol: string, timeRange: string = '1M') {
  const ticker = UNDERLYING_TICKERS[symbol] || 'TSLA'
  const config: Record<string, { interval: string, outputsize: number }> = {
    '1D': { interval: '15min', outputsize: 96 },
    '1W': { interval: '1h', outputsize: 168 },
    '1M': { interval: '1day', outputsize: 30 },
    '3M': { interval: '1day', outputsize: 90 },
    '1Y': { interval: '1week', outputsize: 52 },
    'ALL': { interval: '1week', outputsize: 104 },
  }
  const { interval, outputsize } = config[timeRange] || config['1M']

  return useQuery({
    queryKey: ['history', symbol, timeRange],
    queryFn: () => fetchPriceHistory(ticker, interval, outputsize),
    staleTime: 5 * 60_000,
    placeholderData: () => generateMockHistory(ticker, outputsize),
  })
}

export function use24hChange(symbol: string): number {
  const { data } = useTokenPrice(symbol)
  return data?.changePercent ?? 0
}
