import { useQuery } from '@tanstack/react-query'

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3001'

export function useAssetPriceHistory(symbol: string, days: number = 30) {
  return useQuery({
    queryKey: ['priceHistory', symbol, days],
    queryFn: async () => {
      try {
        const res = await fetch(`${SERVER_URL}/api/v1/prices/history/${symbol}?days=${days}`)
        if (!res.ok) throw new Error('Server unavailable')
        const data = await res.json()
        if (data.length === 0) return generateMockPriceHistory(symbol, days)
        return data
      } catch {
        // Generate realistic mock history if server not running or error
        return generateMockPriceHistory(symbol, days)
      }
    },
    staleTime: 60000,
  })
}

export function usePortfolioNAVHistory(userAddress: string, days: number = 30) {
  return useQuery({
    queryKey: ['navHistory', userAddress, days],
    queryFn: async () => {
      if (!userAddress) return []
      try {
        const res = await fetch(
          `${SERVER_URL}/api/v1/portfolio/nav-history/${userAddress}?days=${days}`
        )
        if (!res.ok) throw new Error('Server unavailable')
        const data = await res.json()
        if (data.length === 0) return generateMockNAVHistory(days)
        return data
      } catch {
        return generateMockNAVHistory(days)
      }
    },
    enabled: !!userAddress,
    staleTime: 60000,
  })
}

// Mock data generator — realistic price movement
function generateMockPriceHistory(symbol: string, days: number) {
  const basePrices: Record<string, number> = {
    TSLAon: 245, NVDAon: 890, SPYon: 512, QQQon: 432,
    AMZNon: 198, MUon: 89, TSLAx: 245, AAPLx: 189,
    GOOGLx: 178, SPYx: 512, CRCLX: 22,
  }
  const base = basePrices[symbol] || 100
  const now = Date.now()
  return Array.from({ length: days * 24 }, (_, i) => ({
    timestamp: new Date(now - (days * 24 - i) * 3600000).toISOString(),
    price: base * (1 + (Math.random() - 0.5) * 0.02) * // daily volatility
      (1 + (i / (days * 24)) * 0.05) // slight upward trend
  }))
}

function generateMockNAVHistory(days: number) {
  const now = Date.now()
  let nav = 10000
  return Array.from({ length: days }, (_, i) => {
    nav = nav * (1 + (Math.random() - 0.45) * 0.03)
    return {
      timestamp: new Date(now - (days - i) * 86400000).toISOString(),
      nav: Math.round(nav * 100) / 100
    }
  })
}
