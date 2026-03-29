"use client"

import { useAllPrices } from "@/hooks/useMarketData"
import { VAULTS } from "@/lib/vaults"
import { ONDO_GM_BSC_ADDRESSES } from "@/lib/ondoOracle"
import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown, Clock, Shield, Zap, Globe, Activity, ArrowUpRight } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import Sparkline from "@/components/Sparkline"

export default function MarketsPage() {
  const { data: prices, isLoading, refetch, dataUpdatedAt } = useAllPrices()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="flex flex-col gap-8 font-mono pb-20">
      {/* Header Info */}
      <div className="flex items-center justify-between border-b border-border/20 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tighter text-foreground">MARKETS // LIVE_ONDO_ORACLE_FEED</h1>
          <p className="text-[10px] text-foreground/40 uppercase tracking-[0.2em] mt-1">
            NETWORK: BSC_MAINNET // SOURCE: ONDO_SYNTHETIC_SHARES
          </p>
        </div>
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/5 text-[10px] text-primary font-bold tracking-wider uppercase">
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          ORACLE_CONNECTED
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "DATA_SOURCE", value: "ONDO_ORACLE", icon: Globe, color: "text-primary" },
          { label: "ORACLE_ADDR", value: "0xF4Fd...F15e", icon: Shield, color: "text-foreground/80" },
          { label: "CHAIN", value: "BSC_MAINNET", icon: Zap, color: "text-foreground/80" },
          { label: "LAST_UPDATE", value: dataUpdatedAt ? new Date(dataUpdatedAt).toLocaleTimeString() : "SYNCING...", icon: Clock, color: "text-green-500" },
        ].map((stat, i) => (
          <div key={i} className="bg-card/20 border border-border/40 rounded-2xl p-5 backdrop-blur-sm group hover:border-primary/30 transition-all">
            <div className="flex items-center justify-between mb-3 text-foreground/40">
              <span className="text-[10px] font-bold tracking-widest uppercase">{stat.label}</span>
              <stat.icon className="w-4 h-4" />
            </div>
            <div className={cn("text-sm font-bold tracking-tight truncate", stat.color)}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* Asset Price Matrix */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-xs font-bold tracking-widest text-foreground/60 uppercase">
            ASSET_PRICE_MATRIX // REAL_TIME
          </h2>
          {isLoading && (
            <div className="text-[10px] text-primary animate-pulse font-bold tracking-widest uppercase">
              QUERYING_ORACLE // BSC_MAINNET...
            </div>
          )}
        </div>

        <div className="bg-white/5 border border-border/20 rounded-2xl overflow-hidden backdrop-blur-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border/10 bg-white/5">
                  <th className="px-6 py-4 text-[10px] font-black text-foreground/40 uppercase tracking-widest">Asset</th>
                  <th className="px-6 py-4 text-[10px] font-black text-foreground/40 uppercase tracking-widest">Underlying</th>
                  <th className="px-6 py-4 text-[10px] font-black text-foreground/40 uppercase tracking-widest">Live Price</th>
                  <th className="px-6 py-4 text-[10px] font-black text-foreground/40 uppercase tracking-widest">SValue</th>
                  <th className="px-6 py-4 text-[10px] font-black text-foreground/40 uppercase tracking-widest">Source</th>
                  <th className="px-6 py-4 text-[10px] font-black text-foreground/40 uppercase tracking-widest">24H Change</th>
                  <th className="px-6 py-4 text-[10px] font-black text-foreground/40 uppercase tracking-widest">7D_TREND</th>
                  <th className="px-6 py-4 text-[10px] font-black text-foreground/40 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-right text-[10px] font-black text-foreground/40 uppercase tracking-widest">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/5">
                {VAULTS.map((vault) => {
                  const data = prices?.[vault.symbol]
                  const price = data?.price || 0
                  const changePercent = data?.changePercent || 0
                  const isPositive = changePercent >= 0

                  return (
                    <tr key={vault.id} className="group hover:bg-white/5 transition-colors">
                      <td className="px-6 py-5 font-bold flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: vault.color }} />
                        <span className="text-sm tracking-tight">{vault.symbol}</span>
                      </td>
                      <td className="px-6 py-5 text-[10px] text-foreground/40 font-bold uppercase tracking-tight">
                        {vault.name}
                      </td>
                      <td className="px-6 py-5 font-black text-base tracking-tighter tabular-nums space-y-1">
                        <div>
                          ${price ? price.toFixed(2) : "---"}
                        </div>
                        {data?.paused && (
                          <div className="text-[7px] bg-amber-500/10 text-amber-500 border border-amber-500/20 px-1 py-0.5 rounded-sm font-black tracking-tighter">⚠ PAUSED</div>
                        )}
                      </td>
                      <td className="px-6 py-5 text-[10px] font-mono text-foreground/40" title={data?.sValue && data.sValue !== 1.0 ? "Synthetic shares multiplier" : ""}>
                         {data?.sValue && data.sValue !== 1.0 ? `×${data.sValue.toFixed(4)}` : "—"}
                      </td>
                      <td className="px-6 py-5">
                        <div className={cn(
                          "inline-flex px-1.5 py-0.5 rounded text-[8px] font-black tracking-widest uppercase border",
                          data?.source === 'ondo+twelve_data'
                            ? "bg-green-500/10 text-green-500 border-green-500/20" 
                            : data?.source === 'twelve_data_only'
                              ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
                              : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                        )}>
                          {data?.source === 'ondo+twelve_data' ? "ONDO+LIVE" : data?.source === 'twelve_data_only' ? "LIVE" : "COINGECKO"}
                        </div>
                      </td>
                      <td className={cn("px-6 py-5 text-[11px] font-bold tabular-nums", isPositive ? "text-green-500" : "text-red-500")}>
                        {isPositive ? "+" : ""}{changePercent.toFixed(2)}%
                      </td>
                      <td className="px-6 py-5">
                        <Sparkline symbol={vault.symbol} />
                      </td>
                      <td className="px-6 py-5">
                        {data?.isMarketOpen 
                          ? <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/5 border border-primary/20 text-[9px] font-bold text-primary tracking-widest uppercase">
                              <div className="w-1 h-1 bg-primary rounded-full animate-pulse" />
                              MARKET_OPEN
                            </div>
                          : <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-gray-500/5 border border-gray-500/20 text-[9px] font-bold text-gray-400 tracking-widest uppercase">
                              <div className="w-1 h-1 bg-gray-500 rounded-full" />
                              MARKET_CLOSED
                            </div>
                        }
                      </td>
                      <td className="px-6 py-5 text-right">
                        <Link href={`/assets/${vault.symbol.toLowerCase()}`}>
                          <Button className="h-7 px-4 bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground border border-primary/20 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all">
                            VIEW
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-border/10 text-[9px] text-foreground/40 font-black uppercase tracking-[0.2em]">
        <div className="flex items-center gap-4">
          <span>ORACLE: ONDO_SYNTHETIC_SHARES</span>
          <span className="text-primary/60">||</span>
          <span>BSC_MAINNET: CONNECTED</span>
        </div>
        <div className="flex items-center gap-4">
          <span>LAST_SYNC: {dataUpdatedAt ? new Date(dataUpdatedAt).toISOString() : "N/A"}</span>
          <span className="text-primary/60">||</span>
          <span>REFRESH: 30S</span>
        </div>
      </div>
    </div>
  )
}
