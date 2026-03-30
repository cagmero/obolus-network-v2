import { useWriteContract, usePublicClient } from 'wagmi'
import { parseEther } from 'viem'
import { CONTRACT_ADDRESSES } from '@/lib/wagmi'
import { RWAVaultABI, ERC20ABI, MockERC20ABI } from '@/lib/abis'
import { useState } from 'react'
import { api } from '@/lib/api'
import { useAccount } from 'wagmi'
import { useQueryClient } from '@tanstack/react-query'
import { encryptAmount } from '@/lib/encryption'

export type TxStep =
  | 'idle'
  | 'approving'
  | 'approve_confirmed'
  | 'depositing'
  | 'deposit_confirmed'
  | 'recording'
  | 'complete'
  | 'error'

export function useDepositFlow() {
  const { address } = useAccount()
  const queryClient = useQueryClient()
  const { writeContractAsync } = useWriteContract()
  const publicClient = usePublicClient()
  const [step, setStep] = useState<TxStep>('idle')
  const [txHash, setTxHash] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [approveTxHash, setApproveTxHash] = useState<string>('')

  const deposit = async ({
    tokenSymbol,
    tokenAddress,
    amount,
  }: {
    tokenSymbol: string
    tokenAddress: string
    amount: string
  }) => {
    setError('')
    const parsedAmount = parseEther(amount)

    try {
      // Step 1: Approve
      setStep('approving')
      console.log('[OBOLUS:DEPOSIT_FLOW] Step 1: Approving token spend', {
        token: tokenAddress,
        spender: CONTRACT_ADDRESSES.RWAVault,
        amount,
      })
      const approveTx = await writeContractAsync({
        address: tokenAddress as `0x${string}`,
        abi: MockERC20ABI,
        functionName: 'approve',
        args: [CONTRACT_ADDRESSES.RWAVault as `0x${string}`, parsedAmount],
      })
      setApproveTxHash(approveTx)
      console.log('[OBOLUS:DEPOSIT_FLOW] Approve tx submitted:', approveTx)

      await publicClient?.waitForTransactionReceipt({ hash: approveTx })
      setStep('approve_confirmed')
      console.log('[OBOLUS:DEPOSIT_FLOW] Approve confirmed')

      // Step 2: Deposit
      setStep('depositing')
      console.log('[OBOLUS:DEPOSIT_FLOW] Step 2: Depositing to vault', {
        vault: CONTRACT_ADDRESSES.RWAVault,
        token: tokenAddress,
        amount,
      })
      const depositTx = await writeContractAsync({
        address: CONTRACT_ADDRESSES.RWAVault as `0x${string}`,
        abi: RWAVaultABI,
        functionName: 'deposit',
        args: [tokenAddress as `0x${string}`, parsedAmount, address as `0x${string}`],
      })
      setTxHash(depositTx)
      console.log('[OBOLUS:DEPOSIT_FLOW] Deposit tx submitted:', depositTx)
      
      await publicClient?.waitForTransactionReceipt({ hash: depositTx })
      setStep('deposit_confirmed')

      // Encrypt the amount for CRE before recording
      let encryptedAmt = 'encrypted';
      try {
        encryptedAmt = await encryptAmount(amount);
      } catch {
        // Fallback if encryption fails (e.g. CRE key not available)
      }

      await api.post('/transactions/record', {
        userAddress: address,
        type: 'deposit',
        vaultId: tokenSymbol.toLowerCase(),
        tokenAddress,
        encryptedAmount: encryptedAmt,
        txHash: depositTx,
        chainId: 97,
        status: 'executed',
      });
      await api.post('/vault/position/upsert', {
        userAddress: address,
        vaultId: tokenSymbol.toLowerCase(),
        tokenAddress,
        encryptedBalance: encryptedAmt,
        txHashDeposit: depositTx,
        chainId: 97,
        status: 'active',
      });
      console.log('[OBOLUS:DEPOSIT_FLOW] Server record complete')

      setStep('complete')
      queryClient.invalidateQueries({ queryKey: ['readContracts'] }) // Invalidate batch reads
      queryClient.invalidateQueries({ queryKey: ['readContract'] })

      return { approveTxHash: approveTx, depositTxHash: depositTx }

    } catch (e: any) {
      console.error('[OBOLUS:DEPOSIT_FLOW:ERROR]', {
        step,
        error: e.message,
        code: e.code,
        tokenSymbol,
        amount,
      })
      setError(e.message || 'Transaction failed')
      setStep('error')
      throw e
    }
  }

  const reset = () => {
    setStep('idle')
    setTxHash('')
    setError('')
    setApproveTxHash('')
  }

  return { deposit, step, txHash, approveTxHash, error, reset }
}

export function useWithdrawFlow() {
  const { address } = useAccount()
  const queryClient = useQueryClient()
  const { writeContractAsync } = useWriteContract()
  const publicClient = usePublicClient()
  const [step, setStep] = useState<TxStep>('idle')
  const [txHash, setTxHash] = useState<string>('')
  const [error, setError] = useState<string>('')

  const withdraw = async ({
    tokenSymbol,
    tokenAddress,
    shares,
  }: {
    tokenSymbol: string
    tokenAddress: string
    shares: string
  }) => {
    setError('')

    try {
      setStep('depositing') // reuse step name for simplicity
      console.log('[OBOLUS:WITHDRAW_FLOW] Withdrawing from vault', {
        token: tokenAddress,
        shares,
      })
      const withdrawTx = await writeContractAsync({
        address: CONTRACT_ADDRESSES.RWAVault as `0x${string}`,
        abi: RWAVaultABI,
        functionName: 'withdraw',
        args: [tokenAddress as `0x${string}`, parseEther(shares)],
      })
      setTxHash(withdrawTx)
      console.log('[OBOLUS:WITHDRAW_FLOW] Withdraw tx:', withdrawTx)

      await publicClient?.waitForTransactionReceipt({ hash: withdrawTx })

      let encryptedWithdrawAmt = 'encrypted';
      try {
        encryptedWithdrawAmt = await encryptAmount(shares);
      } catch {
        // Fallback
      }

      await api.post('/transactions/record', {
        userAddress: address,
        type: 'withdraw',
        vaultId: tokenSymbol.toLowerCase(),
        tokenAddress,
        encryptedAmount: encryptedWithdrawAmt,
        txHash: withdrawTx,
        chainId: 97,
        status: 'executed',
      });
      await api.post('/vault/position/close', {
        userAddress: address,
        vaultId: tokenSymbol.toLowerCase(),
      });

      setStep('complete')
      queryClient.invalidateQueries({ queryKey: ['readContracts'] })
      queryClient.invalidateQueries({ queryKey: ['readContract'] })

      return withdrawTx

    } catch (e: any) {
      console.error('[OBOLUS:WITHDRAW_FLOW:ERROR]', { error: e.message, tokenSymbol })
      setError(e.message || 'Withdraw failed')
      setStep('error')
      throw e
    }
  }

  const reset = () => {
    setStep('idle')
    setTxHash('')
    setError('')
  }

  return { withdraw, step, txHash, error, reset }
}

export function useMintFaucet() {
  const { address } = useAccount()
  const queryClient = useQueryClient()
  const { writeContractAsync } = useWriteContract()
  const [mintingSymbol, setMintingSymbol] = useState<string>('')
  const [lastTxHash, setLastTxHash] = useState<string>('')
  const [error, setError] = useState<string>('')

  const mint = async (tokenSymbol: string, tokenAddress: string) => {
    setError('')
    setMintingSymbol(tokenSymbol)
    const FAUCET_AMOUNT = parseEther('1000')

    try {
      console.log('[OBOLUS:FAUCET] Minting 1000', tokenSymbol, 'to', address)
      const mintTx = await writeContractAsync({
        address: tokenAddress as `0x${string}`,
        abi: MockERC20ABI,
        functionName: 'mint',
        args: [address as `0x${string}`, FAUCET_AMOUNT],
      })
      setLastTxHash(mintTx)
      console.log('[OBOLUS:FAUCET] Mint tx submitted:', mintTx)
      console.log('[OBOLUS:FAUCET] BSCScan:', `https://testnet.bscscan.com/tx/${mintTx}`)

      queryClient.invalidateQueries({ queryKey: ['readContract', tokenAddress] })
      queryClient.invalidateQueries({ queryKey: ['readContracts'] })

      return mintTx
    } catch (e: any) {
      console.error('[OBOLUS:FAUCET:ERROR]', { tokenSymbol, error: e.message })
      setError(e.message)
      throw e
    } finally {
      setMintingSymbol('')
    }
  }

  const mintAll = async () => {
    console.log('[OBOLUS:FAUCET] Minting all 9 tokens...')
    const entries = Object.entries(CONTRACT_ADDRESSES)
      .filter(([key]) => !['RWAVault', 'ObolusOracle'].includes(key))

    for (const [symbol, addr] of entries) {
      try {
        await mint(symbol, addr as string)
        // Small delay between mints to avoid nonce issues if submitting quickly
        await new Promise(r => setTimeout(r, 2000))
      } catch (e: any) {
        console.error(`[OBOLUS:FAUCET:ERROR] Failed to mint ${symbol}:`, e.message)
      }
    }
  }

  return { mint, mintAll, mintingSymbol, lastTxHash, error }
}
