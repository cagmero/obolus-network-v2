"use client"

import { ConnectGate } from "@/components/connect-gate"
import { Button } from "@/components/ui/button"
import { Globe, TrendingUp, TrendingDown, Clock, Shield, Search, Zap } from "lucide-react"
import { GM_TOKENS } from "@/lib/constants"
import Link from "next/link"
import { useGMTokenPrices, usePerformanceData, DEMO_MODE } from "@/hooks/useVaults"
import { formatUnits } from "viem"
import { Skeleton } from "@/components/ui/skeleton"
import { TerminalLoader } from "@/components/terminal-loader"
import { TerminalErrorDisplay } from "@/components/terminal-error-display"
import { useAccount, useChainId } from "wagmi"

export default function MarketsPage() {
  const { data: prices, loading: pricesLoading } = useGMTokenPrices()
  const { change24h } = usePerformanceData()
  const { address, isConnected } = useAccount()
  const chainId = useChainId()

  if (isConnected && pricesLoading && !DEMO_MODE) {
    return <TerminalLoader />
  }

  if (isConnected && chainId !== 7202 && chainId !== 97 && chainId !== 56) {
    return <TerminalErrorDisplay />
  }

  return (
    <ConnectGate>
      <div className="flex flex-col gap-8 py-8 font-mono">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold tracking-[0.2em] text-foreground/50 uppercase">
            MARKETS // GM_TOKEN_FEED
          </h2>
          <div className="flex items-center gap-2 px-2 py-0.5 rounded border border-primary/30 bg-primary/5 text-[10px] text-primary font-bold tracking-wider uppercase">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            ONDO_ORACLE_LIVE
          </div>
        </div>

        {/* Top Stats Bar */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card rounded-2xl p-8 border-l-4 border-l-primary/40 relative overflow-hidden group">
            <p className="text-foreground/50 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">Tracked Assets</p>
            <div className="flex items-baseline gap-2">
              <h1 className="text-white text-5xl font-black tracking-tighter tabular-nums">4</h1>
              <span className="text-primary font-bold text-xs tracking-widest uppercase">GM_TOKENS</span>
            </div>
            <Globe className="absolute -bottom-2 -right-2 w-16 h-16 text-primary/5 group-hover:text-primary/10 transition-colors" />
          </div>

          <div className="glass-card rounded-2xl p-8 border-l-4 border-l-white/10 relative overflow-hidden group">
            <p className="text-foreground/50 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">Oracle Source</p>
            <div className="flex items-baseline gap-2">
              <h1 className="text-white text-2xl font-black tracking-tighter tabular-nums truncate">ONDO_SYNTHETIC</h1>
            </div>
            <TrendingUp className="absolute -bottom-2 -right-2 w-16 h-16 text-white/5 group-hover:text-white/10 transition-colors" />
          </div>

          <div className="glass-card rounded-2xl p-8 border-l-4 border-l-white/10 relative overflow-hidden group">
            <p className="text-foreground/50 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">Last Update</p>
            <div className="flex items-baseline gap-2">
              <h1 className="text-white text-5xl font-black tracking-tighter tabular-nums">{pricesLoading && !DEMO_MODE ? "SYNC..." : "LIVE"}</h1>
            </div>
            <Clock className="absolute -bottom-2 -right-2 w-16 h-16 text-white/5 group-hover:text-white/10 transition-colors" />
          </div>
        </section>

        {/* Asset Price Matrix */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-white text-lg font-bold tracking-tight uppercase tracking-wider">ASSET_PRICE_MATRIX</h2>
          </div>
          
          <div className="glass-card rounded-2xl border-border/10 overflow-hidden">
            <div className="overflow-x-auto overflow-y-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-white/5 border-b border-white/10 text-[10px] font-bold uppercase tracking-widest text-white/40">
                    <th className="px-6 py-4">Asset</th>
                    <th className="px-6 py-4">Underlying</th>
                    <th className="px-6 py-4">Price USD</th>
                    <th className="px-6 py-4">24H Change</th>
                    <th className="px-6 py-4">Market Status</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {Object.entries(GM_TOKENS).map(([key, token]) => {
                    const price = (prices as Record<string, bigint>)[token.symbol] || BigInt(0)
                    return (
                      <tr key={key} className="group hover:bg-white/[0.04] transition-all">
                        <td className="px-6 py-6 font-bold flex items-center gap-3 tracking-tight">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: token.color }} />
                          {token.symbol}
                        </td>
                        <td className="px-6 py-6 text-foreground/40 font-bold tabular-nums text-xs uppercase">{token.name}</td>
                        <td className="px-6 py-6 font-black tabular-nums tracking-tighter text-lg">
                           {pricesLoading && !DEMO_MODE ? <Skeleton className="h-6 w-24 bg-white/5" /> : `$${formatUnits(price, 18)}`}
                        </td>
                        <td className="px-6 py-6 font-bold tabular-nums text-sm text-primary">
                          {change24h} <TrendingUp className="inline ml-1 size-3" />
                        </td>
                        <td className="px-6 py-6">
                           <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded-full bg-primary/5 border border-primary/20 text-[9px] font-bold text-primary tracking-widest uppercase">
                             <div className="size-1 bg-primary rounded-full" />
                             OPEN
                           </div>
                        </td>
                        <td className="px-6 py-6 text-right">
                           <Link href={`/vault?token=${token.symbol}`}>
                             <Button className="h-8 px-4 bg-primary hover:bg-primary/90 text-primary-foreground font-black text-[10px] tracking-widest uppercase rounded-lg">
                               DEPOSIT
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
        </section>

        {/* Oracle Status section */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
           <div className="bg-primary/5 border border-primary/20 rounded-2xl p-8 flex flex-col items-center justify-center text-center space-y-4 group">
              <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                 <Shield className="size-6" />
              </div>
              <div>
                 <h3 className="text-white text-xs font-bold tracking-widest uppercase">ONDO_ORACLE_RELAY</h3>
                 <div className="mt-2 flex items-center justify-center gap-2 text-primary font-bold text-[10px] tracking-widest uppercase">
                    <div className="size-1.5 bg-primary rounded-full animate-pulse" />
                    CONNECTED
                 </div>
              </div>
           </div>
           <div className="bg-white/5 border border-white/10 rounded-2xl p-8 flex flex-col items-center justify-center text-center space-y-4 group">
              <div className="size-12 rounded-xl bg-white/5 flex items-center justify-center text-white/40 group-hover:scale-110 transition-transform">
                 <Zap className="size-6" />
              </div>
              <div>
                 <h3 className="text-white text-xs font-bold tracking-widest uppercase">BSC_MAINNET_SYNC</h3>
                 <div className="mt-2 flex items-center justify-center gap-2 text-white/40 font-bold text-[10px] tracking-widest uppercase">
                    <div className="size-1.5 bg-white/20 rounded-full" />
                    SYNCED // Block_Latest
                 </div>
              </div>
           </div>
        </section>
      </div>
    </ConnectGate>
  )
}
