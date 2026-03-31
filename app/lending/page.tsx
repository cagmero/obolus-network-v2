"use client"

import { useState } from "react"
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi"
import { parseEther, formatEther } from "viem"
import { Loader2, TrendingUp, Vault, ArrowUpRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { SWAP_TOKENS, DEFI_ADDRESSES } from "@/lib/defi-contracts"
import { ObolusLendingPoolABI } from "@/lib/defi-abis"
import { ERC20ABI } from "@/lib/abis"
import { Button } from "@/components/ui/button"
import { ConnectWalletButton } from "@/components/wallet/connect-wallet-button"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useEffect, useMemo } from "react"
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ExternalLink, CheckCircle2, X } from "lucide-react"

const stockTokens = SWAP_TOKENS.filter(t => !t.isStable)

function LendingPoolCard({ token }: { token: typeof stockTokens[0] }) {
  const { address, isConnected } = useAccount()
  const [tab, setTab] = useState<'lend' | 'borrow'>('lend')
  const [amount, setAmount] = useState("")
  const [modalOpen, setModalOpen] = useState(false)
  const [opType, setOpType] = useState<'Lending' | 'Withdrawing' | 'Borrowing' | 'Repaying' | 'Approval'>('Lending')
  const poolAddress = DEFI_ADDRESSES.LendingPools[token.symbol] as `0x${string}` | undefined
  const queryClient = useQueryClient()

  // Pool stats
  const { data: poolStats } = useReadContract({
    address: poolAddress,
    abi: ObolusLendingPoolABI,
    functionName: 'getPoolStats',
    query: { enabled: !!poolAddress },
  })

  // User lend balance
  const { data: lendBalance } = useReadContract({
    address: poolAddress,
    abi: ObolusLendingPoolABI,
    functionName: 'lenderBalances',
    args: address ? [address] : undefined,
    query: { enabled: !!poolAddress && !!address },
  })

  // User borrow position
  const { data: borrowPos } = useReadContract({
    address: poolAddress,
    abi: ObolusLendingPoolABI,
    functionName: 'getBorrowPosition',
    args: address ? [address] : undefined,
    query: { enabled: !!poolAddress && !!address },
  })

  // Token balance
  const { data: tokenBalance } = useReadContract({
    address: token.address,
    abi: ERC20ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  })

  // Token Allowance (Stock for Lend)
  const { data: stockAllowance } = useReadContract({
    address: token.address,
    abi: ERC20ABI,
    functionName: 'allowance',
    args: address && poolAddress ? [address, poolAddress] : undefined,
    query: { enabled: !!address && !!poolAddress },
  })

  // oUSD Allowance (for Borrow collateral)
  const { data: oUSDAllowance } = useReadContract({
    address: DEFI_ADDRESSES.oUSD,
    abi: ERC20ABI,
    functionName: 'allowance',
    args: address && poolAddress ? [address, poolAddress] : undefined,
    query: { enabled: !!address && !!poolAddress },
  })

  const { writeContract, data: txHash, isPending, reset } = useWriteContract()
  const { isLoading: isConfirming, isSuccess, isError, error: txError } = useWaitForTransactionReceipt({ 
    hash: txHash,
  })

  useEffect(() => {
    if (isSuccess) {
      queryClient.invalidateQueries()
      toast.success("Transaction confirmed")
      setAmount("")
      reset()
    }
    if (isError) {
      toast.error(txError?.message || "Transaction failed")
      reset()
    }
  }, [isSuccess, isError, txError, queryClient, reset])

  const stats = poolStats as any
  const zero = BigInt(0)
  const utilization = stats ? Number(stats._utilizationBps || zero) / 100 : 0
  const totalLent = stats ? parseFloat(formatEther(stats._totalLent || zero)) : 0
  const totalBorrowed = stats ? parseFloat(formatEther(stats._totalBorrowed || zero)) : 0
  const available = stats ? parseFloat(formatEther(stats._available || zero)) : 0

  const handleLend = () => {
    if (!poolAddress || !amount) return
    
    const parsedAmount = parseEther(amount)
    const allowance = (stockAllowance as bigint) || BigInt(0)
    
    setModalOpen(true)
    if (allowance < parsedAmount) {
      setOpType('Approval')
      writeContract({
        address: token.address,
        abi: ERC20ABI,
        functionName: 'approve',
        args: [poolAddress, BigInt("1000000000000000000000000000")], // ~Near infinite
      })
      return
    }

    setOpType('Lending')
    writeContract({
      address: poolAddress,
      abi: ObolusLendingPoolABI,
      functionName: 'lend',
      args: [parsedAmount],
    })
  }

  const handleWithdraw = () => {
    if (!poolAddress || !amount) return
    setModalOpen(true)
    setOpType('Withdrawing')
    writeContract({
      address: poolAddress,
      abi: ObolusLendingPoolABI,
      functionName: 'withdrawLend',
      args: [parseEther(amount)],
    })
  }

  const handleBorrow = () => {
    if (!poolAddress || !amount) return
    
    const parsedAmount = parseEther(amount)
    const collateral = (parsedAmount * BigInt(150)) / BigInt(100) // 1.5x collateral
    const allowance = (oUSDAllowance as bigint) || BigInt(0)
    
    setModalOpen(true)
    if (allowance < collateral) {
      setOpType('Approval')
      writeContract({
        address: DEFI_ADDRESSES.oUSD,
        abi: ERC20ABI,
        functionName: 'approve',
        args: [poolAddress, BigInt("1000000000000000000000000000")],
      })
      return
    }

    setOpType('Borrowing')
    writeContract({
      address: poolAddress,
      abi: ObolusLendingPoolABI,
      functionName: 'borrow',
      args: [collateral, parsedAmount],
    })
  }

  const handleRepay = () => {
    if (!poolAddress || !amount) return
    setModalOpen(true)
    setOpType('Repaying')
    writeContract({
      address: poolAddress,
      abi: ObolusLendingPoolABI,
      functionName: 'repay',
      args: [parseEther(amount)],
    })
  }

  const isLoading = isPending || isConfirming

  return (
    <div className="bg-card/20 border border-border/30 rounded-2xl overflow-hidden backdrop-blur-sm hover:border-primary/20 transition-all">
      {/* Pool Header */}
      <div className="p-5 border-b border-border/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-primary/5 border border-border/20 flex items-center justify-center text-primary font-black text-sm relative z-10 overflow-hidden bg-white/5">
                 <img 
                  src={token.symbol === 'oUSD' ? '/logo-only.png' : `/stocks/${token.symbol.replace(/x$|on$|X$/i, '')}.png`} 
                  alt={token.symbol} 
                  className="w-full h-full object-cover"
                  onError={(e) => (e.currentTarget.style.display = 'none')}
                 />
              </div>
              <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-6 rounded-full bg-primary" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">{token.symbol}</h3>
              <p className="text-[9px] text-foreground/40 uppercase tracking-widest">{token.name}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[9px] text-foreground/40 uppercase tracking-widest">Utilization</p>
            <p className={cn("text-sm font-bold font-mono", utilization > 80 ? "text-red-400" : "text-primary")}>
              {utilization.toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Mini stats */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div>
            <p className="text-[9px] text-foreground/40">Total Lent</p>
            <p className="text-xs font-bold font-mono text-foreground">{totalLent.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-[9px] text-foreground/40">Borrowed</p>
            <p className="text-xs font-bold font-mono text-foreground">{totalBorrowed.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-[9px] text-foreground/40">Available</p>
            <p className="text-xs font-bold font-mono text-green-400">{available.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border/20">
        {(['lend', 'borrow'] as const).map(t => (
          <button
            key={t}
            onClick={() => { setTab(t); setAmount("") }}
            className={cn(
              "flex-1 py-2.5 text-[10px] font-bold uppercase tracking-widest transition-all",
              tab === t ? "text-primary border-b-2 border-primary bg-primary/5" : "text-foreground/40 hover:text-foreground/60"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Action */}
      <div className="p-5 space-y-3">
        {/* User position info */}
        {isConnected && (
          <div className="text-[10px] text-foreground/40 flex justify-between">
            {tab === 'lend' ? (
              <>
                <span>Your lent: {lendBalance ? parseFloat(formatEther(lendBalance as bigint)).toFixed(4) : '0'}</span>
                <span>Wallet: {tokenBalance ? parseFloat(formatEther(tokenBalance as bigint)).toFixed(4) : '0'}</span>
              </>
            ) : (
              <>
                <span>Borrowed: {borrowPos ? parseFloat(formatEther((borrowPos as any).borrowed || zero)).toFixed(4) : '0'}</span>
                <span>Collateral: {borrowPos ? parseFloat(formatEther((borrowPos as any).collateral || zero)).toFixed(4) : '0'} oUSD</span>
              </>
            )}
          </div>
        )}

        <input
          type="text"
          inputMode="decimal"
          placeholder="0.00"
          value={amount}
          onChange={(e) => {
            const v = e.target.value.replace(/[^0-9.]/g, '')
            if (v.split('.').length <= 2) setAmount(v)
          }}
          className="w-full bg-white/5 border border-border/30 rounded-xl px-4 py-3 text-sm font-bold text-foreground placeholder:text-foreground/20 outline-none focus:border-primary/40 transition-colors"
        />

        {!isConnected ? (
          <div className="text-center text-[10px] text-foreground/40 py-2">Connect wallet</div>
        ) : !poolAddress ? (
          <div className="text-center text-[10px] text-amber-500 py-2">Pool not deployed</div>
        ) : (
          <div className="flex gap-2">
            {tab === 'lend' ? (
              <>
                <Button
                  onClick={handleLend}
                  disabled={isLoading || !amount}
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-[10px] rounded-xl"
                >
                  {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : (
                    amount && ((stockAllowance as bigint) || BigInt(0)) < parseEther(amount) ? `APPROVE ${token.symbol}` : "LEND"
                  )}
                </Button>
                <Button
                  onClick={handleWithdraw}
                  disabled={isLoading || !amount}
                  variant="outline"
                  className="flex-1 font-bold text-[10px] rounded-xl"
                >
                  WITHDRAW
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={handleBorrow}
                  disabled={isLoading || !amount}
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-[10px] rounded-xl"
                >
                  {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : (
                    amount && ((oUSDAllowance as bigint) || BigInt(0)) < (parseEther(amount) * BigInt(150) / BigInt(100)) ? "APPROVE oUSD" : "BORROW"
                  )}
                </Button>
                <Button
                  onClick={handleRepay}
                  disabled={isLoading || !amount}
                  variant="outline"
                  className="flex-1 font-bold text-[10px] rounded-xl"
                >
                  REPAY
                </Button>
              </>
            )}
          </div>
        )}
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md bg-black/90 border-border/20 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase tracking-tighter flex items-center justify-between">
              <span>{opType} Progress</span>
              {isSuccess && <CheckCircle2 className="w-5 h-5 text-primary" />}
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-6 space-y-6">
            <div className="flex flex-col items-center justify-center space-y-4 py-4">
              {!isSuccess && !isError && (
                <>
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Vault className="w-5 h-5 text-primary animate-pulse" />
                      </div>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-foreground">
                      {isPending ? "Confirm in Wallet..." : "Processing Transaction..."}
                    </p>
                    <p className="text-[10px] text-foreground/40 uppercase tracking-widest mt-1">
                      {opType === 'Approval' ? "Unlocking " + token.symbol : "Executing " + opType}
                    </p>
                  </div>
                </>
              )}

              {isSuccess && (
                <>
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                    <CheckCircle2 className="w-10 h-10 text-primary" />
                  </div>
                  <div className="text-center">
                    <h4 className="text-lg font-black text-foreground uppercase italic tracking-tight">Protocol Sync Complete</h4>
                    <p className="text-[10px] text-foreground/40 uppercase tracking-widest mt-1">
                      Assets successfully {opType === 'Lending' ? 'Lent' : opType === 'Approval' ? 'Authorized' : 'Processed'}
                    </p>
                  </div>
                  
                  <div className="w-full bg-white/5 border border-border/10 rounded-2xl p-4 space-y-3">
                    <div className="flex justify-between items-center text-[10px] text-foreground/40 font-bold uppercase">
                      <span>Transaction ID</span>
                      <span className="font-mono text-foreground/60">{txHash?.slice(0,10)}...{txHash?.slice(-8)}</span>
                    </div>
                    <a 
                      href={`https://testnet.bscscan.com/tx/${txHash}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-black font-black text-[10px] uppercase tracking-widest rounded-xl hover:opacity-90 transition-opacity"
                    >
                      View on Explorer <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  
                  <Button 
                    onClick={() => {
                      setModalOpen(false)
                      // Small delay before reset to let success state show
                      setTimeout(() => reset(), 100);
                    }} 
                    variant="outline" 
                    className="w-full border-border/20 uppercase text-[10px] font-black h-12 rounded-xl"
                  >
                    Close Window
                  </Button>
                </>
              )}

              {isError && (
                <>
                  <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
                    <X className="w-8 h-8 text-red-400" />
                  </div>
                  <p className="text-sm font-bold text-red-400">Transaction Failed</p>
                  <p className="text-[10px] text-foreground/60 text-center px-4">{txError?.message.slice(0, 100)}...</p>
                  <Button onClick={() => setModalOpen(false)} className="w-full bg-white/5 hover:bg-white/10 uppercase text-[10px] font-black">Retry</Button>
                </>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function LendingPage() {
  const { isConnected } = useAccount()

  return (
    <div className="flex flex-col gap-8 font-mono pb-20">
      <div className="flex items-center justify-between border-b border-border/20 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tighter text-foreground">LENDING // POOLS</h1>
          <p className="text-[10px] text-foreground/40 uppercase tracking-[0.2em] mt-1">
            Lend stock tokens to earn yield — Borrow with oUSD collateral
          </p>
        </div>
        {!isConnected && <ConnectWalletButton />}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {stockTokens.map(token => (
          <LendingPoolCard key={token.symbol} token={token} />
        ))}
      </div>
    </div>
  )
}
