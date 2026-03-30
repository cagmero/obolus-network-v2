import { createPublicClient, http, parseAbi } from 'viem'
import { bsc } from 'viem/chains'

const BSC_CLIENT = createPublicClient({
  chain: bsc,
  transport: http(process.env.NEXT_PUBLIC_BSC_RPC || 'https://bsc-dataseed1.binance.org', {
    timeout: 10_000,
    retryCount: 2,
  })
})

export const SYNTHETIC_SHARES_ORACLE = '0xF4Fd8a1B412633e10527454137A29Db7Aa35F15e' as const

export const ORACLE_ABI = parseAbi([
  'function getSValue(address asset) external view returns (uint128 sValue, bool paused)',
  'function getSValueBatch(address[] calldata assets) external view returns (uint128[] memory sValues, bool[] memory paused)',
])

// Real Ondo GM token addresses on BSC MAINNET
// Note: These addresses should be updated with the real ones when available.
// For now, using the ones from the previous ondoOracle.ts or placeholders.
export const ONDO_GM_BSC_ADDRESSES: Record<string, `0x${string}`> = {
  TSLAon: '0x2494b603a1158652d3a33994c643939634b59d93', 
  NVDAon: '0xa9ee65b71946803277884d5885c3411b0e016f75', 
  SPYon:  '0x6a708EAD771238919D85930b5a0f10454E1C331a', 
  QQQon:  '0x0000000000000000000000000000000000000004', // PLACEHOLDER
  AMZNon: '0x0000000000000000000000000000000000000005', // PLACEHOLDER
  MUon:   '0x050362ab1072cb2ce74d74770e22a3203ad04ee5', 
}

// Default sValues (1:1 multiplier) used as fallback
export const DEFAULT_SVALUES: Record<string, number> = {
  TSLAon: 1.0, NVDAon: 1.0, SPYon: 1.0,
  QQQon: 1.0, AMZNon: 1.0, MUon: 1.0,
}

export interface SValueResult {
  sValue: number      // multiplier, e.g. 1.05 means 5% dividend compounded in
  paused: boolean     // true during corporate actions
  raw: bigint         // raw 18-decimal value from contract
}

// Fetch sValue for a single Ondo GM token
export async function getOndoSValue(
  symbol: string
): Promise<SValueResult> {
  const address = ONDO_GM_BSC_ADDRESSES[symbol]
  // If address is placeholder or zero, return default
  if (!address || address.startsWith('0x000000000000000000000000000000000000000')) {
    return { sValue: DEFAULT_SVALUES[symbol] || 1.0, paused: false, raw: BigInt(1e18) }
  }
  try {
    console.log(`[OBOLUS:ONDO_ORACLE] Reading sValue for ${symbol} at ${address}`)
    const [sValue, paused] = await BSC_CLIENT.readContract({
      address: SYNTHETIC_SHARES_ORACLE,
      abi: ORACLE_ABI,
      functionName: 'getSValue',
      args: [address],
    })
    console.log(`[OBOLUS:ONDO_ORACLE] sValue: ${Number(sValue) / 1e18} paused: ${paused} for ${symbol}`)
    return {
      sValue: Number(sValue) / 1e18,
      paused,
      raw: sValue,
    }
  } catch (e: any) {
    console.warn(`[OBOLUS:ONDO_ORACLE:WARN] Ondo oracle read failed for ${symbol}:`, e.message)
    return { sValue: DEFAULT_SVALUES[symbol] || 1.0, paused: false, raw: BigInt(1e18) }
  }
}

// Batch fetch sValues for all Ondo GM tokens
export async function getAllSValues(): Promise<Record<string, SValueResult>> {
  const symbols = Object.keys(ONDO_GM_BSC_ADDRESSES)
  console.log('[OBOLUS:ONDO_ORACLE] Batch fetching sValues for', symbols)
  const addresses = symbols.map(s => ONDO_GM_BSC_ADDRESSES[s])

  // Split into real addresses and placeholders
  const realEntries: { symbol: string, address: `0x${string}` }[] = []
  const result: Record<string, SValueResult> = {}

  symbols.forEach((s, i) => {
    const addr = addresses[i]
    if (addr && !addr.startsWith('0x0000000000000000000000000000000000000')) {
        realEntries.push({ symbol: s, address: addr })
    } else {
        result[s] = { sValue: DEFAULT_SVALUES[s] || 1.0, paused: false, raw: BigInt(1e18) }
    }
  })

  if (realEntries.length === 0) {
    return result
  }

  try {
    const realAddresses = realEntries.map(e => e.address)
    const [sValues, paused] = await BSC_CLIENT.readContract({
      address: SYNTHETIC_SHARES_ORACLE,
      abi: ORACLE_ABI,
      functionName: 'getSValueBatch',
      args: [realAddresses],
    })
    
    realEntries.forEach((e, i) => {
      result[e.symbol] = {
        sValue: Number(sValues[i]) / 1e18,
        paused: paused[i],
        raw: sValues[i],
      }
    })
    return result
  } catch (e) {
    console.warn('Ondo batch oracle read failed:', e)
    symbols.forEach(s => {
      if (!result[s]) {
        result[s] = { sValue: DEFAULT_SVALUES[s] || 1.0, paused: false, raw: BigInt(1e18) }
      }
    })
    return result
  }
}
