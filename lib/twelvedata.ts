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

// Maps our token symbols to real stock tickers
export const UNDERLYING_TICKERS: Record<string, string> = {
  TSLAon: 'TSLA', NVDAon: 'NVDA', SPYon: 'SPY',
  QQQon: 'QQQ', AMZNon: 'AMZN', MUon: 'MU',
  TSLAx: 'TSLA', AAPLx: 'AAPL', GOOGLx: 'GOOGL',
  SPYx: 'SPY', CRCLX: 'CRCL',
}

export const FALLBACK_STOCK_PRICES: Record<string, number> = {
  TSLA: 245.30, NVDA: 890.50, SPY: 512.80,
  QQQ: 432.10, AMZN: 198.70, MU: 89.40,
  AAPL: 189.50, GOOGL: 178.20, CRCL: 22.40,
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
      } else {
        result[ticker] = {
          price: FALLBACK_STOCK_PRICES[ticker] || 0,
          change: 0,
          changePercent: 0,
          isMarketOpen: false,
        }
      }
    })
    return result
  } catch {
    const fallback: Record<string, any> = {}
    uniqueTickers.forEach(t => {
      fallback[t] = {
        price: FALLBACK_STOCK_PRICES[t] || 0,
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
    return generateMockHistory(ticker, outputsize)
  }
}

export function generateMockHistory(ticker: string, points: number) {
  const base = FALLBACK_STOCK_PRICES[ticker] || 100
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
