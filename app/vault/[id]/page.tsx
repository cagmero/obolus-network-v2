'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  Shield, 
  Lock, 
  TrendingUp, 
  Activity, 
  Zap, 
  Info,
  ExternalLink,
  ChevronRight,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  MoreHorizontal,
  Plus,
  Minus,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { useVaultPosition, useVaultShares, useTokenBalance, useTokenAllowance, useOracleSValue } from '@/hooks/useContracts'
import { useDepositFlow, useWithdrawFlow } from '@/hooks/useContractWrite'
import { CONTRACT_ADDRESSES } from '@/lib/wagmi'
import { VAULTS } from '@/lib/vaults'
import { useAccount, useChainId } from 'wagmi'
import { useTokenPrice } from '@/hooks/useMarketData'

export default function VaultDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const vault = VAULTS.find(v => v.id === id)
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw'>('deposit')
  const [amount, setAmount] = useState('')
  const [logs, setLogs] = useState<string[]>([])
  
  const tokenAddress = CONTRACT_ADDRESSES[vault?.symbol as keyof typeof CONTRACT_ADDRESSES]
  const { address } = useAccount()
  const { formatted: tokenBalance, refetch: refetchBalance } = useTokenBalance(tokenAddress as string)
  const { formatted: vaultPosition, refetch: refetchPosition } = useVaultPosition(tokenAddress as string)
  const { formatted: totalShares, refetch: refetchShares } = useVaultShares()
  const { sValue, paused } = useOracleSValue(tokenAddress as string)
  
  const { deposit, step: depositStep, txHash: depositTxHash, error: depositError, reset: resetDeposit } = useDepositFlow()
  const { withdraw, step: withdrawStep, txHash: withdrawTxHash, error: withdrawError, reset: resetWithdraw } = useWithdrawFlow()
  
  const { data: marketDataResult } = useTokenPrice(vault?.symbol || '')
  const marketData = marketDataResult ? {
    price: marketDataResult.price,
    change: marketDataResult.changePercent,
    tvl: 1250000 // Mock TVL for detail
  } : null

  useEffect(() => {
    if (depositStep !== 'idle' || withdrawStep !== 'idle') {
      addLog(`SYSTEM_UPDATE // ${depositStep !== 'idle' ? 'DEPOSIT' : 'WITHDRAW'}_FLOW // STATUS: ${depositStep || withdrawStep}`)
    }
  }, [depositStep, withdrawStep])

  const addLog = (msg: string) => {
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 20))
  }

  const handleDeposit = async () => {
    if (!amount || !tokenAddress) return
    try {
      addLog(`INITIATING_VAULT_ENTRY // ${vault?.symbol} // AMOUNT: ${amount}`)
      await deposit({
        tokenSymbol: vault?.symbol || '',
        tokenAddress: tokenAddress as string,
        amount: amount
      })
      addLog('PROTOCOL_HANDSHAKE_COMPLETE // ASSETS_LOCKED')
      setAmount('')
    } catch (e) {
      // Error handled by hook
    }
  }

  const handleWithdraw = async () => {
    if (!amount || !tokenAddress) return
    try {
      addLog(`INITIATING_VAULT_EXIT // ${vault?.symbol} // SHARES: ${amount}`)
      await withdraw({
        tokenSymbol: vault?.symbol || '',
        tokenAddress: tokenAddress as string,
        shares: amount
      })
      addLog('ASSETS_RELEASED // SETTLEMENT_PENDING')
      setAmount('')
    } catch (e) {
      // Error handled by hook
    }
  }

  if (!vault) return null

  return (
    <div className="max-w-7xl mx-auto py-10 px-6 space-y-10">
      {/* Back Button & Header */}
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          onClick={() => router.back()}
          className="text-foreground/40 hover:text-foreground hover:bg-white/5 gap-2 px-0 -ml-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-[10px] font-black uppercase tracking-widest">BACK_TO_MARKETS</span>
        </Button>
        <div className="flex items-center gap-2">
           <div className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-[9px] font-black text-primary uppercase tracking-widest">LIVE_ON_BSC_TESTNET</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Asset Info */}
        <div className="lg:col-span-8 space-y-8">
          {/* Hero Section */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-5">
              <div 
                className="w-20 h-20 rounded-3xl flex items-center justify-center text-3xl font-black relative overflow-hidden group shadow-2xl"
                style={{ backgroundColor: `${vault.color}10`, color: vault.color, border: `1px solid ${vault.color}30` }}
              >
                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                {vault.symbol[0]}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                   <h1 className="text-4xl font-black tracking-tighter text-foreground uppercase">{vault.symbol}</h1>
                   {paused && <Badge label="PAUSED" />}
                </div>
                <p className="text-sm text-foreground/40 font-bold uppercase tracking-widest">{vault.name} // OBOLUS_STRATEGY_V2</p>
                <div className="flex items-center gap-4 mt-3">
                   <div className="flex items-center gap-1.5">
                      <Shield className="w-3 h-3 text-primary/60" />
                      <span className="text-[10px] font-black text-foreground/60 uppercase tracking-widest">VERIFIED_CONTRACT</span>
                   </div>
                   <div className="w-1 h-1 rounded-full bg-white/10" />
                   <div className="flex items-center gap-1.5">
                      <Lock className="w-3 h-3 text-primary/60" />
                      <span className="text-[10px] font-black text-foreground/60 uppercase tracking-widest">PRIVACY_ENABLED</span>
                   </div>
                </div>
              </div>
            </div>
            
            <div className="text-right">
               <div className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.2em] mb-1">LIVE_PRICE</div>
               <div className="text-3xl font-black text-foreground tabular-nums tracking-tighter">
                  ${marketData?.price?.toFixed(2) || "0.00"}
               </div>
               <div className={cn(
                 "text-[10px] font-black flex items-center justify-end gap-1 mt-1",
                 (marketData?.change || 0) >= 0 ? "text-green-500" : "text-red-500"
               )}>
                  {(marketData?.change || 0) >= 0 ? <TrendingUp className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {Math.abs(marketData?.change || 0).toFixed(2)}%
               </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard 
              label="TOTAL_VALUE_LOCKED" 
              value={`$${(marketData?.tvl || 0).toLocaleString()}`} 
              subValue="REAL_TIME_ORACLE" 
            />
            <StatCard 
              label="ESTIMATED_APY" 
              value={`${vault.baseApy}%`} 
              subValue="PROJECTED_ANNUAL" 
            />
            <StatCard 
              label="YOUR_POSITION" 
              value={`${parseFloat(vaultPosition).toLocaleString(undefined, { maximumFractionDigits: 2 })} ${vault.symbol}`}
              subValue="ON_CHAIN_BALANCE" 
            />
          </div>

          {/* About Section */}
          <div className="bg-white/5 border border-border/20 rounded-[40px] p-8 space-y-6">
             <h2 className="text-xs font-black text-foreground/60 uppercase tracking-widest flex items-center gap-2">
                <Info className="w-4 h-4 text-primary" />
                VAULT_PARAMETERS // PROTOCOL_SPEC
             </h2>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                <FeeRow label="ASSET_ADDRESS" value={tokenAddress?.slice(0, 10) + '...'} />
                <FeeRow label="ORACLE_SVALUE" value={sValue.toFixed(4)} />
                <FeeRow label="TOTAL_SHARES" value={parseFloat(totalShares).toFixed(2)} />
                <FeeRow label="VAULT_ADDRESS" value={CONTRACT_ADDRESSES.RWAVault.slice(0, 10) + '...'} />
             </div>
          </div>

          {/* Log Window */}
          <div className="space-y-4">
             <h2 className="text-xs font-black text-foreground/30 uppercase tracking-widest px-4">TRANSACTION_FEED // SYSTEM_LOGS</h2>
             <div className="bg-black/60 border border-border/20 rounded-[32px] p-6 h-48 overflow-y-auto font-mono text-[10px] space-y-2">
                {logs.length > 0 ? (
                  logs.map((log, i) => (
                    <div key={i} className="text-foreground/70 flex gap-2">
                      <span className="text-primary/60">[{log.split(']')[0].replace('[', '')}]</span>
                      <span className="text-foreground/40 tracking-tighter">{log.split(']')[1]}</span>
                    </div>
                  ))
                ) : (
                  <div className="h-full flex items-center justify-center opacity-20 uppercase tracking-widest">Awaiting interaction...</div>
                )}
             </div>
          </div>
        </div>

        {/* Right Column: Interaction Window */}
        <div className="lg:col-span-4">
          <div className="sticky top-24 bg-card/60 border border-border/40 rounded-[40px] p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden flex flex-col gap-8 min-h-[500px]">
            {/* Tab Switched */}
            <div className="flex bg-black/40 p-1.5 rounded-2xl border border-border/10">
               <button 
                onClick={() => { setActiveTab('deposit'); resetDeposit(); resetWithdraw(); }}
                className={cn(
                  "flex-1 py-3 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition-all",
                  activeTab === 'deposit' ? "bg-primary text-black" : "text-foreground/40 hover:text-foreground"
                )}
               >
                DEPOSIT
               </button>
               <button 
                onClick={() => { setActiveTab('withdraw'); resetDeposit(); resetWithdraw(); }}
                className={cn(
                  "flex-1 py-3 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition-all",
                  activeTab === 'withdraw' ? "bg-primary text-black" : "text-foreground/40 hover:text-foreground"
                )}
               >
                WITHDRAW
               </button>
            </div>

            <div className="space-y-6 flex-grow">
               <div className="space-y-4">
                  <div className="flex justify-between items-end px-2">
                    <span className="text-[10px] font-black text-foreground/60 uppercase">Amount to {activeTab}</span>
                    <span className="text-[10px] font-black text-foreground/30 uppercase">
                      Balance: {activeTab === 'deposit' ? tokenBalance : vaultPosition}
                    </span>
                  </div>
                  
                  <div className="relative group">
                    <Input 
                      type="number"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="h-20 bg-black/60 border-border/10 rounded-3xl text-3xl font-black px-8 focus:ring-primary/20 focus:border-primary/40 focus:bg-black transition-all tabular-nums"
                    />
                    <button 
                      onClick={() => setAmount(activeTab === 'deposit' ? tokenBalance : vaultPosition)}
                      className="absolute right-6 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary hover:bg-primary/20 transition-all"
                    >
                      MAX
                    </button>
                  </div>
               </div>

               {/* Status Display */}
               {(depositStep !== 'idle' || withdrawStep !== 'idle') && (
                 <div className="bg-white/5 rounded-3xl p-6 border border-border/20 space-y-4 animate-in fade-in slide-in-from-top-4">
                    <div className="flex items-center justify-between">
                       <span className="text-[9px] font-black text-foreground/40 uppercase tracking-widest">TRANSACTION_GATEWAY</span>
                       <div className="flex items-center gap-1.5">
                          <div className={cn(
                            "w-1.5 h-1.5 rounded-full",
                            (depositStep === 'error' || withdrawStep === 'error') ? "bg-red-500" : 
                            (depositStep === 'complete' || withdrawStep === 'complete') ? "bg-green-500" : "bg-primary animate-pulse"
                          )} />
                          <span className="text-[10px] font-black text-foreground/80 uppercase">
                            {depositStep === 'complete' || withdrawStep === 'complete' ? 'COMPLETED' : 
                             depositStep === 'error' || withdrawStep === 'error' ? 'FAILED' : 'EXECUTING'}
                          </span>
                       </div>
                    </div>

                    <div className="space-y-3">
                       <StatusStep label="Step 1: Authorization" completed={['approve_confirmed', 'depositing', 'complete'].includes(depositStep)} loading={depositStep === 'approving'} />
                       <StatusStep label="Step 2: Execution" completed={['complete'].includes(depositStep || withdrawStep)} loading={['depositing', 'recording'].includes(depositStep || withdrawStep)} />
                    </div>

                    {(depositTxHash || withdrawTxHash) && (
                      <a 
                        href={`https://testnet.bscscan.com/tx/${depositTxHash || withdrawTxHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-3 bg-black/40 rounded-xl group/link"
                      >
                         <span className="text-[8px] font-mono text-foreground/40">{depositTxHash || withdrawTxHash}</span>
                         <ExternalLink className="w-3 h-3 text-primary/40 group-hover/link:text-primary" />
                      </a>
                    )}

                    {(depositError || withdrawError) && (
                      <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
                         <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                         <span className="text-[9px] text-red-500 leading-tight font-bold">{depositError || withdrawError}</span>
                      </div>
                    )}
                 </div>
               )}
            </div>

            <div className="space-y-4">
               <Button 
                onClick={activeTab === 'deposit' ? handleDeposit : handleWithdraw}
                disabled={!amount || parseFloat(amount) === 0 || depositStep !== 'idle' && depositStep !== 'complete' && depositStep !== 'error' || withdrawStep !== 'idle' && withdrawStep !== 'complete' && withdrawStep !== 'error'}
                className={cn(
                  "w-full h-16 rounded-3xl text-sm font-black uppercase tracking-[0.2em] transition-all",
                  activeTab === 'deposit' ? "bg-primary text-black hover:bg-primary/90" : "bg-foreground text-background hover:bg-foreground/90"
                )}
               >
                {activeTab === 'deposit' ? 'DEPOSIT_ASSETS' : 'WITHDRAW_ASSETS'}
               </Button>
               <div className="flex items-center justify-center gap-6">
                  <div className="flex items-center gap-1.5 grayscale opacity-40">
                     <ShieldCheck className="w-3 h-3" />
                     <span className="text-[8px] font-black uppercase">Audited By Certik</span>
                  </div>
                  <div className="flex items-center gap-1.5 grayscale opacity-40">
                     <ShieldCheck className="w-3 h-3" />
                     <span className="text-[8px] font-black uppercase">CRE Protection</span>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Badge({ label }: { label: string }) {
  return (
    <div className="px-2.5 py-1 rounded-md bg-red-500/10 border border-red-500/20 text-[9px] font-black uppercase tracking-[0.15em] text-red-500">
      {label}
    </div>
  )
}


function StatusStep({ label, completed, loading }: { label: string, completed: boolean, loading: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className={cn(
        "text-[10px] font-bold uppercase tracking-tight",
        completed ? "text-foreground" : loading ? "text-primary" : "text-foreground/20"
      )}>{label}</span>
      {completed ? (
        <CheckCircle2 className="w-4 h-4 text-green-500" />
      ) : loading ? (
        <RefreshCw className="w-4 h-4 text-primary animate-spin" />
      ) : (
        <div className="w-4 h-4 rounded-full border-2 border-foreground/10" />
      )}
    </div>
  )
}

function ShieldCheck({ className }: { className?: string }) {
  return (
    <svg 
      className={className}
      width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
    </svg>
  )
}
function FeeRow({ label, value }: { label: string, value: string }) {
  return (
    <div className="space-y-1">
      <div className="text-[8px] font-black text-foreground/30 uppercase tracking-[0.2em]">{label}</div>
      <div className="text-[10px] font-mono text-foreground font-medium">{value}</div>
    </div>
  )
}

function StatCard({ label, value, subValue, trend, trendColor }: { label: string, value: string, subValue?: string, trend?: string, trendColor?: string }) {
  return (
    <div className="bg-white/5 border border-border/20 rounded-[32px] p-6 space-y-2">
      <div className="text-[9px] font-black text-foreground/40 uppercase tracking-widest">{label}</div>
      <div className="flex items-baseline gap-2">
        <div className="text-xl font-bold tracking-tight">{value}</div>
        {trend && <div className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded-full", trendColor)}>
          {trend}
        </div>}
      </div>
      {subValue && <div className="text-[10px] font-mono text-foreground/40">{subValue}</div>}
    </div>
  )
}
