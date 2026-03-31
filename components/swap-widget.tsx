"use client"

import { useState, useEffect, useCallback } from "react"
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi"
import { parseEther, formatEther, formatUnits } from "viem"
import { ArrowDownUp, ChevronDown, Loader2, AlertCircle, Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import { SWAP_TOKENS, DEFI_ADDRESSES, type SwapToken } from "@/lib/defi-contracts"
import { ObolusAMMABI, oUSDABI } from "@/lib/defi-abis"
import { ERC20ABI } from "@/lib/abis"

import { toast } from "sonner"

interface TokenSelectorProps {
  token: SwapToken
  onSelect: (token: SwapToken) => void
  tokens: SwapToken[]
  label: string
}

function TokenSelector({ token, onSelect, tokens, label }: TokenSelectorProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:border-primary/40 hover:bg-primary/5 transition-all group min-w-[110px] justify-between"
      >
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-black text-primary overflow-hidden shadow-inner">
            {token.logo ? (
              <img src={token.logo} alt={token.symbol} className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
            ) : null}
            <span className="absolute">{token.symbol[0]}</span>
          </div>
          <span className="text-xs font-bold text-foreground tracking-tight">{token.symbol}</span>
        </div>
        <ChevronDown className="w-3 h-3 text-foreground/40 group-hover:text-primary transition-colors" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 z-50 w-60 bg-[#0d0d0d]/90 border border-white/10 rounded-2xl shadow-2xl shadow-black/80 overflow-hidden backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="p-3 border-b border-white/5 bg-white/5">
              <p className="text-[9px] font-black text-foreground/40 uppercase tracking-[0.2em]">{label}</p>
            </div>
            <div className="max-h-80 overflow-y-auto p-1.5 space-y-1">
              {tokens.map((t) => (
                <button
                  key={t.symbol}
                  onClick={() => { onSelect(t); setOpen(false) }}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all text-left group",
                    t.symbol === token.symbol
                      ? "bg-primary/10 border border-primary/20"
                      : "hover:bg-white/5 border border-transparent"
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-black relative overflow-hidden",
                    t.isStable ? "bg-green-500/20 text-green-400" : "bg-primary/20 text-primary"
                  )}>
                    {t.logo ? <img src={t.logo} alt="" className="absolute inset-0 w-full h-full object-cover opacity-80" /> : null}
                    <span className="relative z-10">{t.symbol[0]}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-white group-hover:text-primary transition-colors">{t.symbol}</span>
                    <span className="text-[9px] text-foreground/40 font-medium">{t.name}</span>
                  </div>
                  {t.symbol === token.symbol && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export function SwapWidget() {
  const { address, isConnected } = useAccount()
  const [tokenIn, setTokenIn] = useState<SwapToken>(SWAP_TOKENS.find(t => t.isStable) || SWAP_TOKENS[0])
  const [tokenOut, setTokenOut] = useState<SwapToken>(SWAP_TOKENS.find(t => !t.isStable) || SWAP_TOKENS[1])
  const [amountIn, setAmountIn] = useState("")
  const [slippage, setSlippage] = useState(0.5)
  const [showSettings, setShowSettings] = useState(false)

  const ammAddress = DEFI_ADDRESSES.ObolusAMM

  // Determine swap direction
  const isStableToStock = tokenIn.isStable
  const stockToken = isStableToStock ? tokenOut : tokenIn

  // Get quote from AMM
  const { data: quoteData, isLoading: isQuoteLoading } = useReadContract({
    address: ammAddress,
    abi: ObolusAMMABI,
    functionName: 'getAmountOut',
    args: amountIn && parseFloat(amountIn) > 0
      ? [stockToken.address, parseEther(amountIn), !isStableToStock]
      : undefined,
    query: {
      enabled: !!amountIn && parseFloat(amountIn) > 0 && !!ammAddress,
      refetchInterval: 15000, 
    }
  })

  const amountOut = quoteData ? formatEther(quoteData as bigint) : "0"

  // Get pool info
  const { data: poolInfo } = useReadContract({
    address: ammAddress,
    abi: ObolusAMMABI,
    functionName: 'getPoolInfo',
    args: [stockToken.address],
    query: { enabled: !!ammAddress },
  })

  // Token balances
  const { data: balanceIn } = useReadContract({
    address: tokenIn.address,
    abi: ERC20ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  })

  const { data: balanceOut } = useReadContract({
    address: tokenOut.address,
    abi: ERC20ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  })

  // Check allowance
  const { data: allowance } = useReadContract({
    address: tokenIn.address,
    abi: ERC20ABI,
    functionName: 'allowance',
    args: address && ammAddress ? [address, ammAddress] : undefined,
    query: { enabled: !!address && !!ammAddress },
  })

  const needsApproval = amountIn && parseFloat(amountIn) > 0 && allowance !== undefined
    ? (allowance as bigint) < parseEther(amountIn)
    : false

  // Write contracts
  const { writeContract: approve, data: approveTxHash, isPending: isApproving } = useWriteContract()
  const { writeContract: swap, data: swapTxHash, isPending: isSwapping } = useWriteContract()

  const { isLoading: isApproveConfirming } = useWaitForTransactionReceipt({ hash: approveTxHash })
  const { isLoading: isSwapConfirming, isSuccess: swapSuccess } = useWaitForTransactionReceipt({ hash: swapTxHash })

  // Flip tokens
  const handleFlip = useCallback(() => {
    setTokenIn(tokenOut)
    setTokenOut(tokenIn)
    setAmountIn("")
  }, [tokenIn, tokenOut])

  // Handle approve
  const handleApprove = () => {
    if (!ammAddress) return
    approve({
      address: tokenIn.address,
      abi: ERC20ABI,
      functionName: 'approve',
      args: [ammAddress, parseEther("1000000000")],
    }, {
      onSuccess: () => toast.success(`Approval for ${tokenIn.symbol} submitted`),
      onError: (err) => toast.error(`Approval failed: ${err.message.slice(0, 50)}...`),
    })
  }

  // Handle swap
  const handleSwap = () => {
    if (!ammAddress || !amountIn) return
    const fn = isStableToStock ? 'swapStableForStock' : 'swapStockForStable'
    swap({
      address: ammAddress,
      abi: ObolusAMMABI,
      functionName: fn,
      args: [stockToken.address, parseEther(amountIn)],
    }, {
      onSuccess: () => toast.success(`Swap for ${tokenOut.symbol} submitted`),
      onError: (err) => toast.error(`Swap failed: ${err.message.slice(0, 50)}...`),
    })
  }

  // Reset on success
  useEffect(() => {
    if (swapSuccess) {
      toast.success(`Successfully swapped for ${tokenOut.symbol}!`)
      setAmountIn("")
    }
  }, [swapSuccess, tokenOut.symbol])

  // Price impact
  const priceImpact = amountIn && parseFloat(amountIn) > 0 && parseFloat(amountOut) > 0
    ? Math.abs((parseFloat(amountOut) / parseFloat(amountIn) - 1) * 100)
    : 0

  const isLoading = isApproving || isApproveConfirming || isSwapping || isSwapConfirming
  const hasValidInput = amountIn && parseFloat(amountIn) > 0 && !isNaN(parseFloat(amountIn))
  const insufficientBalance = balanceIn !== undefined && hasValidInput && parseEther(amountIn) > (balanceIn as bigint)

  const handleSelectTokenIn = (t: SwapToken) => {
    if (t.symbol === tokenOut.symbol) {
      handleFlip()
    } else {
      setTokenIn(t)
      if (t.isStable === tokenOut.isStable) {
        setTokenOut(t.isStable ? SWAP_TOKENS.find(x => !x.isStable) || SWAP_TOKENS[1] : SWAP_TOKENS[0])
      }
    }
  }

  const handleSelectTokenOut = (t: SwapToken) => {
    if (t.symbol === tokenIn.symbol) {
      handleFlip()
    } else {
      setTokenOut(t)
      if (t.isStable === tokenIn.isStable) {
        setTokenIn(t.isStable ? SWAP_TOKENS.find(x => !x.isStable) || SWAP_TOKENS[1] : SWAP_TOKENS[0])
      }
    }
  }

  const setMaxAmount = () => {
    if (balanceIn) {
      setAmountIn(formatEther(balanceIn as bigint))
    }
  }

  return (
    <div className="w-full max-w-[480px] mx-auto group/terminal">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
            TERMINAL // SWAP
            {isQuoteLoading && <Loader2 className="w-3 h-3 animate-spin text-primary" />}
          </h2>
          <p className="text-[10px] text-foreground/40 uppercase tracking-[0.2em] mt-0.5">
            Automated Confidential Settlement
          </p>
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-all text-foreground/40 hover:text-primary"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {/* Settings section */}
      {showSettings && (
        <div className="mb-4 p-4 rounded-2xl bg-card/40 border border-border/30 backdrop-blur-md animate-in slide-in-from-top-2 duration-300">
          <p className="text-[9px] font-black text-foreground/40 uppercase tracking-widest mb-3">Slippage Tolerance</p>
          <div className="flex gap-2">
            {[0.1, 0.5, 1.0, 3.0].map(s => (
              <button
                key={s}
                onClick={() => setSlippage(s)}
                className={cn(
                  "flex-1 py-2 rounded-xl text-[10px] font-black transition-all border",
                  slippage === s
                    ? "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20"
                    : "bg-white/5 border-white/5 text-foreground/40 hover:text-foreground/60 hover:bg-white/10"
                )}
              >
                {s}%
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Swap Card */}
      <div className="rounded-[2.5rem] border border-border/40 bg-card/30 backdrop-blur-2xl shadow-2xl shadow-black/40 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
        
        {/* Input Section */}
        <div className="p-6 pb-2 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.15em]">SOURCE // PAY</span>
            <div className="flex items-center gap-3">
              {balanceIn !== undefined && (
                <button
                  onClick={setMaxAmount}
                  className="text-[10px] font-black text-primary/60 hover:text-primary bg-primary/5 hover:bg-primary/10 px-2 py-0.5 rounded-md transition-all border border-primary/10"
                >
                  MAX: {parseFloat(formatEther(balanceIn as bigint)).toLocaleString(undefined, { maximumFractionDigits: 4 })}
                </button>
              )}
            </div>
          </div>
          
          <div className="flex items-center justify-between gap-3 bg-white/5 p-4 py-3 rounded-2xl border border-white/5 focus-within:border-primary/30 transition-all group/input">
            <div className="flex-1 flex flex-col pt-1">
              <input
                type="text"
                inputMode="decimal"
                placeholder="0.00"
                value={amountIn}
                onChange={(e) => {
                  const v = e.target.value.replace(/[^0-9.]/g, '')
                  if (v.split('.').length <= 2) setAmountIn(v)
                }}
                className="w-full bg-transparent text-4xl font-mono font-bold text-foreground placeholder:text-foreground/10 outline-none tracking-tighter"
              />
            </div>
            <div className="flex-shrink-0">
              <TokenSelector
                token={tokenIn}
                onSelect={handleSelectTokenIn}
                tokens={SWAP_TOKENS}
                label="Select token to pay"
              />
            </div>
          </div>
        </div>

        {/* Action Toggle */}
        <div className="relative h-2 flex items-center justify-center">
          <div className="absolute inset-x-8 h-px bg-white/5" />
          <button
            onClick={handleFlip}
            className="w-10 h-10 rounded-2xl bg-[#111] border border-white/10 hover:border-primary/50 flex items-center justify-center transition-all group/flip hover:shadow-lg hover:shadow-primary/10 relative z-10"
          >
            <ArrowDownUp className="w-4 h-4 text-foreground/40 group-hover/flip:text-primary transition-transform group-active/flip:scale-90" />
          </button>
        </div>

        {/* Output Section */}
        <div className="p-6 pt-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.15em]">DESTINATION // RECEIVE</span>
            {balanceOut !== undefined && (
              <span className="text-[10px] text-foreground/20 font-bold">
                BAL: {parseFloat(formatEther(balanceOut as bigint)).toLocaleString(undefined, { maximumFractionDigits: 4 })}
              </span>
            )}
          </div>
          
          <div className="flex items-center justify-between gap-3 bg-white/5 p-4 py-3 rounded-2xl border border-white/5 focus-within:border-primary/30 transition-all group/input">
            <div className="flex-1 flex flex-col pt-1">
              <div className={cn(
                "w-full bg-transparent text-4xl font-mono font-bold tracking-tighter transition-all",
                hasValidInput && parseFloat(amountOut) > 0 ? "text-foreground" : "text-foreground/10"
              )}>
                {hasValidInput && parseFloat(amountOut) > 0
                  ? parseFloat(amountOut).toLocaleString(undefined, { maximumFractionDigits: 6 })
                  : "0.00"
                }
              </div>
            </div>
            <div className="flex-shrink-0">
              <TokenSelector
                token={tokenOut}
                onSelect={handleSelectTokenOut}
                tokens={SWAP_TOKENS}
                label="Select token to receive"
              />
            </div>
          </div>
        </div>

        {/* Details Panel */}
        <div className="px-6 mb-2">
          {hasValidInput && parseFloat(amountOut) > 0 ? (
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center justify-between text-[10px] font-bold">
                <span className="text-foreground/30 uppercase tracking-widest">Rate</span>
                <span className="text-foreground/80 font-mono">
                  1 {tokenIn.symbol} ≈ {(parseFloat(amountOut) / parseFloat(amountIn)).toFixed(6)} {tokenOut.symbol}
                </span>
              </div>
              <div className="flex items-center justify-between text-[10px] font-bold">
                <div className="flex items-center gap-1">
                  <span className="text-foreground/30 uppercase tracking-widest">Price Impact</span>
                </div>
                <span className={cn(
                  "font-mono",
                  priceImpact > 5 ? "text-red-400" : priceImpact > 2 ? "text-amber-400" : "text-green-400"
                )}>
                  {priceImpact < 0.01 ? "< 0.01%" : `${priceImpact.toFixed(2)}%`}
                </span>
              </div>
            </div>
          ) : (
            <div className="h-[52px] rounded-2xl border border-dashed border-white/5 flex items-center justify-center opacity-20">
              <span className="text-[9px] font-black uppercase tracking-[0.3em]">Waiting for input...</span>
            </div>
          )}
        </div>

        {/* Main Action */}
        <div className="p-6">
          {!isConnected ? (
            <div className="w-full py-4 rounded-2xl bg-white/5 text-center text-[10px] font-black text-foreground/20 uppercase tracking-[0.2em] border border-white/5">
              CONNECTION_REQUIRED
            </div>
          ) : !ammAddress ? (
            <div className="w-full py-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center text-xs font-black text-amber-500 flex items-center justify-center gap-2 uppercase tracking-widest">
              <AlertCircle className="w-4 h-4" />
              AMM_NOT_DEPLOYED
            </div>
          ) : insufficientBalance ? (
            <button
              disabled
              className="w-full py-5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 font-black text-[10px] uppercase tracking-[0.3em] cursor-not-allowed"
            >
              INSUFFICIENT_FUNDS
            </button>
          ) : needsApproval ? (
            <button
              onClick={handleApprove}
              disabled={isLoading}
              className="w-full py-5 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-black text-[10px] uppercase tracking-[0.3em] transition-all shadow-xl shadow-primary/20 hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed group/btn"
            >
              {isApproving || isApproveConfirming ? (
                <span className="flex items-center justify-center gap-3">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  AUTHORIZING...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  APPROVE_{tokenIn.symbol === 'oUSD' ? 'STABLE' : 'STOCK'}
                </span>
              )}
            </button>
          ) : (
            <button
              onClick={handleSwap}
              disabled={isLoading || !hasValidInput || parseFloat(amountOut) === 0}
              className={cn(
                "w-full py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] transition-all relative overflow-hidden group/swap shadow-2xl",
                hasValidInput && parseFloat(amountOut) > 0
                  ? "bg-primary text-black hover:scale-[1.01] active:scale-[0.98] shadow-primary/30"
                  : "bg-white/5 text-white/10 cursor-not-allowed border border-white/5"
              )}
            >
              {isSwapping || isSwapConfirming ? (
                <span className="flex items-center justify-center gap-3">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  EXECUTING_SWAP...
                </span>
              ) : !hasValidInput ? (
                "ENTER_AMOUNT"
              ) : parseFloat(amountOut) === 0 ? (
                "NO_LIQUIDITY"
              ) : (
                <div className="flex items-center justify-center gap-2">
                  EXECUTE_SWAP
                </div>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Pool Monitor */}
      {poolInfo && (poolInfo as any).active && (
        <div className="mt-6 p-5 rounded-3xl bg-white/[0.02] border border-white/10 backdrop-blur-sm group-hover/terminal:border-primary/20 transition-all">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.2em]">
              Pool Monitor // {stockToken.symbol}
            </h3>
            <div className="flex gap-1">
              <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[8px] font-black text-green-500 uppercase tracking-tighter">Live</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1">
              <p className="text-[9px] font-bold text-foreground/20 uppercase">Reserve_{stockToken.symbol}</p>
              <p className="text-sm font-bold text-foreground font-mono">
                {parseFloat(formatEther((poolInfo as any).reserveStock || BigInt(0))).toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="space-y-1 border-l border-white/5 pl-6">
              <p className="text-[9px] font-bold text-foreground/20 uppercase">Reserve_oUSD</p>
              <p className="text-sm font-bold text-foreground font-mono">
                {parseFloat(formatEther((poolInfo as any).reserveStable || BigInt(0))).toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
