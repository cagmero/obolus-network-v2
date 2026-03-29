async function testPrices() {
  console.log('Testing price engine with CoinGecko fallback...')

  const { getAllTokenPrices } = await import('./priceEngine')
  try {
    const prices = await getAllTokenPrices()

    Object.entries(prices).forEach(([symbol, data]) => {
      console.log(`${symbol}: $${data.price} (Source: ${data.source})`)
      if (data.price === 0) {
        console.log(`  ⚠ WARNING: Price for ${symbol} is 0.00`)
      }
    })
  } catch (error) {
    console.error('Error fetching prices:', error)
  }
}

testPrices()
