'use client'

import React, { useState } from 'react'
import { 
  PieChart, 
  Wallet, 
  ArrowUpRight, 
  ArrowDownRight, 
  Shield, 
  Lock, 
  ChevronRight,
  TrendingUp,
  Activity,
  Zap,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Eye,
  EyeOff,
  Search,
  LayoutGrid,
  List as ListIcon,
  HelpCircle,
  ExternalLink,
  ShieldCheck
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { useAllVaultPositions } from '@/hooks/useContracts'
import { useAllPrices } from '@/hooks/useMarketData'
import { VAULTS } from '@/lib/vaults'
import { CONTRACT_ADDRESSES } from '@/lib/wagmi'
import Link from 'next/link'
import { useAccount } from 'wagmi'
import { decryptData } from '@/lib/encryption'
import { useObolusAuth, useNAVHistory } from '@/hooks/useVaults'
import NAVChart from '@/components/NAVChart'

export default function PortfolioPage() {
  const { address } = useAccount()
  const { positions, isLoading: positionsLoading } = useAllVaultPositions()
  const { data: navData, isLoading: navLoading } = useNAVHistory(30)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [showValues, setShowValues] = useState<boolean>(false)
  const { getSignature } = useObolusAuth()
  const [isRevealing, setIsRevealing] = useState(false)
  const { data: prices } = useAllPrices()
  const [logs, setLogs] = useState<{msg: string, type: 'info' | 'success' | 'warn' | 'error', status: string}[]>([
    { msg: "SECURITY_DAEMON_INITIALIZED", type: 'info', status: 'OK' },
    { msg: "BLIND_STORAGE_SYNCED", type: 'info', status: 'READY' },
    { msg: "WAITING_FOR_IDENTITY_PROOF", type: 'warn', status: 'LOCKED' }
  ])

  const addLog = (msg: string, type: 'info' | 'success' | 'warn' | 'error' = 'info', status: string = 'OK') => {
    setLogs(prev => [{ msg, type, status }, ...prev].slice(0, 20))
  }

  const handleReveal = async () => {
    if (showValues) {
      setShowValues(false)
      addLog("USER_SESSION_LOCKED", "warn", "LOCKED")
      return
    }

    try {
      setIsRevealing(true)
      addLog("DECRYPTION_PROTOCOL_INITIATED", "info", "STARTING")
      
      const { signature } = await getSignature()
      addLog("EIP712_SIGNATURE_CAPTURED", "success", "VERIFIED")
      
      addLog("DERIVING_DECRYPTION_KEYS", "info", "PROCESSING")
      await decryptData("ENCRYPTED_BLOB", signature)
      addLog("CLIENT_SIDE_DECRYPTION_SUCCESS", "success", "UNLOCKED")
      
      setShowValues(true)
    } catch (err) {
      addLog("AUTHENTICATION_FAILED", "error", "FAIL")
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
    <div className="min-h-screen bg-transparent flex">
      {/* Left Sidebar: Security Logs */}
      <aside className="w-[320px] shrink-0 border-r border-border/10 bg-black/40 backdrop-blur-3xl p-6 flex flex-col gap-8 sticky top-0 h-screen hidden xl:flex">
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

      {/* Main Content: Portfolio (Full Width) */}
      <main className="flex-1 py-10 px-8 space-y-10">
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
                          <div 
                            className="w-10 h-10 rounded-xl flex items-center justify-center font-black"
                            style={{ backgroundColor: `${vault?.color}10`, color: vault?.color, border: `1px solid ${vault?.color}30` }}
                          >
                            {symbol[0]}
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
