"use client"

import { useParams, useRouter } from "next/navigation"
import { useTokenPrice, usePriceHistory } from "@/hooks/useMarketData"
import { VAULTS, Vault } from "@/lib/vaults"
import { ONDO_GM_BSC_ADDRESSES } from "@/lib/ondoOracle"
import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown, Clock, Shield, Zap, Globe, Activity, ArrowUpRight, ChevronRight, Lock, ChevronDown } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { useState, useEffect, useMemo } from "react"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { useAccount } from "wagmi"
import { ConnectWalletButton } from "@/components/wallet/connect-wallet-button"
import PriceChart from "@/components/PriceChart"

export default function AssetPage() {
  const params = useParams()
  const router = useRouter()
  const { isConnected } = useAccount()
  const symbolKey = (params.id as string).toUpperCase()
  const vault = VAULTS.find(v => v.symbol.toUpperCase() === symbolKey)
  const [timeRange, setTimeRange] = useState('1M')
  const [activeTab, setActiveTab] = useState<'DEPOSIT' | 'WITHDRAW'>('DEPOSIT')
  
  const { data: priceData, isLoading } = useTokenPrice(symbolKey)
  const { data: history, isLoading: historyLoading } = usePriceHistory(symbolKey, timeRange)
  
  if (!vault) {
    return <div className="p-20 text-center font-mono uppercase text-xs font-black">ASSET_NOT_FOUND // ERROR_404</div>
  }

  const change = priceData?.changePercent ?? 0
  const isUp = change >= 0

  return (
    <div className="flex flex-col gap-8 font-mono pb-20 max-w-7xl mx-auto">
      <div className="flex items-center gap-2 text-[10px] text-foreground/40 font-bold uppercase tracking-widest">
        <Link href="/markets" className="hover:text-primary">MARKETS</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-foreground/80">{vault.symbol}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN: Chart and Info */}
        <div className="lg:col-span-8 space-y-8">
          {/* Asset Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div 
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black"
                style={{ backgroundColor: `${vault.color}15`, color: vault.color, border: `1px solid ${vault.color}30` }}
              >
                {vault.symbol[0]}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-black text-foreground tracking-tighter uppercase">{vault.name}</h1>
                  <span className="text-xs font-bold text-foreground/40">{vault.symbol}</span>
                </div>
                <div className="flex items-center gap-2">
                  {priceData?.isMarketOpen
                    ? <div className="px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20 text-[9px] font-black text-green-500 tracking-widest uppercase flex items-center gap-1.5">
                        <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse" />
                        MARKET_OPEN
                      </div>
                    : <div className="px-2 py-0.5 rounded-full bg-gray-500/10 border border-gray-500/20 text-[9px] font-black text-gray-400 tracking-widest uppercase flex items-center gap-1.5">
                        <div className="w-1 h-1 bg-gray-500 rounded-full" />
                        MARKET_CLOSED
                      </div>
                  }
                  
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-foreground/30 font-bold uppercase tracking-tighter italic">
                      Source: {priceData?.source === 'ondo+twelve_data' && (
                        <span className="text-green-300">ONDO_SVALUE × TWELVE_DATA</span>
                      )}
                      {priceData?.source === 'twelve_data_only' && (
                        <span className="text-blue-300">TWELVE_DATA // LIVE</span>
                      )}
                      {priceData?.source === 'fallback' && (
                        <span className="text-yellow-300">MOCK_PRICE // FALLBACK</span>
                      )}
                    </span>
                    
                    {priceData?.sValue !== 1.0 && priceData?.sValue && (
                      <div className="text-[8px] font-mono text-gray-500 uppercase tracking-widest">
                        SVALUE: {priceData.sValue.toFixed(6)} // ONDO_ORACLE
                      </div>
                    )}
                    
                    {priceData?.paused && (
                      <div className="text-[8px] font-mono text-amber-400 border border-amber-400 px-2 py-0.5 rounded uppercase tracking-widest animate-pulse">
                        ⚠ CORPORATE_ACTION_PENDING // PRICE_UPDATES_PAUSED
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="text-right space-y-1">
              <div className="text-4xl font-black tracking-tighter text-foreground tabular-nums">
                {priceData?.price
                  ? `$${priceData.price.toFixed(2)}`
                  : isLoading ? 'LOADING...' : '$---'}
              </div>
              <div className={cn("text-[11px] font-black tracking-widest uppercase flex items-center justify-end gap-1.5", isUp ? "text-green-500" : "text-red-500")}>
                {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {isUp ? "+" : ""}{change.toFixed(2)}% (24H)
              </div>
            </div>
          </div>

          {/* Chart Section */}
          <div className={cn(
            "rounded-[32px] overflow-hidden transition-colors duration-1000",
            isUp ? "bg-green-500/[0.03]" : "bg-red-500/[0.03]"
          )}>
            <PriceChart 
               data={history || []} 
               symbol={symbolKey} 
               color={vault.color} 
               timeRange={timeRange} 
               onTimeRangeChange={setTimeRange} 
               isLoading={historyLoading} 
            />
          </div>

          {/* About Section */}
          <div className="space-y-4">
            <h2 className="text-xs font-black tracking-widest text-foreground/60 uppercase">
              ABOUT // {vault.name.replace(' Inc', '').replace(' Corp', '').replace('.com', '').toUpperCase()}
            </h2>
            <div className="bg-card/10 border border-border/20 rounded-3xl p-8 backdrop-blur-sm">
               <p className="text-xs leading-relaxed text-foreground/70 uppercase tracking-tight">
                 {vault.description}
               </p>
               
               <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-10 pt-10 border-t border-border/10">
                  <div className="space-y-2">
                    <p className="text-[9px] font-black text-foreground/30 uppercase tracking-widest">Underlying Asset</p>
                    <p className="text-xs font-bold text-foreground uppercase">{vault.name}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[9px] font-black text-foreground/30 uppercase tracking-widest">Ticker Symbol</p>
                    <p className="text-xs font-bold text-foreground">{vault.underlying}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[9px] font-black text-foreground/30 uppercase tracking-widest">Asset Category</p>
                    <p className="text-xs font-bold text-foreground uppercase">{vault.category}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[9px] font-black text-foreground/30 uppercase tracking-widest">Oracle System</p>
                    <p className="text-xs font-bold text-foreground uppercase">{priceData?.source === 'ondo+twelve_data' ? "Ondo_Synthetic" : "Obolus_Mock"}</p>
                  </div>
               </div>
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/5 border border-border/10 rounded-2xl p-6 flex flex-col gap-4">
              <h3 className="text-[9px] font-black text-foreground/40 uppercase tracking-widest">Supported Chains</h3>
              <div className="flex flex-wrap gap-2">
                 {['BSC_MAINNET', 'BSC_TESTNET', 'LOCAL_GANACHE'].map(c => (
                   <span key={c} className="px-2 py-0.5 rounded-lg bg-foreground/5 border border-foreground/10 text-[8px] font-black text-foreground/60 tracking-widest uppercase">
                     {c}
                   </span>
                 ))}
              </div>
            </div>
            <div className="bg-white/5 border border-border/10 rounded-2xl p-6 flex flex-col gap-4 overflow-hidden">
              <h3 className="text-[9px] font-black text-foreground/40 uppercase tracking-widest">Contract Address (BSC)</h3>
              <div className="flex items-center justify-between gap-2 p-2 bg-black/40 rounded-xl border border-white/5">
                <span className="text-[9px] font-mono text-primary/80 truncate">
                  {ONDO_GM_BSC_ADDRESSES[symbolKey] || vault.tokenAddress}
                </span>
                <button className="text-primary hover:text-primary/70 transition-colors shrink-0">
                  <ArrowUpRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Deposit Widget */}
        <div className="lg:col-span-4 space-y-6">
          <div className="sticky top-24">
            <div className="bg-card/20 border border-border/40 rounded-[32px] p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden flex flex-col gap-8">
              {/* Tab Selector */}
              <div className="flex p-1 bg-white/5 rounded-2xl border border-border/10">
                {['DEPOSIT', 'WITHDRAW'].map((t) => (
                  <button
                    key={t}
                    onClick={() => setActiveTab(t as any)}
                    className={cn(
                      "flex-1 py-3 text-[10px] font-black tracking-[0.2em] uppercase rounded-xl transition-all",
                      activeTab === t 
                        ? "bg-primary text-primary-foreground shadow-lg" 
                        : "text-foreground/40 hover:text-foreground"
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {/* Chain Selector */}
              <div className="space-y-3">
                <p className="text-[9px] font-black text-foreground/40 uppercase tracking-widest px-1">Source Chain</p>
                <button className="w-full h-14 bg-white/5 hover:bg-white/10 border border-border/20 rounded-2xl px-4 flex items-center justify-between group transition-all">
                   <div className="flex items-center gap-3">
                     <div className="w-6 h-6 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-500">
                        <Zap className="w-4 h-4" />
                     </div>
                     <span className="text-xs font-bold text-foreground">BSC_TESTNET</span>
                   </div>
                   <ChevronDown className="w-4 h-4 text-foreground/20 group-hover:text-primary transition-colors" />
                </button>
              </div>

              {/* Amount Input */}
              <div className="bg-white/5 rounded-2xl p-5 border border-border/20 space-y-4">
                <div className="flex items-center justify-between text-[9px] font-black text-foreground/30 uppercase tracking-widest px-1">
                  <span>Spend</span>
                  <span>Balance: 0.00</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                   <input 
                     type="number" 
                     placeholder="0.00" 
                     className="bg-transparent text-2xl font-black text-foreground focus:outline-none w-full tabular-nums"
                   />
                   <button className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-xl border border-border/20 hover:bg-white/10 transition-colors">
                      <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center text-primary">U</div>
                      <span className="text-xs font-bold">USDT</span>
                      <ChevronDown className="w-3 h-3 text-foreground/30" />
                   </button>
                </div>
              </div>

              {/* Separator */}
              <div className="flex justify-center -my-4 relative z-10">
                 <div className="w-10 h-10 rounded-xl bg-card border border-border/40 flex items-center justify-center text-primary shadow-xl">
                    <Activity className="w-5 h-5 animate-pulse" />
                 </div>
              </div>

              {/* Output Amount */}
              <div className="bg-white/5 rounded-2xl p-5 border border-border/20 space-y-4 pt-8">
                <div className="flex items-center justify-between text-[9px] font-black text-foreground/30 uppercase tracking-widest px-1">
                  <span>Receive_At_Least</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                   <span className="text-2xl font-black text-foreground/40 tabular-nums">0.00</span>
                   <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/5 rounded-xl border border-primary/20">
                      <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center text-[10px] text-primary-foreground font-black">{vault.symbol[0]}</div>
                      <span className="text-xs font-bold">{vault.symbol}</span>
                   </div>
                </div>
              </div>

              {/* CTA */}
              <div className="pt-4">
                 {isConnected ? (
                   <Button className="w-full h-16 bg-primary hover:bg-primary/90 text-primary-foreground font-black text-sm tracking-[0.2em] uppercase rounded-[20px] shadow-2xl shadow-primary/20 group">
                     {activeTab}_ASSETS
                     <ArrowUpRight className="w-5 h-5 ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                   </Button>
                 ) : (
                   <div className="w-full flex justify-center">
                    <ConnectWalletButton className="w-full h-16 text-sm tracking-[0.2em] rounded-[20px]" />
                   </div>
                 )}
              </div>

              {/* Privacy/Metadata */}
              <div className="space-y-4 pt-4 border-t border-border/10">
                 <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-2xl border border-primary/10">
                    <Lock className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <div className="space-y-1">
                       <p className="text-[10px] font-black text-foreground uppercase tracking-tight">YOUR_POSITION_IS_ENCRYPTED</p>
                       <p className="text-[9px] text-foreground/40 uppercase leading-tight tracking-tighter">NOBODY_SEES_YOUR_BALANCE OR ENTRY_PRICE</p>
                    </div>
                 </div>
                 <div className="flex items-center justify-center gap-2 text-[8px] font-black text-foreground/20 uppercase tracking-[0.3em]">
                    Powered by Obolus_Nodes // Chainlink_CRE
                 </div>
              </div>
            </div>

            {/* Also Available On badge */}
            <div className="mt-8 flex flex-col items-center gap-4 px-8">
                <p className="text-[9px] font-black text-foreground/30 uppercase tracking-widest">Also Available On</p>
                <div className="flex items-center gap-6 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all cursor-crosshair">
                   <div className="flex items-center gap-1.5">
                      <Zap className="w-3 h-3" />
                      <span className="text-[10px] font-bold">BSC</span>
                   </div>
                   <div className="flex items-center gap-1.5">
                      <Globe className="w-3 h-3" />
                      <span className="text-[10px] font-bold">SOL</span>
                   </div>
                   <div className="flex items-center gap-1.5">
                      <Shield className="w-3 h-3" />
                      <span className="text-[10px] font-bold">ETH</span>
                   </div>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
