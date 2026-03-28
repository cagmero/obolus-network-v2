"use client"

import { useAccount } from "wagmi"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { LandingPage } from "@/components/landing-page"
import { Zap, Activity, TrendingUp, Wallet, ArrowUpRight, ChevronRight, Lock } from "lucide-react"
import { VAULTS } from "@/lib/vaults"
import { cn } from "@/lib/utils"
import { useRecentTransactions } from "@/hooks/useVaults"

export default function Page() {
  const { isConnected, address } = useAccount()
  const recentTxns = useRecentTransactions()

  if (!isConnected) {
    return <LandingPage />
  }

  // Filter only vault-related transactions for the activity stream
  const vaultTxns = recentTxns.filter(tx => 
    tx.type.toLowerCase().includes('deposit') || 
    tx.type.toLowerCase().includes('withdraw')
  )

  return (
    <div className="flex flex-col gap-8 font-mono pb-20">
      {/* Header Info */}
      <div className="flex items-center justify-between border-b border-border/20 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tighter text-foreground">DASHBOARD // TERMINAL</h1>
          <p className="text-[10px] text-foreground/40 uppercase tracking-[0.2em] mt-1">
            System_Status: Operational // encrypted_session_active
          </p>
        </div>
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/5 text-[10px] text-primary font-bold tracking-wider uppercase">
          <div className="w-1 h-1 rounded-full bg-primary animate-pulse" />
          {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "CONNECTED"}
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "TOTAL_VAULTS", value: "9", icon: Activity, color: "text-primary" },
          { label: "PLATFORM_TVL", value: "$0.00", icon: TrendingUp, color: "text-foreground/80" },
          { label: "YOUR_DEPOSITS", value: "$0.00", icon: Wallet, color: "text-foreground/80" },
          { label: "YOUR_WEEKLY_YIELD", value: "$0.00", icon: Zap, color: "text-green-500" },
        ].map((stat, i) => (
          <div key={i} className="bg-card/20 border border-border/40 rounded-2xl p-5 backdrop-blur-sm group hover:border-primary/30 transition-all">
            <div className="flex items-center justify-between mb-3 text-foreground/40">
              <span className="text-[10px] font-bold tracking-widest uppercase">{stat.label}</span>
              <stat.icon className="w-4 h-4" />
            </div>
            <div className={cn("text-2xl font-bold tracking-tight", stat.color)}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Positions Table */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold tracking-widest text-foreground/60 uppercase">
              YOUR_POSITIONS // ACTIVE
            </h2>
            <Link href="/vaults">
              <Button variant="link" className="text-[10px] text-primary uppercase font-bold p-0 h-auto">
                BROWSE_ALL_VAULTS
              </Button>
            </Link>
          </div>

          <div className="bg-card/10 border border-border/30 rounded-2xl overflow-hidden backdrop-blur-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border/20 bg-white/5">
                    <th className="px-6 py-4 text-[10px] font-black text-foreground/40 uppercase tracking-widest">Vault</th>
                    <th className="px-6 py-4 text-[10px] font-black text-foreground/40 uppercase tracking-widest">APY</th>
                    <th className="px-6 py-4 text-[10px] font-black text-foreground/40 uppercase tracking-widest">Daily</th>
                    <th className="px-6 py-4 text-[10px] font-black text-foreground/40 uppercase tracking-widest text-right">Deposited</th>
                    <th className="px-6 py-4 text-[10px] font-black text-foreground/40 uppercase tracking-widest text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="hover:bg-white/5 transition-colors">
                    <td colSpan={5} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="bg-primary/10 p-4 rounded-full border border-primary/20">
                          <Lock className="w-6 h-6 text-primary/60" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-bold text-foreground">NO_ACTIVE_POSITIONS_DETECTED</p>
                          <p className="text-[10px] text-foreground/40 uppercase tracking-widest">Your assets are waiting in the vaults</p>
                        </div>
                        <Link href="/vaults">
                          <Button className="mt-2 bg-primary hover:bg-primary/90 text-primary-foreground font-black text-[10px] px-6 rounded-xl">
                            BROWSE_VAULTS
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Activity Stream */}
        <div className="lg:col-span-4 space-y-6 flex flex-col">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold tracking-widest text-foreground/60 uppercase">
              VAULT_ACTIVITY // LIVE
            </h2>
            <div className="flex items-center gap-1 text-[9px] text-primary font-bold">
              <div className="w-1 h-1 rounded-full bg-primary animate-pulse" />
              CONNECTED
            </div>
          </div>

          <div className="bg-card/20 border border-border/40 rounded-3xl p-6 backdrop-blur-sm flex flex-col h-full min-h-[450px]">
            <div className="space-y-6 flex-grow overflow-y-auto pr-2 custom-scrollbar">
              {vaultTxns.length > 0 ? (
                vaultTxns.map((tx, i) => (
                  <div key={i} className="flex gap-4 group cursor-pointer border-l-2 border-primary/10 hover:border-primary pl-4 transition-all py-1">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black tracking-widest uppercase text-foreground">
                          {tx.type}
                        </span>
                        <div className="text-[9px] px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 font-bold">
                          {tx.status}
                        </div>
                      </div>
                      <div className="text-[11px] text-foreground/50 font-medium">
                         Target: <span className="text-foreground/80">{tx.asset}</span> // Qty: <span className="text-foreground/80">{tx.amount}</span>
                      </div>
                      <div className="text-[9px] text-foreground/30 uppercase tracking-tighter">
                        {tx.time} // Tx: 0x{Math.random().toString(16).slice(2, 8)}...
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-3 py-10 opacity-30">
                  <Activity className="w-8 h-8" />
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em]">No_Events_Logged</p>
                </div>
              )}
            </div>

            <Link href="/transactions" className="mt-8 pt-4 border-t border-border/10 text-[9px] text-foreground/40 font-bold uppercase hover:text-primary transition-colors flex items-center justify-between group">
              <span>View Full Diagnostic Log</span>
              <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
