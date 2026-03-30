import { useReadContract, useReadContracts } from 'wagmi'
import { CONTRACT_ADDRESSES } from '@/lib/wagmi'
import { RWAVaultABI, ObolusOracleABI, MockERC20ABI, ERC20ABI } from '@/lib/abis'
import { useAccount } from 'wagmi'
import { formatEther } from 'viem'

// ── Vault reads ────────────────────────────────────────────

export function useVaultPosition(tokenAddress: string) {
  const { address } = useAccount()
  const result = useReadContract({
    address: CONTRACT_ADDRESSES.RWAVault as `0x${string}`,
    abi: RWAVaultABI,
    functionName: 'getPosition',
    args: [address as `0x${string}`, tokenAddress as `0x${string}`],
    query: { enabled: !!address && !!tokenAddress },
  })
  return {
    ...result,
    formatted: result.data ? formatEther(result.data as bigint) : '0',
    raw: result.data as bigint || BigInt(0),
  }
}

export function useVaultShares(userAddress?: string) {
  const { address } = useAccount()
  const user = userAddress || address
  const result = useReadContract({
    address: CONTRACT_ADDRESSES.RWAVault as `0x${string}`,
    abi: RWAVaultABI,
    functionName: 'getTotalShares',
    args: [user as `0x${string}`],
    query: { enabled: !!user },
  })
  return {
    ...result,
    formatted: result.data ? formatEther(result.data as bigint) : '0',
    raw: result.data as bigint || BigInt(0),
  }
}

export function useIsTokenAccepted(tokenAddress: string) {
  return useReadContract({
    address: CONTRACT_ADDRESSES.RWAVault as `0x${string}`,
    abi: RWAVaultABI,
    functionName: 'acceptedTokens',
    args: [tokenAddress as `0x${string}`],
    query: { enabled: !!tokenAddress },
  })
}

// ── Oracle reads ───────────────────────────────────────────

export function useOracleSValue(tokenAddress: string) {
  const result = useReadContract({
    address: CONTRACT_ADDRESSES.ObolusOracle as `0x${string}`,
    abi: ObolusOracleABI,
    functionName: 'getSValue',
    args: [tokenAddress as `0x${string}`],
    query: { enabled: !!tokenAddress },
  })
  // getSValue returns (uint128 sValue, bool paused)
  const [sValue, paused] = (result.data as [bigint, boolean]) || [BigInt(0), false]
  return {
    ...result,
    sValue: sValue ? Number(sValue) / 1e18 : 1.0,
    paused: paused || false,
  }
}

export function useAllRegisteredTokens() {
  return useReadContract({
    address: CONTRACT_ADDRESSES.ObolusOracle as `0x${string}`,
    abi: ObolusOracleABI,
    functionName: 'getRegisteredTokens',
  })
}

// ── Token reads ────────────────────────────────────────────

export function useTokenBalance(tokenAddress: string, userAddress?: string) {
  const { address } = useAccount()
  const user = userAddress || address
  const result = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: ERC20ABI,
    functionName: 'balanceOf',
    args: [user as `0x${string}`],
    query: { enabled: !!user && !!tokenAddress },
  })
  return {
    ...result,
    formatted: result.data ? formatEther(result.data as bigint) : '0',
    raw: result.data as bigint || BigInt(0),
  }
}

export function useTokenAllowance(tokenAddress: string) {
  const { address } = useAccount()
  const result = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: ERC20ABI,
    functionName: 'allowance',
    args: [address as `0x${string}`, CONTRACT_ADDRESSES.RWAVault as `0x${string}`],
    query: { enabled: !!address && !!tokenAddress },
  })
  return {
    ...result,
    formatted: result.data ? formatEther(result.data as bigint) : '0',
    raw: result.data as bigint || BigInt(0),
  }
}

// Batch read all 9 token balances at once
export function useAllTokenBalances() {
  const { address } = useAccount()

  const exclude = ['RWAVault', 'ObolusOracle']
  const contracts = Object.entries(CONTRACT_ADDRESSES)
    .filter(([key]) => !exclude.includes(key))
    .map(([symbol, tokenAddress]) => ({
      address: tokenAddress as `0x${string}`,
      abi: ERC20ABI,
      functionName: 'balanceOf' as const,
      args: [address as `0x${string}`],
    }))

  const results = useReadContracts({
    contracts,
    query: { enabled: !!address },
  })

  const symbols = Object.keys(CONTRACT_ADDRESSES)
    .filter(key => !exclude.includes(key))

  const balances: Record<string, { raw: bigint, formatted: string }> = {}
  results.data?.forEach((result, i) => {
    const symbol = symbols[i]
    const raw = (result.result as bigint) || BigInt(0)
    balances[symbol] = {
      raw,
      formatted: formatEther(raw),
    }
  })

  return { ...results, balances }
}

// Batch read all 9 vault positions at once
export function useAllVaultPositions() {
  const { address } = useAccount()

  const exclude = ['RWAVault', 'ObolusOracle']
  const contracts = Object.entries(CONTRACT_ADDRESSES)
    .filter(([key]) => !exclude.includes(key))
    .map(([symbol, tokenAddress]) => ({
      address: CONTRACT_ADDRESSES.RWAVault as `0x${string}`,
      abi: RWAVaultABI,
      functionName: 'getPosition' as const,
      args: [address as `0x${string}`, tokenAddress as `0x${string}`],
    }))

  const results = useReadContracts({
    contracts,
    query: { enabled: !!address },
    // refetchInterval: 10_000,
  })

  const symbols = Object.keys(CONTRACT_ADDRESSES)
    .filter(key => !exclude.includes(key))

  const positions: Record<string, { raw: bigint, formatted: string, hasPosition: boolean }> = {}
  results.data?.forEach((result, i) => {
    const symbol = symbols[i]
    const raw = (result.result as bigint) || BigInt(0)
    positions[symbol] = {
      raw,
      formatted: formatEther(raw),
      hasPosition: raw > BigInt(0),
    }
  })

  return { ...results, positions }
}
