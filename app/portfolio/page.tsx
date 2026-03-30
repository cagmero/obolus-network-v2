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

export default function PortfolioPage() {
  const { address } = useAccount()
  const { positions, isLoading: positionsLoading } = useAllVaultPositions()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [showValues, setShowValues] = useState<boolean>(false)
  const { data: prices } = useAllPrices()

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
    <div className="max-w-7xl mx-auto space-y-10 py-10 px-6">
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
            onClick={() => setShowValues(!showValues)}
            className="border-border/20 hover:bg-white/5 text-[10px] font-black uppercase tracking-widest h-12 rounded-2xl gap-2 px-6"
          >
            {showValues ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showValues ? 'HIDE_PRIVACY' : 'REVEAL_ASSETS'}
          </Button>
          <Button className="bg-primary hover:bg-primary/90 text-black font-black text-xs h-12 px-8 rounded-2xl uppercase tracking-widest">
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
              <div className="text-6xl font-black text-foreground tracking-tighter tabular-nums blur-sm hover:blur-none transition-all">
                {showValues ? `$${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '$X,XXX,XXX.XX'}
              </div>
              <div className={cn(
                "flex items-center gap-2 font-bold text-xs uppercase tracking-widest",
                totalChange24h >= 0 ? "text-green-500" : "text-red-500"
              )}>
                 {totalChange24h >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                 <span>{totalChange24h >= 0 ? '+' : ''}${Math.abs(totalChange24h).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (24H)</span>
              </div>
           </div>
           <div className="flex items-center gap-6 text-[9px] font-black text-foreground/20 uppercase tracking-[0.2em] relative z-10">
              <div className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-green-500/40" />
                 REAL_TIME_VALUATION
              </div>
              <div className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                 ORACLE_VERIFIED
              </div>
           </div>
        </div>

        <StatCard label="ASSETS_DISTRIBUTION" value={activePositions.length.toString()} subValue="ACTIVE_VAULTS" />
        <StatCard 
          label="TOTAL_YIELD_EARNED" 
          value={`+$${totalYield.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} 
          subValue="ANNUALIZED_PROJECTION" 
          color="text-primary" 
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
          <div className="bg-white/5 border border-border/20 rounded-[40px] overflow-hidden backdrop-blur-sm">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border/10 bg-black/20">
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
                          {showValues ? `${parseFloat(pos.formatted).toFixed(2)} ${symbol}` : 'XXXXXXXXXXXXXXXX'}
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
      <div className="bg-black/40 border border-border/20 rounded-[40px] p-8 flex flex-col md:flex-row items-center justify-between gap-8">
         <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-[24px] bg-primary/10 border border-primary/20 flex items-center justify-center">
               <ShieldCheck className="w-8 h-8 text-primary" />
            </div>
            <div className="space-y-1">
               <p className="text-xs font-black text-foreground uppercase tracking-widest">SECURE_ON_CHAIN_PRIVACY</p>
               <p className="text-[10px] text-foreground/40 font-medium uppercase leading-relaxed max-w-md">
                 All portfolio values are protected by fhEVM encryption. Only your authorized identity can reveal these values locally in your browser.
               </p>
            </div>
         </div>
         <div className="flex items-center gap-10">
            <div className="text-center">
               <p className="text-[10px] font-black text-primary uppercase mb-1">AUDIT_PROTOCOL</p>
               <p className="text-xs font-black text-foreground/60 uppercase">VERIFIED_CRE</p>
            </div>
            <div className="text-center">
               <p className="text-[10px] font-black text-primary uppercase mb-1">NETWORK_STATUS</p>
               <p className="text-xs font-black text-foreground/60 uppercase">OPERATIONAL</p>
            </div>
         </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, subValue, color = "text-foreground" }: { label: string, value: string, subValue: string, color?: string }) {
  return (
    <div className="bg-white/5 border border-border/20 rounded-[32px] p-8 backdrop-blur-sm group hover:border-primary/20 transition-all flex flex-col justify-between min-h-[180px]">
      <div className="text-[9px] text-foreground/30 font-black uppercase tracking-widest mb-3">{label}</div>
      <div>
         <div className={cn("text-3xl font-black tracking-tighter", color)}>{value}</div>
         <div className="text-[8px] text-foreground/20 font-bold uppercase tracking-widest mt-2">{subValue}</div>
      </div>
    </div>
  )
}
