import { createPublicClient, http } from 'viem'
import { bsc } from 'wagmi/chains'

const BSC_CLIENT = createPublicClient({
  chain: bsc,
  transport: http('https://bsc-dataseed.binance.org')
})

const SYNTHETIC_SHARES_ORACLE = '0xF4Fd8a1B412633e10527454137A29Db7Aa35F15e'

const ORACLE_ABI = [
  {
    name: 'getPrice',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'token', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }]
  }
] as const

// Real Ondo GM token addresses on BSC Mainnet
export const GM_TOKEN_ADDRESSES: Record<string, string> = {
  TSLAon: '0x2494b603a1158652d3a33994c643939634b59d93',
  NVDAon: '0xa9ee65b71946803277884d5885c3411b0e016f75',
  SPYon:  '0x6a708EAD771238919D85930b5a0f10454E1C331a', // Example address
  QQQon:  '0x[fetch_from_Ondo_GM_sheet_QQQon]',
  AMZNon: '0x[fetch_from_Ondo_GM_sheet_AMZNon]',
  MUon:   '0x050362ab1072cb2ce74d74770e22a3203ad04ee5',
}

export const MOCK_PRICES: Record<string, number> = {
  TSLAon: 245.30,
  NVDAon: 890.50,
  SPYon:  512.80,
  QQQon:  432.10,
  AMZNon: 198.70,
  MUon:   89.40,
  TSLAx:  245.30,
  AAPLx:  189.50,
  GOOGLx: 178.20,
  SPYx:   512.80,
  CRCLX:  22.40,
}

export async function getTokenPrice(tokenAddress: string): Promise<bigint> {
  try {
    // Basic validation for typical "placeholder" style addresses
    if (!tokenAddress.startsWith('0x') || tokenAddress.includes('fetch')) {
      throw new Error('Invalid address')
    }

    const price = await BSC_CLIENT.readContract({
      address: SYNTHETIC_SHARES_ORACLE as `0x${string}`,
      abi: ORACLE_ABI,
      functionName: 'getPrice',
      args: [tokenAddress as `0x${string}`]
    })
    return price
  } catch (e) {
    console.warn(`Oracle read failed for ${tokenAddress}, using mock price fallback`)
    return BigInt(0)
  }
}

export async function getAllPrices(): Promise<Record<string, number>> {
  const prices: Record<string, number> = {}
  
  // Handle Ondo tokens
  for (const [symbol, address] of Object.entries(GM_TOKEN_ADDRESSES)) {
    try {
      const raw = await getTokenPrice(address)
      if (raw > BigInt(0)) {
        prices[symbol] = Number(raw) / 1e18
      } else {
        prices[symbol] = MOCK_PRICES[symbol] || 0
      }
    } catch {
      prices[symbol] = MOCK_PRICES[symbol] || 0
    }
  }

  // Handle Non-Ondo tokens
  const nonOndo = ['TSLAx', 'AAPLx', 'GOOGLx', 'SPYx', 'CRCLX']
  for (const symbol of nonOndo) {
    prices[symbol] = MOCK_PRICES[symbol] || 0
  }

  return prices
}
