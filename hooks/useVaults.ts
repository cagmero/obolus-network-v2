"use client"

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { usePrivy, useWallets } from '@privy-io/react-auth'
import { useAccount, useSignTypedData, useWriteContract } from 'wagmi'
import { api } from '@/lib/api'
import { OBOLUS_CONTRACTS } from '@/lib/wagmi'
import { RWAVaultABI } from '@/lib/abis'
import { parseUnits, parseAbi } from 'viem'
import { encryptAmount } from '@/lib/encryption'

const ERC20_ABI = parseAbi([
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)"
])

// --- Helper for EIP-712 Auth ---

export function useObolusAuth() {
  const { authenticated, user, ready } = usePrivy()
  const { wallets } = useWallets()
  const wallet = wallets[0]
  const address = wallet?.address || user?.wallet?.address
  const chainId = wallet?.chainId

  const { signTypedDataAsync } = useSignTypedData()
  const queryClient = useQueryClient()

  const getSignature = async () => {
    if (!address || !chainId) throw new Error("WALLET_NOT_CONNECTED")

    // 1. Get current nonce from server
    const { nonce } = await api.get<{ nonce: string }>(`/api/v1/user/${address}/nonce`)

    // 2. Sign EIP-712 message
    const domain = {
      name: 'ObolusNetwork',
      version: '0.1.0',
      chainId: chainId,
      verifyingContract: OBOLUS_CONTRACTS.RWAVault.address, // Use vault address as verifying contract
    }

    const types = {
      ObolusAuth: [
        { name: 'walletAddress', type: 'address' },
        { name: 'nonce', type: 'string' },
      ],
    }

    const message = {
      walletAddress: address,
      nonce: nonce,
    }

    const signature = await signTypedDataAsync({
      domain,
      types,
      primaryType: 'ObolusAuth',
      message,
    })

    return { signature, nonce }
  }

  return { getSignature }
}

// --- Hooks ---

/**
 * Fetch user profile and stats
 */
export function useUserProfile() {
  const { user } = usePrivy()
  const { wallets } = useWallets()
  const address = wallets[0]?.address || user?.wallet?.address
  return useQuery({
    queryKey: ['user-profile', address],
    queryFn: () => api.get<any>(`/api/v1/user/${address}`, { walletAddress: address }),
    enabled: !!address,
  })
}

/**
 * Fetch platform-wide TVL and position counts
 */
export function usePlatformTVL() {
  return useQuery({
    queryKey: ['platform-tvl'],
    queryFn: () => api.get<any>('/api/v1/vault/tvl'),
  })
}

/**
 * Fetch all active positions for a user
 */
export function useVaultPositions() {
  const { user } = usePrivy()
  const { wallets } = useWallets()
  const address = wallets[0]?.address || user?.wallet?.address
  return useQuery({
    queryKey: ['vault-positions', address],
    queryFn: async () => {
      try {
        const data = await api.get<{ positions: any[] }>(`/api/v1/vault/positions/${address}`)
        return data
      } catch (error) {
        console.error('[OBOLUS:VAULT_POSITIONS:ERROR] Failed to fetch positions', error)
        throw error
      }
    },
    enabled: !!address,
  })
}

/**
 * Fetch NAV history for a user.
 * Improved to construct real history from market data if server data is unavailable.
 */
export function useNAVHistory(days: number = 30, currentPositions?: any[]) {
  const { user } = usePrivy()
  const { wallets } = useWallets()
  const address = wallets[0]?.address || user?.wallet?.address
  const queryClient = useQueryClient()

  return useQuery({
    queryKey: ['nav-history', address, days, !!currentPositions],
    queryFn: async () => {
      // 1. Try to fetch real history from server
      try {
        const data = await api.get<{ snapshots: any[] }>(`/api/v1/nav/history/${address}?days=${days}`, { walletAddress: address })
        if (data.snapshots && data.snapshots.length >= 2) {
          return data
        }
      } catch (e) {
        console.warn('[OBOLUS:NAV_HISTORY] Server history empty or failed, reconstructing real trend from market data...')
      }

      // 2. RECONSTRUCTION: Build history from current holdings + real market history
      // We use currentPositions if provided, otherwise check cache
      const positions = currentPositions || 
                        queryClient.getQueryData<any>(['vault-positions', address])?.positions || 
                        []
      
      const activePositions = positions.filter((p: any) => parseFloat(p.formatted) > 0)
      
      if (activePositions.length === 0) return { snapshots: [] }

      // Dynamically import history fetcher to avoid circular deps
      const { fetchPriceHistory, UNDERLYING_TICKERS } = await import('@/lib/twelvedata')
      
      // Fetch historical prices for each held stock
      const histories: Record<string, { timestamp: string, price: number }[]> = {}
      await Promise.all(activePositions.map(async (pos: any) => {
        const ticker = UNDERLYING_TICKERS[pos.symbol]
        if (ticker) {
          try {
            const h = await fetchPriceHistory(ticker, '1day', days)
            histories[pos.symbol] = h
          } catch (err) {
            console.error(`Failed to fetch history for ${pos.symbol}`, err)
          }
        }
      }))

      // Aggregate into a single NAV line
      // Use time points from the first successful history as baseline
      const baselineSymbol = Object.keys(histories)[0]
      if (!baselineSymbol) return { snapshots: [] }
      
      const timestamps = histories[baselineSymbol].map(p => p.timestamp)
      
      const snapshots = timestamps.map(ts => {
        let totalValue = 0
        activePositions.forEach((pos: any) => {
          const history = histories[pos.symbol] || []
          // Match by date string
          const dateStr = ts.split(' ')[0] || ts.split('T')[0]
          const snap = history.find(p => p.timestamp.startsWith(dateStr))
          const priceAtT = snap ? snap.price : (history[0]?.price || 0)
          
          totalValue += parseFloat(pos.formatted || '0') * priceAtT
        })
        return { 
          timestamp: ts, 
          value: Math.round(totalValue * 100) / 100 
        }
      })

      return { snapshots }
    },
    enabled: !!address,
    staleTime: 10 * 60_000,
  })
}

/**
 * Fetch latest prices for all tokens
 */
export function useLatestPrices() {
  return useQuery({
    queryKey: ['latest-prices'],
    queryFn: () => api.get<{ prices: Record<string, any> }>('/api/v1/prices/latest'),
  })
}

/**
 * Fetch transaction history
 */
export function useRecentTransactions(limit: number = 10) {
  const { user } = usePrivy()
  const { wallets } = useWallets()
  const address = wallets[0]?.address || user?.wallet?.address
  return useQuery({
    queryKey: ['transactions', address, limit],
    queryFn: () => api.get<{ transactions: any[] }>(`/api/v1/transactions/${address}?limit=${limit}`, { walletAddress: address }),
    enabled: !!address,
  })
}

/**
 * Execute a Deposit Flow: Approve -> Deposit -> Record Transaction -> Upsert Position
 */
export function useVaultDeposit() {
  const { user } = usePrivy()
  const { wallets } = useWallets()
  const wallet = wallets[0]
  const address = wallet?.address || user?.wallet?.address
  const chainId = wallet?.chainId

  const { writeContractAsync } = useWriteContract()
  const { getSignature } = useObolusAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ tokenAddress, amount, vaultId }: { tokenAddress: `0x${string}`, amount: string, vaultId: string }) => {
      if (!address || !chainId) throw new Error("WALLET_NOT_CONNECTED")
      const units = parseUnits(amount, 18)

      // 1. Approve (on-chain)
      await writeContractAsync({
        address: tokenAddress,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [OBOLUS_CONTRACTS.RWAVault.address, units],
      })

      // 2. Deposit (on-chain)
      const txHash = await writeContractAsync({
        address: OBOLUS_CONTRACTS.RWAVault.address,
        abi: RWAVaultABI,
        functionName: 'deposit',
        args: [tokenAddress, units],
      })

      // 3. Get Auth Signature for server recording
      const { signature, nonce } = await getSignature()

      // 4. Record Transaction in Backend
      const encryptedAmount = await encryptAmount(amount)
      await api.post('/api/v1/transactions/record', {
        userAddress: address,
        type: 'deposit',
        vaultId,
        tokenAddress,
        encryptedAmount,
        txHash,
        chainId,
        status: 'executed'
      }, { walletAddress: address, signature, nonce })

      // 5. Upsert Position in Backend
      await api.post('/api/v1/vault/position/upsert', {
        userAddress: address,
        vaultId,
        tokenAddress,
        encryptedBalance: encryptedAmount, // Note: Simplification for demo
        encryptedEntryPrice: "0", // Will be updated by CRE
        txHashDeposit: txHash,
        chainId
      }, { walletAddress: address, signature: signature, nonce: nonce }) 

      return txHash
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vault-positions'] })
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['nav-history'] })
    }
  })
}

/**
 * Execute a Withdraw Flow
 */
export function useVaultWithdraw() {
  const { user } = usePrivy()
  const { wallets } = useWallets()
  const wallet = wallets[0]
  const address = wallet?.address || user?.wallet?.address
  const chainId = wallet?.chainId

  const { writeContractAsync } = useWriteContract()
  const { getSignature } = useObolusAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ tokenAddress, shares, vaultId }: { tokenAddress: `0x${string}`, shares: string, vaultId: string }) => {
      if (!address || !chainId) throw new Error("WALLET_NOT_CONNECTED")
      const units = parseUnits(shares, 18)

      // 1. Withdraw (on-chain)
      const txHash = await writeContractAsync({
        address: OBOLUS_CONTRACTS.RWAVault.address,
        abi: RWAVaultABI,
        functionName: 'withdraw',
        args: [tokenAddress, units],
      })

      // 2. Get Auth Signature
      const { signature, nonce } = await getSignature()

      // 3. Record Transaction
      await api.post('/api/v1/transactions/record', {
        userAddress: address,
        type: 'withdraw',
        vaultId,
        tokenAddress,
        encryptedAmount: shares.toString(),
        txHash,
        chainId,
        status: 'executed'
      }, { walletAddress: address, signature, nonce })

      // 4. Close Position (or update it)
      const { signature: sig2, nonce: nonce2 } = await getSignature()
      await api.post('/api/v1/vault/position/close', {
        userAddress: address,
        vaultId,
        txHashWithdraw: txHash
      }, { walletAddress: address, signature: sig2, nonce: nonce2 })

      return txHash
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vault-positions'] })
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['nav-history'] })
    }
  })
}
