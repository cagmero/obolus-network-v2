import { fetchStockPrices, UNDERLYING_TICKERS } from './twelvedata'
import { getAllSValues } from './ondoOracle'

export interface TokenPrice {
  price: number           // USD price of the GM token
  stockPrice: number      // underlying stock price in USD
  sValue: number          // Ondo synthetic shares multiplier
  paused: boolean         // true if Ondo oracle is paused for corporate action
  change: number          // 24h price change in USD
  changePercent: number   // 24h price change in %
  isMarketOpen: boolean   // NYSE market hours
  source: 'ondo+twelve_data' | 'twelve_data_only' | 'coingecko' | 'fallback'
}

// All 11 token symbols
const ALL_SYMBOLS = Object.keys(UNDERLYING_TICKERS)
// Ondo GM tokens (have sValue)
const ONDO_SYMBOLS = ['TSLAon', 'NVDAon', 'SPYon', 'QQQon', 'AMZNon', 'MUon']

export async function getAllTokenPrices(): Promise<Record<string, TokenPrice>> {
  console.log('[OBOLUS:PRICE_ENGINE] Fetching all token prices...')
  try {
    // Fetch in parallel: stock prices (Twelve Data) + sValues (BSC oracle)
    const tickers = Array.from(new Set(Object.values(UNDERLYING_TICKERS)))
    const [stockPrices, sValues] = await Promise.all([
      fetchStockPrices(tickers),
      getAllSValues(),
    ])

    console.log('[OBOLUS:PRICE_ENGINE] Stock prices fetched', { 
      tickers: Object.keys(stockPrices),
      samplePrice: stockPrices['TSLA']?.price
    })
    console.log('[OBOLUS:PRICE_ENGINE] sValues fetched', {
      symbols: Object.keys(sValues),
      sampleSValue: sValues['TSLAon']?.sValue
    })

    const result: Record<string, TokenPrice> = {}

    ALL_SYMBOLS.forEach(symbol => {
      const ticker = UNDERLYING_TICKERS[symbol]
      const stock = stockPrices[ticker]
      const stockPrice = stock?.price || 0

      if (ONDO_SYMBOLS.includes(symbol)) {
        const sValueData = sValues[symbol] || { sValue: 1.0, paused: false }
        // GM token price = underlying stock price × sValue multiplier
        const gmPrice = stockPrice * sValueData.sValue

        result[symbol] = {
          price: Math.round(gmPrice * 100) / 100,
          stockPrice,
          sValue: sValueData.sValue,
          paused: sValueData.paused,
          change: stock ? Math.round(stock.change * sValueData.sValue * 100) / 100 : 0,
          changePercent: stock?.changePercent || 0,
          isMarketOpen: stock?.isMarketOpen || false,
          // Source depends on sValue and whether we got stock data from Twelve Data or CoinGecko
          source: sValueData.sValue !== 1.0 ? 'ondo+twelve_data' : (stock?.price ? 'twelve_data_only' : 'coingecko'),
        }
      } else {
        // Non-Ondo mock tokens — just the stock price directly
        result[symbol] = {
          price: stockPrice,
          stockPrice,
          sValue: 1.0,
          paused: false,
          change: stock?.change || 0,
          changePercent: stock?.changePercent || 0,
          isMarketOpen: stock?.isMarketOpen || false,
          source: stock?.price ? 'twelve_data_only' : 'coingecko',
        }
      }
      
      const data = result[symbol]
      console.log(`[OBOLUS:PRICE_ENGINE] ${symbol}: $${data.price} (${data.source}) sValue:${data.sValue}`)
    })

    return result
  } catch (e: any) {
    console.error('[OBOLUS:PRICE_ENGINE:ERROR] Price fetch failed', { error: e.message })
    throw e
  }
}

export async function getSingleTokenPrice(symbol: string): Promise<TokenPrice> {
  const all = await getAllTokenPrices()
  const ticker = UNDERLYING_TICKERS[symbol] || 'TSLA'
  return all[symbol] || {
    price: 0,
    stockPrice: 0, sValue: 1.0, paused: false,
    change: 0, changePercent: 0, isMarketOpen: false,
    source: 'fallback'
  }
}
