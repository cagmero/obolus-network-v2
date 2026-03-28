"use client"

import useSWR from "swr"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { Zap, History, ArrowUpRight, ChevronRight, Lock, Eye, BarChart3, ArrowDownLeft } from "lucide-react"
import { useAccount } from "wagmi"
import { LandingPage } from "@/components/landing-page"
import { GM_TOKENS } from "@/lib/constants"
import { cn } from "@/lib/utils"
import { usePerformanceData, useRecentTransactions, DEMO_MODE } from "@/hooks/useVaults"

export default function Page() {
  const { address, isConnected } = useAccount()
  const { change24h, volatility, alpha } = usePerformanceData()
  const recentTxns = useRecentTransactions()

  if (!isConnected) {
    return <LandingPage />
  }

  return (
    <div className="flex flex-col gap-6 font-mono">
      {/* Demo Mode Banner */}
      {DEMO_MODE && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 flex items-center justify-between group">
           <div className="flex items-center gap-3">
              <div className="size-2 rounded-full bg-yellow-500 animate-pulse" />
              <span className="text-yellow-500 text-[10px] font-black uppercase tracking-widest">
                DEMO_MODE_ACTIVE // VIEWING SAMPLE VAULT STATE // CONNECT WALLET TO USE LIVE DATA
              </span>
           </div>
           <Button variant="ghost" className="h-6 text-[9px] text-yellow-500/60 uppercase font-black hover:bg-yellow-500/10">Dismiss</Button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Main Content */}
      <div className="lg:col-span-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold tracking-[0.2em] text-foreground/50 uppercase">
            VAULT_ANALYTICS // TERMINAL
          </h2>
          <div className="flex items-center gap-2 px-2 py-0.5 rounded border border-primary/30 bg-primary/5 text-[10px] text-primary font-bold tracking-wider uppercase">
            <div className="w-1 h-1 rounded-full bg-primary animate-pulse" />
            Active_Vault_Session
          </div>
        </div>

        {/* Core Metrics */}
        <div className="bg-card/20 border border-border/40 rounded-2xl p-6 backdrop-blur-sm relative overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
            {/* Liquidity */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-[10px] text-foreground/50 uppercase tracking-widest mb-1">Portfolio NAV</div>
                  <div className="text-2xl font-bold tracking-tight text-primary flex items-center gap-2">
                    $24,890.00
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-foreground/50 uppercase tracking-widest mb-1">Active Positions</div>
                  <div className="text-2xl font-bold tracking-tight text-foreground">
                    4
                  </div>
                </div>
              </div>
              <div className="pt-4">
                <div className="text-[10px] text-foreground/50 uppercase tracking-widest mb-1">Vault Balance</div>
                <div className="text-5xl font-bold tracking-tight text-foreground">
                  $12,450.00
                </div>
                <div className="text-[10px] text-primary uppercase mt-2">
                  System_Status: Operational // fhEVM_Active
                </div>
              </div>
            </div>

            {/* Performance */}
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <div className="text-[10px] text-foreground/50 uppercase tracking-widest">Portfolio_Performance</div>
                <div className="text-sm font-bold text-primary">{change24h}</div>
              </div>
              <div className="h-3 bg-secondary rounded-full overflow-hidden border border-border/20">
                <div
                  className="h-full bg-primary shadow-[0_0_10px_rgba(var(--primary),0.5)] transition-all duration-500"
                  style={{ width: `75%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-foreground/40 uppercase">
                <span>Volatility: {volatility}</span>
                <span>Alpha: {alpha}</span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-border/20">
            <div className="text-[10px] text-foreground/50 uppercase tracking-widest mb-4">Holdings_Summary</div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(GM_TOKENS).map(([key, token]) => (
                <div key={key} className="bg-background/40 border border-border/30 rounded-xl p-4 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-[9px] font-bold uppercase" style={{ color: token.color }}>{token.symbol}</div>
                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-bold text-foreground/80">{token.name}</div>
                    <div className="bg-primary/10 border border-primary/20 rounded px-1.5 py-0.5 text-[8px] text-primary font-bold flex items-center gap-1">
                      <Lock className="w-2 h-2" />
                      ENCRYPTED
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Asset Chips */}
        <div className="bg-card/20 border border-border/40 rounded-2xl p-6 backdrop-blur-sm">
          <div className="text-[10px] text-foreground/50 uppercase tracking-widest mb-6">Tokenized Assets // GM Terminal</div>
          <div className="flex flex-wrap gap-4">
            {Object.entries(GM_TOKENS).map(([key, token]) => (
              <div
                key={key}
                className="flex items-center gap-3 px-4 py-2 rounded-xl bg-background/60 border border-border/30 hover:border-primary/40 transition-all cursor-pointer group"
              >
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: token.color }} />
                <div className="text-[10px] font-bold tracking-widest text-foreground/70 group-hover:text-primary transition-colors">
                  {token.symbol}
                </div>
              </div>
            ))}
            <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-background/60 border border-border/30 hover:border-primary/40 transition-all cursor-pointer group">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <div className="text-[10px] font-bold tracking-widest text-foreground/70 group-hover:text-primary transition-colors">
                USDon
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="lg:col-span-4 space-y-6">
        {/* Quick Actions */}
        <div className="bg-card/20 border border-border/40 rounded-2xl p-6 backdrop-blur-sm space-y-4">
          <div className="text-[10px] text-foreground/50 uppercase tracking-widest mb-2">Quick Actions // Execute</div>
          <Link href="/vault" className="block">
            <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-6 rounded-xl flex items-center justify-center gap-3 group">
              <Zap className="w-5 h-5 fill-current group-hover:scale-110 transition-transform" />
              <span>DEPOSIT_ASSETS</span>
            </Button>
          </Link>
          <Button variant="secondary" className="w-full bg-secondary hover:bg-secondary/80 text-foreground font-bold py-6 rounded-xl flex items-center justify-center gap-3">
            <Eye className="w-5 h-5" />
            <span>REVEAL_BALANCE</span>
          </Button>
          <Link href="/portfolio" className="block">
            <Button variant="secondary" className="w-full bg-secondary hover:bg-secondary/80 text-foreground font-bold py-6 rounded-xl flex items-center justify-center gap-3">
              <BarChart3 className="w-5 h-5" />
              <span>VIEW_PORTFOLIO</span>
            </Button>
          </Link>
          <Link href="/vault" className="block">
            <Button variant="outline" className="w-full border-primary/20 hover:bg-primary/5 text-primary font-bold py-6 rounded-xl flex items-center justify-center gap-3">
              <ArrowDownLeft className="w-5 h-5" />
              <span>WITHDRAW_VAULT</span>
            </Button>
          </Link>
        </div>

        {/* Activity Stream */}
        <div className="bg-card/20 border border-border/40 rounded-2xl p-6 backdrop-blur-sm flex flex-col h-full min-h-[400px]">
          <div className="flex items-center justify-between mb-6">
            <div className="text-[10px] text-foreground/50 uppercase tracking-widest">Activity Stream</div>
            <div className="flex items-center gap-1.5 text-[10px] text-foreground/30 uppercase">
              Live
              <div className="w-1 h-1 rounded-full bg-primary animate-pulse" />
            </div>
          </div>

          <div className="space-y-6 flex-grow overflow-y-auto">
            {recentTxns.map((tx, i) => (
              <div key={i} className="flex gap-4 group cursor-pointer">
                <div className={cn(
                  "w-0.5 transition-colors",
                  tx.status === 'CONFIRMED' ? "bg-primary/20 group-hover:bg-primary" : "bg-yellow-500/20 group-hover:bg-yellow-500"
                )} />
                <div className="space-y-1">
                  <div className="text-[10px] font-bold tracking-wider uppercase text-foreground/90">
                    {tx.type}
                  </div>
                  <div className="text-[11px] text-foreground/50">
                     Asset: {tx.asset} // Amount: {tx.amount}
                  </div>
                </div>
                <div className="ml-auto text-[10px] text-foreground/20 whitespace-nowrap">
                  {tx.time}
                </div>
              </div>
            ))}
          </div>

          <Link href="/transactions" className="mt-8 text-[10px] text-foreground/40 uppercase hover:text-primary transition-colors flex items-center gap-2 group">
            View Full Manifest
            <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
      </div>
    </div>
  )
}
