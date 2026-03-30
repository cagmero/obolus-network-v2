import { api } from './api'
import { getAllSValues } from './ondoOracle'

export interface TokenPrice {
  price: number           // USD price of the GM token
  stockPrice: number      // underlying stock price in USD
  sValue: number          // Ondo synthetic shares multiplier
  paused: boolean         // true if Ondo oracle is paused for corporate action
  change: number          // 24h price change in USD
  changePercent: number   // 24h price change in %
  isMarketOpen: boolean   // NYSE market hours
  source: string
}

export async function getAllTokenPrices(): Promise<Record<string, TokenPrice>> {
  console.log('[OBOLUS:PRICE_ENGINE] Fetching prices from Obolus Server Cache...')
  try {
    // 1. Fetch cached/synced prices from our server
    const response = await api.get<any>('/prices/sync')
    const serverPrices = response?.prices || {}

    // 2. Fetch sValues from BSC (for synthetic calculation)
    const sValues = await getAllSValues()

    const result: Record<string, TokenPrice> = {}
    const symbols = Object.keys(serverPrices)

    symbols.forEach(symbol => {
      const serverData = serverPrices[symbol]
      const sValueData = sValues[symbol] || { sValue: 1.0, paused: false }
      
      const stockPrice = serverData.price
      const gmPrice = stockPrice * sValueData.sValue

      result[symbol] = {
        price: Math.round(gmPrice * 100) / 100,
        stockPrice,
        sValue: sValueData.sValue,
        paused: sValueData.paused,
        change: Math.round((serverData.change || 0) * sValueData.sValue * 100) / 100,
        changePercent: serverData.changePercent || 0,
        isMarketOpen: serverData.isMarketOpen || false,
        source: `server_cache+${serverData.source}`,
      }
    })

    return result
  } catch (e: any) {
    console.error('[OBOLUS:PRICE_ENGINE:ERROR] Server price fetch failed', { error: e.message })
    throw e
  }
}

export async function getSingleTokenPrice(symbol: string): Promise<TokenPrice> {
  const all = await getAllTokenPrices()
  return all[symbol] || {
    price: 0,
    stockPrice: 0, sValue: 1.0, paused: false,
    change: 0, changePercent: 0, isMarketOpen: false,
    source: 'fallback'
  }
}
