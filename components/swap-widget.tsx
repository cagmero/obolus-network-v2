"use client"

import { useState, useEffect, useCallback } from "react"
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi"
import { parseEther, formatEther, formatUnits } from "viem"
import { ArrowDownUp, ChevronDown, Loader2, AlertCircle, Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import { SWAP_TOKENS, DEFI_ADDRESSES, type SwapToken } from "@/lib/defi-contracts"
import { ObolusAMMABI, oUSDABI } from "@/lib/defi-abis"
import { ERC20ABI } from "@/lib/abis"

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
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-primary/40 transition-all group"
      >
        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[9px] font-black text-primary">
          {token.symbol[0]}
        </div>
        <span className="text-sm font-bold text-foreground">{token.symbol}</span>
        <ChevronDown className="w-3.5 h-3.5 text-foreground/40 group-hover:text-primary transition-colors" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 z-50 w-56 bg-card border border-border/40 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden backdrop-blur-xl">
            <div className="p-2 border-b border-border/20">
              <p className="text-[9px] font-bold text-foreground/40 uppercase tracking-widest px-2 py-1">{label}</p>
            </div>
            <div className="max-h-64 overflow-y-auto p-1">
              {tokens.map((t) => (
                <button
                  key={t.symbol}
                  onClick={() => { onSelect(t); setOpen(false) }}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left",
                    t.symbol === token.symbol
                      ? "bg-primary/10 border border-primary/20"
                      : "hover:bg-white/5"
                  )}
                >
                  <div className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black",
                    t.isStable ? "bg-green-500/20 text-green-400" : "bg-primary/20 text-primary"
                  )}>
                    {t.isStable ? "$" : t.symbol[0]}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-foreground">{t.symbol}</span>
                    <span className="text-[9px] text-foreground/40">{t.name}</span>
                  </div>
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
  const { data: quoteData } = useReadContract({
    address: ammAddress,
    abi: ObolusAMMABI,
    functionName: 'getAmountOut',
    args: amountIn && parseFloat(amountIn) > 0
      ? [stockToken.address, parseEther(amountIn), !isStableToStock]
      : undefined,
    query: {
      enabled: !!amountIn && parseFloat(amountIn) > 0 && !!ammAddress,
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
      args: [ammAddress, parseEther("999999999")],
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
    })
  }

  // Reset on success
  useEffect(() => {
    if (swapSuccess) setAmountIn("")
  }, [swapSuccess])

  // Price impact
  const priceImpact = amountIn && parseFloat(amountIn) > 0 && parseFloat(amountOut) > 0
    ? Math.abs((parseFloat(amountOut) / parseFloat(amountIn) - 1) * 100)
    : 0

  const isLoading = isApproving || isApproveConfirming || isSwapping || isSwapConfirming
  const hasValidInput = amountIn && parseFloat(amountIn) > 0

  // Ensure tokenIn and tokenOut are different types (one stable, one stock)
  const handleSelectTokenIn = (t: SwapToken) => {
    if (t.symbol === tokenOut.symbol) {
      handleFlip()
    } else {
      setTokenIn(t)
      // If both are same type, flip the other
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

  return (
    <div className="w-full max-w-[480px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-foreground">Swap</h2>
          <p className="text-[10px] text-foreground/40 uppercase tracking-widest mt-0.5">
            Trade tokenized stocks and stablecoins on-chain
          </p>
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 rounded-xl hover:bg-white/5 transition-colors"
        >
          <Settings className="w-4 h-4 text-foreground/40" />
        </button>
      </div>

      {/* Settings dropdown */}
      {showSettings && (
        <div className="mb-4 p-4 rounded-2xl bg-card/30 border border-border/30 backdrop-blur-sm">
          <p className="text-[9px] font-bold text-foreground/40 uppercase tracking-widest mb-2">Slippage Tolerance</p>
          <div className="flex gap-2">
            {[0.1, 0.5, 1.0].map(s => (
              <button
                key={s}
                onClick={() => setSlippage(s)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                  slippage === s
                    ? "bg-primary text-primary-foreground"
                    : "bg-white/5 text-foreground/60 hover:bg-white/10"
                )}
              >
                {s}%
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Swap Card */}
      <div className="rounded-3xl border border-border/30 bg-card/20 backdrop-blur-xl overflow-hidden">
        {/* You Pay */}
        <div className="p-5 pb-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">You pay</span>
            {balanceIn !== undefined && (
              <button
                onClick={() => setAmountIn(formatEther(balanceIn as bigint))}
                className="text-[10px] text-foreground/40 hover:text-primary transition-colors"
              >
                Balance: {parseFloat(formatEther(balanceIn as bigint)).toFixed(4)}
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <input
              type="text"
              inputMode="decimal"
              placeholder="0.00"
              value={amountIn}
              onChange={(e) => {
                const v = e.target.value.replace(/[^0-9.]/g, '')
                if (v.split('.').length <= 2) setAmountIn(v)
              }}
              className="flex-1 bg-transparent text-3xl font-bold text-foreground placeholder:text-foreground/20 outline-none tracking-tight"
            />
            <TokenSelector
              token={tokenIn}
              onSelect={handleSelectTokenIn}
              tokens={SWAP_TOKENS}
              label="Select token to pay"
            />
          </div>
        </div>

        {/* Flip Button */}
        <div className="relative flex items-center justify-center py-1">
          <div className="absolute inset-x-5 h-px bg-border/20" />
          <button
            onClick={handleFlip}
            className="relative z-10 p-2 rounded-xl bg-card border border-border/30 hover:border-primary/40 hover:bg-primary/5 transition-all group"
            aria-label="Flip swap direction"
          >
            <ArrowDownUp className="w-4 h-4 text-foreground/40 group-hover:text-primary transition-colors" />
          </button>
        </div>

        {/* You Receive */}
        <div className="p-5 pt-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">You receive</span>
            {balanceOut !== undefined && (
              <span className="text-[10px] text-foreground/40">
                Balance: {parseFloat(formatEther(balanceOut as bigint)).toFixed(4)}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 text-3xl font-bold text-foreground/60 tracking-tight">
              {hasValidInput && parseFloat(amountOut) > 0
                ? parseFloat(amountOut).toFixed(6)
                : "0.00"
              }
            </div>
            <TokenSelector
              token={tokenOut}
              onSelect={handleSelectTokenOut}
              tokens={SWAP_TOKENS}
              label="Select token to receive"
            />
          </div>
        </div>

        {/* Price Info */}
        {hasValidInput && parseFloat(amountOut) > 0 && (
          <div className="mx-5 mb-4 p-3 rounded-xl bg-white/[0.02] border border-border/10">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-foreground/40">Rate</span>
              <span className="text-foreground/60 font-mono">
                1 {tokenIn.symbol} = {(parseFloat(amountOut) / parseFloat(amountIn)).toFixed(6)} {tokenOut.symbol}
              </span>
            </div>
            <div className="flex items-center justify-between text-[10px] mt-1.5">
              <span className="text-foreground/40">Fee</span>
              <span className="text-foreground/60 font-mono">0.3%</span>
            </div>
            <div className="flex items-center justify-between text-[10px] mt-1.5">
              <span className="text-foreground/40">Network</span>
              <span className="text-foreground/60 font-mono flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-yellow-500" />
                BSC Testnet
              </span>
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="p-5 pt-2">
          {!isConnected ? (
            <div className="w-full py-4 rounded-2xl bg-white/5 text-center text-sm font-bold text-foreground/40">
              Connect wallet to swap
            </div>
          ) : !ammAddress ? (
            <div className="w-full py-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center text-sm font-bold text-amber-500 flex items-center justify-center gap-2">
              <AlertCircle className="w-4 h-4" />
              AMM not deployed yet
            </div>
          ) : needsApproval ? (
            <button
              onClick={handleApprove}
              disabled={isLoading}
              className="w-full py-4 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isApproving || isApproveConfirming ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Approving {tokenIn.symbol}...
                </span>
              ) : (
                `Approve ${tokenIn.symbol}`
              )}
            </button>
          ) : (
            <button
              onClick={handleSwap}
              disabled={isLoading || !hasValidInput}
              className={cn(
                "w-full py-4 rounded-2xl font-bold text-sm transition-all",
                hasValidInput
                  ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                  : "bg-white/5 text-foreground/30 cursor-not-allowed"
              )}
            >
              {isSwapping || isSwapConfirming ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Swapping...
                </span>
              ) : !hasValidInput ? (
                "Enter an amount"
              ) : (
                "Swap"
              )}
            </button>
          )}
        </div>
      </div>

      {/* Pool Info */}
      {poolInfo && (poolInfo as any).active && (
        <div className="mt-4 p-4 rounded-2xl bg-card/10 border border-border/20">
          <p className="text-[9px] font-bold text-foreground/40 uppercase tracking-widest mb-3">
            Pool Reserves — {stockToken.symbol} / oUSD
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] text-foreground/40">{stockToken.symbol}</p>
              <p className="text-sm font-bold text-foreground font-mono">
                {parseFloat(formatEther((poolInfo as any).reserveStock || BigInt(0))).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-foreground/40">oUSD</p>
              <p className="text-sm font-bold text-foreground font-mono">
                {parseFloat(formatEther((poolInfo as any).reserveStable || BigInt(0))).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
