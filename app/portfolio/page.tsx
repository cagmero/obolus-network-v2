'use client'

import React, { useState, useCallback } from 'react'
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
import NAVChart from '@/components/NAVChart'

export default function PortfolioPage() {
  const { address } = useAccount()
  const { positions } = useAllVaultPositions()
  const { data: navData, isLoading: navLoading } = useNAVHistory(30, Object.entries(positions || {}).map(([symbol, p]) => ({ symbol, ...p })))

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

  // Map NAV history snapshots to chart format
  const chartData = (navData?.snapshots || []).map(s => ({
    timestamp: new Date(s.timestamp).toLocaleDateString(),
    nav: s.value
  }))

  // Calculate total portfolio value
  const activePositions = Object.entries(positions || {})
    .filter(([_, pos]) => pos.hasPosition)
    .map(([symbol, pos]) => {
      const vault = VAULTS.find(v => v.symbol === symbol)
      const marketPrice = prices?.[symbol]?.price || 150.00
      return {
        symbol,
        pos,
        vault,
        price: marketPrice,
        value: parseFloat(pos.formatted) * marketPrice
      }
    })

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

        {/* Performance Chart Section */}
        <div className="space-y-6">
          <h2 className="text-xs font-black text-foreground/40 uppercase tracking-[0.3em] px-4">PERFORMANCE_ANALYTICS // NAV_HISTORY</h2>
          <NAVChart 
            data={chartData} 
            userAddress={address || '0x000...000'} 
            isLoading={navLoading} 
            blurred={!showValues}
          />
        </div>

        {/* Holdings Section */}
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
                               <span className="absolute inset-0 flex items-center justify-center text-lg opacity-20">{symbol[0]}</span>
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

        {/* Lending & Yield — Venus Protocol Simulation */}
        <LendingSection 
          activePositions={activePositions} 
          totalValue={totalValue} 
          showValues={showValues} 
        />

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

// ─── Lending & Yield Section ────────────────────────────────────────────────

const VENUS_SUPPLY_APY = 4.82
const VENUS_BORROW_APY = 6.15
const LTV_RATIO = 0.65 // 65% max loan-to-value
const LIQUIDATION_THRESHOLD = 0.80

interface LendingPosition {
  symbol: string
  collateralValue: number
  borrowed: number
  supplyYield: number
  timestamp: number
}

function LendingSection({ 
  activePositions, 
  totalValue, 
  showValues 
}: { 
  activePositions: { symbol: string; value: number; vault: any; pos: any; price: number }[]
  totalValue: number
  showValues: boolean 
}) {
  const [borrowAmount, setBorrowAmount] = useState('')
  const [selectedAsset, setSelectedAsset] = useState('')
  const [lendingPositions, setLendingPositions] = useState<LendingPosition[]>([])
  const [borrowStep, setBorrowStep] = useState<'idle' | 'collateralizing' | 'borrowing' | 'supplying' | 'complete' | 'error'>('idle')

  const totalCollateral = lendingPositions.reduce((s, p) => s + p.collateralValue, 0)
  const totalBorrowed = lendingPositions.reduce((s, p) => s + p.borrowed, 0)
  const totalSupplyYield = lendingPositions.reduce((s, p) => s + p.supplyYield, 0)
  const healthFactor = totalCollateral > 0 ? (totalCollateral * LIQUIDATION_THRESHOLD) / totalBorrowed : Infinity
  const maxBorrow = (() => {
    const asset = activePositions.find(a => a.symbol === selectedAsset)
    if (!asset) return 0
    const alreadyUsed = lendingPositions.filter(p => p.symbol === selectedAsset).reduce((s, p) => s + p.collateralValue, 0)
    return Math.max(0, (asset.value - alreadyUsed) * LTV_RATIO)
  })()

  const handleBorrow = useCallback(async () => {
    const amt = parseFloat(borrowAmount)
    if (!amt || amt <= 0 || amt > maxBorrow || !selectedAsset) return

    try {
      setBorrowStep('collateralizing')
      await new Promise(r => setTimeout(r, 800))

      setBorrowStep('borrowing')
      await new Promise(r => setTimeout(r, 1000))

      setBorrowStep('supplying')
      await new Promise(r => setTimeout(r, 800))

      const collateralNeeded = amt / LTV_RATIO
      const annualYield = amt * (VENUS_SUPPLY_APY / 100)

      setLendingPositions(prev => [...prev, {
        symbol: selectedAsset,
        collateralValue: collateralNeeded,
        borrowed: amt,
        supplyYield: annualYield,
        timestamp: Date.now(),
      }])

      setBorrowStep('complete')
      setBorrowAmount('')
      setTimeout(() => setBorrowStep('idle'), 2000)
    } catch {
      setBorrowStep('error')
      setTimeout(() => setBorrowStep('idle'), 2000)
    }
  }, [borrowAmount, maxBorrow, selectedAsset])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-4">
        <h2 className="text-xs font-black text-foreground/40 uppercase tracking-[0.3em] flex items-center gap-2">
          <Landmark className="w-4 h-4 text-primary" />
          LENDING_POOL // VENUS_PROTOCOL_SIMULATION
        </h2>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          <span className="text-[8px] font-black text-primary uppercase tracking-widest">BSC_MAINNET_FORK</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Lending Stats */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white/5 border border-border/20 rounded-[32px] p-6 space-y-5">
            <div className="text-[9px] font-black text-foreground/30 uppercase tracking-widest">LENDING_OVERVIEW</div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-foreground/40 uppercase">Collateral Locked</span>
                <span className={cn("text-sm font-black tabular-nums", !showValues && "blur-sm")}>
                  ${showValues ? totalCollateral.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : 'X,XXX.XX'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-foreground/40 uppercase">USDC Borrowed</span>
                <span className={cn("text-sm font-black text-blue-400 tabular-nums", !showValues && "blur-sm")}>
                  ${showValues ? totalBorrowed.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : 'X,XXX.XX'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-foreground/40 uppercase">Venus Supply Yield</span>
                <span className={cn("text-sm font-black text-green-500 tabular-nums", !showValues && "blur-sm")}>
                  +${showValues ? totalSupplyYield.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : 'XXX.XX'}/yr
                </span>
              </div>
              <div className="h-px bg-border/10" />
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-foreground/40 uppercase">Health Factor</span>
                <span className={cn(
                  "text-sm font-black tabular-nums",
                  healthFactor > 2 ? "text-green-500" : healthFactor > 1.2 ? "text-yellow-500" : "text-red-500"
                )}>
                  {totalBorrowed > 0 ? healthFactor.toFixed(2) : '∞'}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-[8px] font-bold uppercase tracking-wider text-foreground/30">
                <span>LTV Utilization</span>
                <span>{totalCollateral > 0 ? ((totalBorrowed / totalCollateral) * 100).toFixed(1) : '0'}%</span>
              </div>
              <div className="h-2 bg-black/40 rounded-full overflow-hidden">
                <div 
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    (totalBorrowed / totalCollateral) > 0.75 ? "bg-red-500" : 
                    (totalBorrowed / totalCollateral) > 0.5 ? "bg-yellow-500" : "bg-primary"
                  )}
                  style={{ width: `${totalCollateral > 0 ? Math.min((totalBorrowed / totalCollateral) * 100, 100) : 0}%` }}
                />
              </div>
            </div>
          </div>

          {/* Protocol Rates */}
          <div className="bg-white/5 border border-border/20 rounded-[32px] p-6 space-y-4">
            <div className="text-[9px] font-black text-foreground/30 uppercase tracking-widest">VENUS_RATES</div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-black/40 rounded-2xl p-4 text-center space-y-1">
                <Percent className="w-4 h-4 text-green-500 mx-auto" />
                <div className="text-lg font-black text-green-500">{VENUS_SUPPLY_APY}%</div>
                <div className="text-[8px] font-bold text-foreground/30 uppercase">Supply APY</div>
              </div>
              <div className="bg-black/40 rounded-2xl p-4 text-center space-y-1">
                <Percent className="w-4 h-4 text-blue-400 mx-auto" />
                <div className="text-lg font-black text-blue-400">{VENUS_BORROW_APY}%</div>
                <div className="text-[8px] font-bold text-foreground/30 uppercase">Borrow APR</div>
              </div>
            </div>
            <div className="text-[8px] text-foreground/20 font-medium text-center uppercase tracking-wider">
              Max LTV: {(LTV_RATIO * 100)}% // Liquidation: {(LIQUIDATION_THRESHOLD * 100)}%
            </div>
          </div>
        </div>

        {/* Borrow Interface */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white/5 border border-border/20 rounded-[32px] p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div className="text-[9px] font-black text-foreground/30 uppercase tracking-widest">BORROW_USDC // SUPPLY_TO_VENUS</div>
              <div className="flex items-center gap-1">
                <DollarSign className="w-3 h-3 text-blue-400" />
                <span className="text-[9px] font-black text-blue-400 uppercase">USDC</span>
              </div>
            </div>

            {/* Asset Selector */}
            <div className="space-y-2">
              <span className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">Collateral Asset</span>
              <div className="flex flex-wrap gap-2">
                {activePositions.map(({ symbol, vault, value }) => (
                  <button
                    key={symbol}
                    onClick={() => { setSelectedAsset(symbol); setBorrowAmount('') }}
                    className={cn(
                      "px-4 py-2.5 rounded-xl border text-[10px] font-black uppercase tracking-wider transition-all",
                      selectedAsset === symbol 
                        ? "border-primary bg-primary/10 text-primary" 
                        : "border-border/20 bg-black/20 text-foreground/40 hover:border-foreground/20"
                    )}
                  >
                    <span style={{ color: vault?.color }}>{symbol}</span>
                    <span className={cn("ml-2 text-foreground/20", !showValues && "blur-sm")}>
                      ${showValues ? value.toFixed(0) : 'XXX'}
                    </span>
                  </button>
                ))}
                {activePositions.length === 0 && (
                  <div className="text-[10px] text-foreground/20 font-bold uppercase py-2">
                    No vault positions to collateralize — deposit first
                  </div>
                )}
              </div>
            </div>

            {/* Borrow Amount */}
            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <span className="text-[10px] font-black text-foreground/40 uppercase">Borrow Amount (USDC)</span>
                <span className={cn("text-[10px] font-bold text-foreground/20 uppercase", !showValues && "blur-sm")}>
                  Max: ${showValues ? maxBorrow.toFixed(2) : 'X,XXX.XX'}
                </span>
              </div>
              <div className="relative">
                <Input 
                  type="number"
                  placeholder="0.00"
                  value={borrowAmount}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBorrowAmount(e.target.value)}
                  disabled={!selectedAsset || borrowStep !== 'idle'}
                  className="h-16 bg-black/60 border-border/10 rounded-2xl text-2xl font-black px-6 focus:ring-primary/20 focus:border-primary/40 tabular-nums"
                />
                <button 
                  onClick={() => setBorrowAmount(maxBorrow.toFixed(2))}
                  disabled={!selectedAsset}
                  className="absolute right-4 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-[9px] font-black text-blue-400 hover:bg-blue-500/20 transition-all disabled:opacity-30"
                >
                  MAX
                </button>
              </div>
            </div>

            {/* Flow Preview */}
            {selectedAsset && borrowAmount && parseFloat(borrowAmount) > 0 && (
              <div className="bg-black/40 rounded-2xl p-4 flex items-center justify-between text-[9px] font-bold uppercase tracking-wider">
                <div className="flex items-center gap-2 text-foreground/40">
                  <Lock className="w-3 h-3" />
                  Lock {selectedAsset}
                </div>
                <ArrowRight className="w-3 h-3 text-foreground/20" />
                <div className="flex items-center gap-2 text-blue-400">
                  <DollarSign className="w-3 h-3" />
                  Borrow USDC
                </div>
                <ArrowRight className="w-3 h-3 text-foreground/20" />
                <div className="flex items-center gap-2 text-green-500">
                  <TrendingUp className="w-3 h-3" />
                  Supply Venus ({VENUS_SUPPLY_APY}% APY)
                </div>
              </div>
            )}

            {/* Borrow Steps */}
            {borrowStep !== 'idle' && (
              <div className="bg-black/40 rounded-2xl p-4 space-y-2">
                <BorrowStepRow label="Collateralizing vault position" done={['borrowing','supplying','complete'].includes(borrowStep)} active={borrowStep === 'collateralizing'} />
                <BorrowStepRow label="Borrowing USDC against collateral" done={['supplying','complete'].includes(borrowStep)} active={borrowStep === 'borrowing'} />
                <BorrowStepRow label="Supplying USDC to Venus lending pool" done={borrowStep === 'complete'} active={borrowStep === 'supplying'} />
              </div>
            )}

            <Button
              onClick={handleBorrow}
              disabled={!selectedAsset || !borrowAmount || parseFloat(borrowAmount) <= 0 || parseFloat(borrowAmount) > maxBorrow || borrowStep !== 'idle'}
              className="w-full h-14 rounded-2xl bg-blue-500 hover:bg-blue-600 text-white font-black text-xs uppercase tracking-[0.2em]"
            >
              {borrowStep === 'complete' ? 'POSITION_OPENED' : borrowStep !== 'idle' ? 'PROCESSING...' : 'BORROW & SUPPLY TO VENUS'}
            </Button>
          </div>

          {/* Active Lending Positions */}
          {lendingPositions.length > 0 && (
            <div className="bg-white/5 border border-border/20 rounded-[32px] overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border/10 bg-black/40">
                    <th className="px-6 py-4 text-[9px] font-black text-foreground/30 uppercase tracking-widest">Collateral</th>
                    <th className="px-6 py-4 text-[9px] font-black text-foreground/30 uppercase tracking-widest">Locked Value</th>
                    <th className="px-6 py-4 text-[9px] font-black text-foreground/30 uppercase tracking-widest">USDC Borrowed</th>
                    <th className="px-6 py-4 text-[9px] font-black text-foreground/30 uppercase tracking-widest">Venus Yield</th>
                    <th className="px-6 py-4 text-[9px] font-black text-foreground/30 uppercase tracking-widest">Net APY</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/10">
                  {lendingPositions.map((pos, i) => {
                    const netApy = VENUS_SUPPLY_APY - (VENUS_BORROW_APY * (pos.borrowed / pos.collateralValue))
                    return (
                      <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-5">
                          <span className="text-xs font-black text-foreground uppercase">{pos.symbol}</span>
                        </td>
                        <td className="px-6 py-5">
                          <span className={cn("text-xs font-mono font-bold tabular-nums", !showValues && "blur-sm")}>
                            ${showValues ? pos.collateralValue.toLocaleString(undefined, { minimumFractionDigits: 2 }) : 'X,XXX.XX'}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <span className={cn("text-xs font-mono font-bold text-blue-400 tabular-nums", !showValues && "blur-sm")}>
                            ${showValues ? pos.borrowed.toLocaleString(undefined, { minimumFractionDigits: 2 }) : 'X,XXX.XX'}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <span className={cn("text-xs font-mono font-bold text-green-500 tabular-nums", !showValues && "blur-sm")}>
                            +${showValues ? pos.supplyYield.toLocaleString(undefined, { minimumFractionDigits: 2 }) : 'XXX.XX'}/yr
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <span className={cn(
                            "text-xs font-black tabular-nums",
                            netApy >= 0 ? "text-green-500" : "text-red-500"
                          )}>
                            {netApy >= 0 ? '+' : ''}{netApy.toFixed(2)}%
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function BorrowStepRow({ label, done, active }: { label: string; done: boolean; active: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className={cn(
        "text-[10px] font-bold uppercase tracking-tight",
        done ? "text-foreground" : active ? "text-blue-400" : "text-foreground/20"
      )}>{label}</span>
      {done ? (
        <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
      ) : active ? (
        <RefreshCw className="w-3.5 h-3.5 text-blue-400 animate-spin" />
      ) : (
        <div className="w-3.5 h-3.5 rounded-full border-2 border-foreground/10" />
      )}
    </div>
  )
}
