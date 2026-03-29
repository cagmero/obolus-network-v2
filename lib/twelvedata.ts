const KEYS = [
  process.env.NEXT_PUBLIC_TWELVE_DATA_KEY_1!,
  process.env.NEXT_PUBLIC_TWELVE_DATA_KEY_2!,
  process.env.NEXT_PUBLIC_TWELVE_DATA_KEY_3!,
].filter(Boolean)

const keyUsage: Record<string, number> = {}
KEYS.forEach(k => keyUsage[k] = 0)

function getNextKey(): string {
  if (KEYS.length === 0) return ''
  return KEYS.reduce((a, b) => keyUsage[a] <= keyUsage[b] ? a : b)
}

if (typeof window !== 'undefined') {
  setInterval(() => KEYS.forEach(k => keyUsage[k] = 0), 3_600_000)
}

// Maps our token symbols to CoinGecko IDs for reliable fallback/real prices
export const COINGECKO_IDS: Record<string, string> = {
  TSLAon: 'tesla-ondo-tokenized-stock',
  NVDAon: 'nvidia-ondo-tokenized-stock',
  SPYon:  'ishares-core-s-p-500-etf-ondo-tokenized-etf',
  QQQon:  'invesco-qqq-etf-ondo-tokenized-etf',
  AMZNon: 'amazon-ondo-tokenized-stock',
  MUon:   'micron-technology-ondo-tokenized-stock',
  TSLAx:  'tesla-xstock',
  AAPLx:  'apple-xstock',
  GOOGLx: 'alphabet-class-a-ondo-tokenized-stock',
  SPYx:   'sp500-xstock',
  CRCLX:  'usd-coin', // Mirroring USDC as a proxy for Circle mock
}

// Maps our token symbols to real stock tickers
export const UNDERLYING_TICKERS: Record<string, string> = {
  TSLAon: 'TSLA', NVDAon: 'NVDA', SPYon: 'SPY',
  QQQon: 'QQQ', AMZNon: 'AMZN', MUon: 'MU',
  TSLAx: 'TSLA', AAPLx: 'AAPL', GOOGLx: 'GOOGL',
  SPYx: 'SPY', CRCLX: 'CRCL',
}

// Fetch real prices from CoinGecko as a robust fallback/primary source
export async function fetchCoinGeckoPrices(symbols: string[]): Promise<Record<string, number>> {
  const ids = symbols.map(s => COINGECKO_IDS[s]).filter(Boolean)
  if (ids.length === 0) return {}
  
  try {
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids.join(',')}&vs_currencies=usd`
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) })
    const data = await res.json()
    
    const prices: Record<string, number> = {}
    symbols.forEach(symbol => {
      const id = COINGECKO_IDS[symbol]
      if (data[id]) {
        prices[symbol] = data[id].usd
      }
    })
    return prices
  } catch (e) {
    console.warn('CoinGecko fetch failed:', e)
    return {}
  }
}

// Batch fetch underlying stock prices — 1 API call for all tickers
export async function fetchStockPrices(tickers: string[]): Promise<
  Record<string, { price: number; change: number; changePercent: number; isMarketOpen: boolean }>
> {
  const uniqueTickers = [...new Set(tickers)]
  try {
    const key = getNextKey()
    if (!key) throw new Error('No API keys available')
    keyUsage[key]++
    const url = `https://api.twelvedata.com/quote?symbol=${uniqueTickers.join(',')}&apikey=${key}`
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) })
    const data = await res.json()

    const result: Record<string, any> = {}
    // Handle single ticker (returns object) vs multiple (returns dict)
    const responses = uniqueTickers.length === 1
      ? { [uniqueTickers[0]]: data }
      : data

    uniqueTickers.forEach(ticker => {
      const d = responses[ticker]
      if (d && d.close && d.status !== 'error') {
        const price = parseFloat(d.close)
        const prev = parseFloat(d.previous_close)
        result[ticker] = {
          price,
          change: Math.round((price - prev) * 100) / 100,
          changePercent: Math.round(((price - prev) / prev) * 10000) / 100,
          isMarketOpen: d.is_market_open === true,
        }
      }
    })

    // If some tickers failed or Twelve Data failed entirely, try CoinGecko as fallback
    const symbolsToFetch = Object.keys(UNDERLYING_TICKERS).filter(s => {
      const ticker = UNDERLYING_TICKERS[s]
      return !result[ticker] || result[ticker].price === 0
    })

    if (symbolsToFetch.length > 0) {
      const cgPrices = await fetchCoinGeckoPrices(symbolsToFetch)
      symbolsToFetch.forEach(symbol => {
        const ticker = UNDERLYING_TICKERS[symbol]
        if (cgPrices[symbol] && (!result[ticker] || result[ticker].price === 0)) {
          result[ticker] = {
            price: cgPrices[symbol],
            change: 0,
            changePercent: 0,
            isMarketOpen: false,
          }
        }
      })
    }
    
    // Last resort for anything still missing: check any other symbol that might map to this ticker
    uniqueTickers.forEach(ticker => {
        if (!result[ticker]) {
            result[ticker] = { price: 0, change: 0, changePercent: 0, isMarketOpen: false }
        }
    })

    return result
  } catch {
    // If Twelve Data fails, try CoinGecko for everything
    const allSymbols = Object.keys(UNDERLYING_TICKERS)
    const cgPrices = await fetchCoinGeckoPrices(allSymbols)
    const fallback: Record<string, any> = {}
    
    uniqueTickers.forEach(t => {
      const symbol = allSymbols.find(s => UNDERLYING_TICKERS[s] === t)
      const price = symbol ? cgPrices[symbol] : 0
      fallback[t] = {
        price: price || 0,
        change: 0, changePercent: 0, isMarketOpen: false
      }
    })
    return fallback
  }
}

// Fetch historical OHLCV for charts
export async function fetchPriceHistory(
  ticker: string,
  interval: string,
  outputsize: number
): Promise<{ timestamp: string; price: number }[]> {
  try {
    const key = getNextKey()
    if (!key) throw new Error('No API keys available')
    keyUsage[key]++
    const url = `https://api.twelvedata.com/time_series?symbol=${ticker}&interval=${interval}&outputsize=${outputsize}&apikey=${key}`
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) })
    const data = await res.json()
    if (data.status === 'error' || !data.values) throw new Error(data.message)
    return data.values.reverse().map((v: any) => ({
      timestamp: v.datetime,
      price: parseFloat(v.close),
    }))
  } catch {
    // If Twelve Data history fails, try to get current price from CoinGecko at least
    const symbol = Object.keys(UNDERLYING_TICKERS).find(s => UNDERLYING_TICKERS[s] === ticker)
    let currentPrice = 0
    if (symbol) {
        const prices = await fetchCoinGeckoPrices([symbol])
        currentPrice = prices[symbol] || 0
    }
    return generateMockHistory(ticker, outputsize, currentPrice)
  }
}

export function generateMockHistory(ticker: string, points: number, lastPrice?: number) {
  const base = lastPrice || 100
  let price = base * 0.92
  const now = Date.now()
  const msPerPoint = (30 * 24 * 3600 * 1000) / points
  return Array.from({ length: points }, (_, i) => {
    price = Math.max(price * (1 + (Math.random() - 0.47) * 0.022), base * 0.7)
    return {
      timestamp: new Date(now - (points - i) * msPerPoint).toISOString(),
      price: Math.round(price * 100) / 100,
    }
  })
}
export function getKeyUsageStats() {
  return KEYS.map((key, i) => ({
    keyIndex: i + 1,
    keyPreview: key.slice(0, 8) + '...',
    callsUsed: keyUsage[key],
    callsRemaining: 800 - keyUsage[key],
  }))
}

export function getTotalCallsRemaining() {
  const used = Object.values(keyUsage).reduce((a, b) => a + b, 0)
  return (KEYS.length * 800) - used
}
