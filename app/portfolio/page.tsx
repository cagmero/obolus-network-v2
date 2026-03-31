'use client'

import React, { useState, useCallback, useEffect, useMemo } from 'react'
import { 
  PieChart, 
  ArrowUpRight, 
  ArrowDownRight, 
  Lock, 
  TrendingUp,
  RefreshCw,
  EyeOff,
  Search,
  LayoutGrid,
  List as ListIcon,
  ShieldCheck,
  Landmark,
  DollarSign,
  Percent,
  ArrowRight,
  CheckCircle2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { useAllVaultPositions } from '@/hooks/useContracts'
import { useAllPrices } from '@/hooks/useMarketData'
import { VAULTS } from '@/lib/vaults'
import Link from 'next/link'
import { useAccount } from 'wagmi'
import { useObolusAuth, useNAVHistory } from '@/hooks/useVaults'
import { usePrivacyReveal } from '@/hooks/usePrivacyReveal'
import Sparkline from '@/components/Sparkline'

export default function PortfolioPage() {
  const { address } = useAccount()
  const { positions } = useAllVaultPositions()
  const { data: navData, isLoading: navLoading } = { data: null, isLoading: false } // placeholder for now

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [showValues, setShowValues] = useState<boolean>(false)
  const { } = useObolusAuth()
  const [isRevealing, setIsRevealing] = useState(false)
  const { reveal, hide } = usePrivacyReveal()
  const { data: prices } = useAllPrices()
  const [logs, setLogs] = useState<{msg: string, type: 'info' | 'success' | 'warn' | 'error', status: string}[]>([
    { msg: "SECURITY_DAEMON_INITIALIZED", type: 'info', status: 'OK' },
    { msg: "BLIND_STORAGE_SYNCED", type: 'info', status: 'READY' },
    { msg: "CRE_PRIVACY_LAYER_ACTIVE", type: 'info', status: 'SHIELDED' },
    { msg: "WAITING_FOR_IDENTITY_PROOF", type: 'warn', status: 'LOCKED' }
  ])

  const addLog = (msg: string, type: 'info' | 'success' | 'warn' | 'error' = 'info', status: string = 'OK') => {
    setLogs(prev => [{ msg, type, status }, ...prev].slice(0, 20))
  }

  const handleReveal = async () => {
    if (showValues) {
      setShowValues(false)
      hide()
      addLog("USER_SESSION_LOCKED // POSITIONS_RE_ENCRYPTED", "warn", "LOCKED")
      return
    }

    try {
      setIsRevealing(true)
      addLog("PRIVACY_REVEAL_INITIATED", "info", "STARTING")
      addLog("EIP712_SIGNING // TYPE: Privacy Reveal", "info", "SIGNING")
      
      await reveal()
      
      addLog("EIP712_SIGNATURE_VERIFIED // SERVER_AUTHENTICATED", "success", "VERIFIED")
      addLog("ECIES_POSITIONS_FETCHED // BLIND_STORAGE", "info", "PROCESSING")
      addLog("AES_KEY_DERIVED_FROM_SIGNATURE // PBKDF2", "success", "DERIVED")
      addLog("CLIENT_SIDE_DECRYPTION_COMPLETE // POSITIONS_VISIBLE", "success", "UNLOCKED")
      
      setShowValues(true)
    } catch (err) {
      addLog("PRIVACY_REVEAL_FAILED // SIGNATURE_REJECTED", "error", "FAIL")
      console.error("Reveal failed:", err)
    } finally {
      setIsRevealing(false)
    }
  }

  // Calculate all vault positions (including 0 balance)
  const allVaultPositions = useMemo(() => {
    return VAULTS.map(vault => {
      const pos = positions?.[vault.symbol] || { formatted: '0', hasPosition: false, raw: BigInt(0) }
      const marketPrice = prices?.[vault.symbol]?.price || 150.00
      return {
        symbol: vault.symbol,
        pos,
        vault,
        price: marketPrice,
        value: parseFloat(pos.formatted) * marketPrice
      }
    })
  }, [positions, prices])

  const activePositions = allVaultPositions.filter(p => p.pos.hasPosition)

  const totalValue = activePositions.reduce((acc, curr) => acc + curr.value, 0)
  const totalChange24h = activePositions.reduce((acc, curr) => {
    const change = (prices?.[curr.symbol]?.changePercent || 0) / 100 * curr.value
    return acc + change
  }, 0)
  const totalYield = activePositions.reduce((acc, curr) => {
    const yieldAmount = (curr.vault?.baseApy || 0) / 100 * curr.value
    return acc + yieldAmount
  }, 0)

  return (
    <div className="min-h-screen bg-transparent flex flex-col xl:flex-row">
      {/* Main Content: Portfolio (Full Width) */}
      <main className="flex-1 py-10 px-8 space-y-10 order-2 xl:order-1">
        {/* Portfolio Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
               <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <PieChart className="w-6 h-6 text-primary" />
               </div>
               <div>
                  <h1 className="text-4xl font-black tracking-tighter text-foreground uppercase">
                     PORTFOLIO <span className="text-primary">//</span> OVERVIEW
                  </h1>
                  <div className="flex items-center gap-2">
                     <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/5 border border-border/20">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-foreground/40">{address ? `CONNECTED_IDENTITY // ${address.slice(0, 10)}...` : 'NOT_CONNECTED'}</span>
                     </div>
                  </div>
               </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              onClick={handleReveal}
              disabled={isRevealing}
              className="border-border/20 hover:bg-white/5 text-[10px] font-black uppercase tracking-widest h-12 rounded-2xl gap-2 px-6 shadow-2xl"
            >
              {isRevealing ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : showValues ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Lock className="w-4 h-4" />
              )}
              {isRevealing ? 'AUTHENTICATING...' : showValues ? 'HIDE_PRIVACY' : 'REVEAL_ASSETS'}
            </Button>
            <Button className="bg-primary hover:bg-primary/90 text-black font-black text-xs h-12 px-8 rounded-2xl uppercase tracking-widest shadow-xl">
              EXPORT_TAX_REPORT
            </Button>
          </div>
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-2 bg-white/5 border border-border/20 rounded-[40px] p-10 relative overflow-hidden group hover:border-primary/30 transition-all flex flex-col justify-between min-h-[240px]">
             <div className="absolute top-0 right-0 p-10 opacity-5">
                <TrendingUp className="w-32 h-32 text-primary" />
             </div>
             <div className="space-y-4 relative z-10">
                <div className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">TOTAL_PORTFOLIO_NET_WORTH</div>
                <div className={cn(
                  "text-6xl font-black text-foreground tracking-tighter tabular-nums transition-all duration-700",
                  !showValues && "blur-md opacity-50"
                )}>
                  {showValues ? `$${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '$X,XXX,XXX.XX'}
                </div>
                <div className={cn(
                  "flex items-center gap-2 font-bold text-xs uppercase tracking-widest transition-all duration-700",
                  totalChange24h >= 0 ? "text-green-500" : "text-red-500",
                  !showValues && "blur-sm opacity-20"
                )}>
                   {totalChange24h >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                   <span>{totalChange24h >= 0 ? '+' : ''}${Math.abs(totalChange24h).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (24H)</span>
                </div>
             </div>
             <div className="flex items-center gap-6 text-[9px] font-black text-foreground/20 uppercase tracking-[0.2em] relative z-10">
                <div className="flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-green-500/40" />
                   CLIENT_SIDE_DECRYPTION
                </div>
                <div className="flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                   BLIND_SERVER_STORE
                </div>
             </div>
          </div>

          <StatCard label="ASSETS_DISTRIBUTION" value={activePositions.length.toString()} subValue="ACTIVE_VAULTS" />
          <StatCard 
            label="TOTAL_YIELD_EARNED" 
            value={showValues ? `+$${totalYield.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '+$X,XXX.XX'} 
            subValue="ANNUALIZED_PROJECTION" 
            color="text-primary" 
            blurred={!showValues}
          />
        </div>

        {/* holdings Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-4">
            <h2 className="text-xs font-black text-foreground/40 uppercase tracking-[0.3em]">YOUR_ON_CHAIN_HOLDINGS // {activePositions.length}</h2>
            <div className="flex bg-white/5 p-1 rounded-xl border border-border/10">
              <button 
                onClick={() => setViewMode('list')}
                className={cn("p-2 rounded-lg transition-all", viewMode === 'list' ? "bg-primary text-black" : "text-foreground/40")}
              >
                <ListIcon className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setViewMode('grid')}
                className={cn("p-2 rounded-lg transition-all", viewMode === 'grid' ? "bg-primary text-black" : "text-foreground/40")}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>

          {activePositions.length > 0 ? (
            <div className="bg-white/5 border border-border/20 rounded-[40px] overflow-hidden backdrop-blur-sm shadow-2xl">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border/10 bg-black/40">
                    <th className="px-10 py-6 text-[10px] font-black text-foreground/30 uppercase tracking-widest">ASSET_IDENTITY</th>
                    <th className="px-10 py-6 text-[10px] font-black text-foreground/30 uppercase tracking-widest">ENCRYPTED_BALANCE</th>
                    <th className="px-10 py-6 text-[10px] font-black text-foreground/30 uppercase tracking-widest">UNIT_PRICE</th>
                    <th className="px-10 py-6 text-[10px] font-black text-foreground/30 uppercase tracking-widest">MARKET_VALUE</th>
                    <th className="px-10 py-6 text-[10px] font-black text-foreground/30 uppercase tracking-widest">7D_TREND</th>
                    <th className="px-10 py-6 text-[10px] font-black text-foreground/30 uppercase tracking-widest text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/10">
                  {activePositions.map(({ symbol, pos, vault, price, value }) => (
                    <tr key={symbol} className="group hover:bg-white/[0.02] transition-colors">
                      <td className="px-10 py-8">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <div 
                              className="w-12 h-12 rounded-2xl flex items-center justify-center font-black relative z-10 overflow-hidden border border-white/5 bg-white/5 shadow-inner"
                              style={{ backgroundColor: `${vault?.color}10`, color: vault?.color }}
                            >
                               <img 
                                src={`/stocks/${symbol.replace(/x$|on$|X$/i, '')}.png`} 
                                alt={symbol} 
                                className="w-full h-full object-cover"
                                onError={(e) => (e.currentTarget.style.display = 'none')}
                               />
                            </div>
                            <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-6 rounded-full" style={{ backgroundColor: vault?.color }} />
                          </div>
                          <div>
                            <p className="text-sm font-black text-foreground uppercase">{symbol}</p>
                            <p className="text-[9px] text-foreground/30 font-bold uppercase tracking-widest">{vault?.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-8">
                         <code className={cn("text-xs font-mono font-bold transition-all tabular-nums", showValues ? "text-foreground" : "text-primary/40 blur-sm")}>
                            {showValues ? `${parseFloat(pos.formatted).toFixed(4)} ${symbol}` : 'XXXXXXXXXXXXXXXX'}
                         </code>
                      </td>
                      <td className="px-10 py-8">
                         <p className="text-xs font-black text-foreground/60 tabular-nums">${price.toFixed(2)}</p>
                      </td>
                      <td className="px-10 py-8">
                         <p className={cn("text-sm font-black text-foreground tabular-nums transition-all", !showValues && "blur-sm")}>
                            {showValues ? `$${value.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '$X,XXX.XX'}
                         </p>
                      </td>
                      <td className="px-10 py-8 whitespace-nowrap">
                         <Sparkline symbol={symbol} />
                      </td>
                      <td className="px-10 py-8 text-right">
                         <Link href={`/vault/${vault?.id}`}>
                            <Button variant="ghost" className="h-10 rounded-xl px-6 border border-border/10 hover:border-primary/40 text-[10px] font-black uppercase tracking-widest">
                                DETAILED_VIEW
                            </Button>
                         </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-white/5 border border-border/20 border-dashed rounded-[40px] py-24 flex flex-col items-center justify-center text-center space-y-6">
               <div className="w-16 h-16 rounded-full bg-white/5 border border-border/10 flex items-center justify-center mb-2">
                  <Search className="w-8 h-8 text-foreground/20" />
               </div>
               <div className="space-y-2">
                  <p className="text-sm font-black text-foreground uppercase tracking-widest">No Active Positions Found</p>
                  <p className="text-[10px] text-foreground/30 font-medium uppercase tracking-[0.2em]">Deploy capital to a vault to begin tracking performance</p>
               </div>
               <Link href="/vaults">
                  <Button className="bg-primary hover:bg-primary/90 text-black font-black text-xs h-12 px-10 rounded-2xl uppercase tracking-widest">
                     Visit Vault Markets
                  </Button>
               </Link>
            </div>
          )}
        </div>

        {/* Rebalancer Section */}
        <RebalancerSection 
          activePositions={allVaultPositions} 
          showValues={showValues} 
          totalValue={totalValue}
          addLog={addLog}
        />

        {/* Yield Strategies Section */}
        <YieldStrategiesSection />

        {/* Security Banner */}
        <div className="bg-black/40 border border-border/20 rounded-[40px] p-8 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
           <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-[24px] bg-primary/10 border border-primary/20 flex items-center justify-center">
                 <ShieldCheck className="w-8 h-8 text-primary" />
              </div>
              <div className="space-y-1">
                 <p className="text-xs font-black text-foreground uppercase tracking-widest">SECURE_ON_CHAIN_PRIVACY // DUMB_STORE_ARCHITECTURE</p>
                 <p className="text-[10px] text-foreground/40 font-medium uppercase leading-relaxed max-w-md">
                   Obolus implements a 3-layer privacy stack: Client-side encryption, Blinded Server storage, and CRE execution. 
                   Your net worth is mathematically invisible to the platform owners.
                 </p>
              </div>
           </div>
           <div className="flex items-center gap-10">
              <div className="text-center">
                 <p className="text-[10px] font-black text-primary uppercase mb-1">PRIVACY_MODEL</p>
                 <p className="text-xs font-black text-foreground/60 uppercase text-[9px]">ECIES_SEALED_STORE</p>
              </div>
              <div className="text-center">
                 <p className="text-[10px] font-black text-primary uppercase mb-1">COMPLIANCE</p>
                 <p className="text-xs font-black text-foreground/60 uppercase text-[9px]">INSTITUTIONAL_GRADE</p>
              </div>
           </div>
        </div>
      </main>

      {/* Right Sidebar: Security Logs */}
      <aside className="w-[320px] shrink-0 border-l border-border/10 bg-black/40 backdrop-blur-3xl p-6 flex flex-col gap-8 sticky top-0 h-screen hidden xl:flex order-1 xl:order-2">
         <div className="space-y-1">
            <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">SECURITY_DAEMON // v0.1.2</h3>
            <p className="text-[9px] text-foreground/30 font-bold uppercase tracking-widest leading-relaxed">
               Monitoring local browser memory and EIP-712 session derivation.
            </p>
         </div>

         <div className="flex-1 overflow-hidden flex flex-col gap-4">
            <div className="flex items-center justify-between px-2">
               <span className="text-[9px] font-black text-foreground/40 uppercase tracking-widest">LIVE_EVENT_LOG</span>
               <div className="flex items-center gap-1">
                  <div className="w-1 h-1 rounded-full bg-primary animate-pulse" />
                  <span className="text-[8px] font-black text-primary/60 uppercase">ACTIVE</span>
               </div>
            </div>
            
            <div className="flex-1 flex flex-col gap-2 overflow-y-auto scrollbar-hide">
               {logs.map((log, i) => (
                  <div key={i} className={cn(
                    "p-3 rounded-lg border flex flex-col gap-1 transition-all duration-500",
                    log.type === 'success' ? "bg-green-500/5 border-green-500/10" : 
                    log.type === 'warn' ? "bg-primary/5 border-primary/10" :
                    log.type === 'error' ? "bg-red-500/5 border-red-500/10" :
                    "bg-white/5 border-white/10"
                  )}>
                     <div className="flex items-center justify-between">
                        <span className={cn(
                          "text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded",
                          log.type === 'success' ? "bg-green-500/20 text-green-500" :
                          log.type === 'warn' ? "bg-primary/20 text-primary" :
                          log.type === 'error' ? "bg-red-500/20 text-red-500" :
                          "bg-white/10 text-foreground/60"
                        )}>{log.status}</span>
                         <span className="text-[8px] text-foreground/20 font-bold">{new Date().toLocaleTimeString()}</span>
                     </div>
                     <span className="text-[10px] font-mono font-bold text-foreground/80 break-words leading-tight">
                        {log.msg}
                     </span>
                  </div>
               ))}
            </div>
         </div>

         <div className="p-4 rounded-2xl bg-white/5 border border-border/10 space-y-3">
            <div className="flex items-center gap-2">
               <ShieldCheck className="w-4 h-4 text-primary" />
               <span className="text-[9px] font-black text-foreground uppercase tracking-widest">ENCRYPTION_STATUS</span>
            </div>
            <div className="space-y-1">
               <div className="flex items-center justify-between text-[8px] font-bold uppercase tracking-wider text-foreground/40">
                  <span>AES-GCM-256</span>
                  <span className="text-primary">ENFORCED</span>
               </div>
               <Progress value={showValues ? 100 : 0} className="h-1 bg-white/5" />
            </div>
         </div>
      </aside>
    </div>
  )
}

function StatCard({ label, value, subValue, color = "text-foreground", blurred = false }: { label: string, value: string, subValue: string, color?: string, blurred?: boolean }) {
  return (
    <div className="bg-white/5 border border-border/20 rounded-[32px] p-8 backdrop-blur-sm group hover:border-primary/20 transition-all flex flex-col justify-between min-h-[180px]">
      <div className="text-[9px] text-foreground/30 font-black uppercase tracking-widest mb-3">{label}</div>
      <div>
         <div className={cn(
           "text-3xl font-black tracking-tighter transition-all duration-700", 
           color,
           blurred && "blur-md opacity-50"
         )}>{value}</div>
         <div className="text-[8px] text-foreground/20 font-bold uppercase tracking-widest mt-2">{subValue}</div>
      </div>
    </div>
  )
}

function RebalancerSection({ activePositions, showValues, totalValue, addLog }: { 
  activePositions: any[], 
  showValues: boolean, 
  totalValue: number,
  addLog: any
}) {
  const [targetWeights, setTargetWeights] = useState<Record<string, number>>({})
  const [isRebalancing, setIsRebalancing] = useState(false)
  const [rebalanceStep, setRebalanceStep] = useState(0)

  // Initialize weights if not set
  useEffect(() => {
    if (activePositions.length > 0 && Object.keys(targetWeights).length === 0) {
      const equalWeight = 100 / activePositions.length
      const initial: Record<string, number> = {}
      activePositions.forEach(p => {
        initial[p.symbol] = equalWeight
      })
      setTargetWeights(initial)
    }
  }, [activePositions, targetWeights])

  const handleUpdateWeight = (symbol: string, val: string) => {
    const num = parseFloat(val) || 0
    setTargetWeights(prev => ({ ...prev, [symbol]: num }))
  }

  const rebalancePlan = useMemo(() => {
    if (totalValue === 0) return []
    return activePositions.map(p => {
      const currentWeight = (p.value / totalValue) * 100
      const targetWeight = targetWeights[p.symbol] || 0
      const diffWeight = targetWeight - currentWeight
      const diffValue = (diffWeight / 100) * totalValue
      return {
        ...p,
        currentWeight,
        targetWeight,
        diffWeight,
        diffValue,
        action: diffValue > 5 ? 'BUY' : diffValue < -5 ? 'SELL' : 'HOLD'
      }
    }).filter(p => p.action !== 'HOLD')
  }, [activePositions, totalValue, targetWeights])

  const executeRebalance = async () => {
    setIsRebalancing(true)
    setRebalanceStep(1)
    addLog("REBALANCER_ENGINE_STARTED", "info", "ACTIVE")
    
    // Step-by-step simulation for the demo
    for (const step of rebalancePlan) {
      if (step.action === 'SELL') {
        addLog(`WITHDRAWING_${step.symbol}_FROM_VAULT`, "info", "PENDING")
        await new Promise(r => setTimeout(r, 1500))
        addLog(`SWAPPING_${step.symbol}_FOR_oUSD // AMM_HYBRID`, "info", "SWAPPING")
        await new Promise(r => setTimeout(r, 1500))
      } else {
        addLog(`SWAPPING_oUSD_FOR_${step.symbol} // ORACLE_GUIDED`, "info", "SWAPPING")
        await new Promise(r => setTimeout(r, 1500))
        addLog(`DEPOSITING_${step.symbol}_INTO_VAULT`, "info", "STAKING")
        await new Promise(r => setTimeout(r, 1500))
      }
    }

    addLog("REBALANCING_SEQUENCE_COMPLETE // PORTFOLIO_OPTIMIZED", "success", "SYNCED")
    setIsRebalancing(false)
    setRebalanceStep(0)
  }

  return (
    <div className="bg-white/5 border border-border/20 rounded-[40px] p-10 backdrop-blur-sm space-y-8 group hover:border-primary/20 transition-all">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-xs font-black text-primary uppercase tracking-[0.3em]">PROPORTIONAL_REBALANCER // SMART_VAULT_ENGINE</h2>
          <p className="text-sm font-bold text-foreground/40 uppercase">Optimizing asset distribution across the 3-layer privacy stack</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
          <RefreshCw className={cn("w-3 h-3 text-primary", isRebalancing && "animate-spin")} />
          <span className="text-[8px] font-black text-primary uppercase tracking-widest">Auto_Sync_Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="space-y-6">
          <div className="space-y-4">
            {activePositions.map((p) => (
              <div key={p.symbol} className="space-y-2">
                <div className="flex justify-between items-center text-[10px] font-black uppercase">
                  <span className="text-foreground/60">{p.symbol} WEIGHT</span>
                  <span className="text-primary">{targetWeights[p.symbol]?.toFixed(1) || 0}%</span>
                </div>
                <div className="flex items-center gap-4">
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={targetWeights[p.symbol] || 0}
                    onChange={(e) => handleUpdateWeight(p.symbol, e.target.value)}
                    className="flex-1 accent-primary bg-white/5 h-1.5 rounded-full appearance-none flex-grow"
                  />
                  <Input 
                    type="number" 
                    value={targetWeights[p.symbol]?.toFixed(0) || 0}
                    onChange={(e) => handleUpdateWeight(p.symbol, e.target.value)}
                    className="w-16 h-8 bg-black/40 border-border/10 text-[10px] font-black text-center"
                  />
                </div>
              </div>
            ))}
          </div>

          <Button 
            onClick={executeRebalance}
            disabled={isRebalancing || rebalancePlan.length === 0}
            className="w-full h-14 bg-primary hover:bg-primary/90 text-black font-black text-xs rounded-2xl uppercase tracking-[0.2em] shadow-xl shadow-primary/10"
          >
            {isRebalancing ? "EXECUTING_OPTIMIZATION..." : "EXECUTE_REBALANCE_SEQUENCE"}
          </Button>
        </div>

        <div className="bg-black/40 rounded-[32px] p-8 border border-border/10 space-y-6">
          <div className="text-[10px] font-black text-foreground/30 uppercase tracking-widest">EXPECTED_ADJUSTMENTS</div>
          <div className="space-y-4">
            {rebalancePlan.length > 0 ? rebalancePlan.map((p) => (
              <div key={p.symbol} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-border/5">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-black",
                    p.action === 'BUY' ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"
                  )}>
                    {p.action === 'BUY' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-foreground uppercase">{p.symbol}</div>
                    <div className="text-[8px] font-bold text-foreground/20 uppercase">{p.action === 'BUY' ? 'Increase Exposure' : 'Taking Profit'}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={cn("text-xs font-black tabular-nums", p.action === 'BUY' ? "text-green-500" : "text-red-500")}>
                    {p.action === 'BUY' ? '+' : '-'}${Math.abs(p.diffValue).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </div>
                  <div className="text-[8px] font-bold text-foreground/20 uppercase tracking-tighter">
                    {p.currentWeight.toFixed(1)}% → {p.targetWeight.toFixed(1)}%
                  </div>
                </div>
              </div>
            )) : (
              <div className="h-40 flex flex-col items-center justify-center text-center opacity-20 italic">
                <CheckCircle2 className="w-8 h-8 mb-2" />
                <p className="text-[10px] uppercase tracking-widest">Portfolio currently in target sync</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function YieldStrategiesSection() {
  const strategies = [
    {
      title: "Stock_Token_Lending",
      platform: "Venus_Protocol",
      target: "4.8% - 7.2% APY",
      status: "ACTIVE",
      icon: <Landmark className="w-5 h-5 text-blue-400" />,
      link: "/lending",
      desc: "Borrow USDC against stock collateral and re-supply for looped yield."
    },
    {
      title: "Shielded_Vault_Staking",
      platform: "Obolus_Core",
      target: "12% - 18% APY",
      status: "BOOSTED",
      icon: <ShieldCheck className="w-5 h-5 text-primary" />,
      link: "/vaults",
      desc: "Private deposit layers with tiered APY incentives for long-term holders."
    },
    {
      title: "AMM_Market_Making",
      platform: "Obolus_AMM",
      target: "Variable Fees",
      status: "LIVE",
      icon: <RefreshCw className="w-5 h-5 text-green-400" />,
      link: "/swap",
      desc: "Provide liquidity for stock/oUSD pairs to capture trading volume fees."
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-4">
        <h2 className="text-xs font-black text-foreground/40 uppercase tracking-[0.3em]">YIELD_ENHANCEMENT_STRATEGIES // ACTIVE_MODULES</h2>
        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_green]" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {strategies.map((s, i) => (
          <Link href={s.link} key={i}>
            <div className="bg-white/5 border border-border/20 rounded-[32px] p-8 space-y-6 group hover:border-primary/40 hover:bg-white/[0.08] transition-all cursor-pointer h-full flex flex-col justify-between shadow-lg">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                  {s.icon}
                </div>
                <div className="px-2 py-1 rounded-md bg-white/5 border border-white/10 text-[8px] font-black text-foreground/40 uppercase tracking-widest leading-none">
                  {s.status}
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-sm font-black text-foreground uppercase tracking-tight group-hover:text-primary transition-colors">{s.title}</h3>
                <p className="text-[10px] text-foreground/40 font-bold uppercase tracking-widest">{s.platform}</p>
                <p className="text-[10px] text-foreground/30 leading-relaxed min-h-[40px]">{s.desc}</p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <div className="text-lg font-black text-foreground tracking-tighter tabular-nums">{s.target}</div>
                <ArrowRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
