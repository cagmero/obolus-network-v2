import { api } from './api'
import { getAllSValues } from './ondoOracle'
import { fetchStockPrices, UNDERLYING_TICKERS } from './twelvedata'
import { VAULTS } from './vaults'

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

/**
 * Check if NYSE is currently in trading session (including basic pre/post market for demo)
 * 9:30 AM - 4:00 PM ET
 */
function isNYSESessionActive(): boolean {
  const now = new Date()
  const etTime = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false,
    weekday: 'short'
  }).formatToParts(now)

  const h = parseInt(etTime.find(p => p.type === 'hour')?.value || '0')
  const m = parseInt(etTime.find(p => p.type === 'minute')?.value || '0')
  const day = etTime.find(p => p.type === 'weekday')?.value || ''

  const isWeekend = day === 'Sat' || day === 'Sun'
  if (isWeekend) return false

  // Standard: 9:30 - 16:00
  // For demo: Let's expand to 4:00 - 20:00 (Pre + Post market) to be more "Open"
  const timeInMinutes = h * 60 + m
  return timeInMinutes >= (4 * 60) && timeInMinutes <= (20 * 60)
}

export async function getAllTokenPrices(): Promise<Record<string, TokenPrice>> {
  console.log('[OBOLUS:PRICE_ENGINE] Fetching Hybrid Prices...')
  
  // 1. Fetch sValues from BSC (critical for synthetic calculation)
  let sValues: Record<string, { sValue: number; paused: boolean }> = {}
  try {
    sValues = await getAllSValues()
  } catch (e) {
    console.warn('[OBOLUS:PRICE_ENGINE:WARN] Failed to fetch sValues, using 1.0 default')
  }

  // 2. Fetch Stock Prices (Try Server first, then direct TwelveData/CoinGecko)
  let serverPrices: Record<string, any> = {}
  let fetchSource = 'server_cache'
  
  try {
    const response = await api.get<any>('/prices/sync')
    serverPrices = response?.prices || {}
  } catch (e) {
    console.warn('[OBOLUS:PRICE_ENGINE:WARN] Server price sync failed, falling back to direct feed...')
    
    // Direct fallback to TwelveData
    const tickers = VAULTS.map(v => UNDERLYING_TICKERS[v.symbol]).filter(Boolean)
    const liveData = await fetchStockPrices(tickers)
    
    // Map tickers back to symbols
    VAULTS.forEach(v => {
      const ticker = UNDERLYING_TICKERS[v.symbol]
      if (liveData[ticker]) {
        serverPrices[v.symbol] = liveData[ticker]
      }
    })
    fetchSource = 'direct_oracle_fallback'
  }

  const result: Record<string, TokenPrice> = {}
  const symbols = VAULTS.map(v => v.symbol)
  const isCurrentlyOpen = isNYSESessionActive()

  symbols.forEach(symbol => {
    const serverData = serverPrices[symbol] || { price: 0, change: 0, changePercent: 0, source: 'none' }
    const sValueData = sValues[symbol] || { sValue: 1.0, paused: false }
    
    const stockPrice = serverData.price || 0
    const gmPrice = stockPrice * sValueData.sValue

    // CRCLX (Circle) and Stablecoins are always open
    const forceOpen = symbol.includes('CRCL') || symbol.includes('USD')

    result[symbol] = {
      price: Math.round(gmPrice * 100) / 100,
      stockPrice,
      sValue: sValueData.sValue,
      paused: sValueData.paused,
      change: Math.round((serverData.change || 0) * sValueData.sValue * 100) / 100,
      changePercent: serverData.changePercent || 0,
      isMarketOpen: forceOpen || isCurrentlyOpen,
      source: `${fetchSource}+${serverData.source || 'direct'}`,
    }
  })

  return result
}

export async function getSingleTokenPrice(symbol: string): Promise<TokenPrice> {
  const all = await getAllTokenPrices()
  const isCurrentlyOpen = isNYSESessionActive()
  const forceOpen = symbol.includes('CRCL') || symbol.includes('USD')

  return all[symbol] || {
    price: 0,
    stockPrice: 0, sValue: 1.0, paused: false,
    change: 0, changePercent: 0, isMarketOpen: forceOpen || isCurrentlyOpen,
    source: 'fallback'
  }
}
