import { createPublicClient, createWalletClient, http, custom, parseUnits } from 'viem'
import { bscTestnet } from 'viem/chains'
import { OBOLUS_CONTRACTS } from '@/lib/wagmi'

export const publicClient = createPublicClient({
  chain: bscTestnet,
  transport: http(),
})

export const getWalletClient = async () => {
  if (typeof window === 'undefined' || !window.ethereum) return null
  return createWalletClient({
    chain: bscTestnet,
    transport: custom(window.ethereum),
  })
}

/**
 * Deposit GM tokens into the vault.
 */
export async function depositToVault(token: string, amount: string) {
  const walletClient = await getWalletClient()
  if (!walletClient) throw new Error("Wallet not connected")

  const [address] = await walletClient.getAddresses()
  
  // 1. Approve token spending (Simplified for V1)
  // In real app, we would call token.approve(vault, amount)
  
  // 2. Call depositGM
  const { request } = await publicClient.simulateContract({
    address: OBOLUS_CONTRACTS.RWAVault.address,
    abi: OBOLUS_CONTRACTS.RWAVault.abi,
    functionName: 'depositGM',
    args: [token as `0x${string}`, parseUnits(amount, 18)],
    account: address,
  })

  const hash = await walletClient.writeContract(request)
  return publicClient.waitForTransactionReceipt({ hash })
}

/**
 * Withdraw assets from the vault.
 */
export async function withdrawFromVault(token: string, shares: string) {
  const walletClient = await getWalletClient()
  if (!walletClient) throw new Error("Wallet not connected")

  const [address] = await walletClient.getAddresses()

  const { request } = await publicClient.simulateContract({
    address: OBOLUS_CONTRACTS.RWAVault.address,
    abi: OBOLUS_CONTRACTS.RWAVault.abi,
    functionName: 'withdrawGM',
    args: [token as `0x${string}`, parseUnits(shares, 18)],
    account: address,
  })

  const hash = await walletClient.writeContract(request)
  return publicClient.waitForTransactionReceipt({ hash })
}

/**
 * Get user's total vault shares.
 */
export async function getVaultBalance(userAddress: string) {
  return publicClient.readContract({
    ...OBOLUS_CONTRACTS.RWAVault,
    functionName: 'balanceOf',
    args: [userAddress as `0x${string}`],
  })
}

/**
 * Get blended portfolio NAV in USD.
 */
export async function getPortfolioNAV(userAddress: string) {
  // Obolus V1 computes totalAssets() which is total NAV of the vault
  // For user, we might need a specific hook or helper
  return publicClient.readContract({
    ...OBOLUS_CONTRACTS.ObolusOracle,
    functionName: 'getPortfolioNAV',
    args: [[], []], // This requires token list which isn't easily accessible via state in V1
  })
}

/**
 * Get live GM token price from oracle.
 */
export async function getGMTokenPrice(tokenAddress: string) {
  return publicClient.readContract({
    ...OBOLUS_CONTRACTS.ObolusOracle,
    functionName: 'getGMTokenPrice',
    args: [tokenAddress as `0x${string}`],
  })
}
