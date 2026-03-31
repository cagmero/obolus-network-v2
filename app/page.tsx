"use client"

import { useAccount } from "wagmi"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { LandingPage } from "@/components/landing-page"
import { Activity, TrendingUp, Wallet, ArrowUpRight, Lock, Zap } from "lucide-react"
import { VAULTS } from "@/lib/vaults"
import { cn } from "@/lib/utils"
import { useRecentTransactions, useUserProfile, usePlatformTVL, useVaultPositions } from "@/hooks/useVaults"
import { SwapWidget } from "@/components/swap-widget"

export default function Page() {
  const { isConnected, address } = useAccount()
  const { data: userProfile } = useUserProfile()
  const { data: platformTvl } = usePlatformTVL()
  const { data: positionsData } = useVaultPositions()
  const { data: recentTxnsData } = useRecentTransactions()
  const recentTxns = recentTxnsData?.transactions ?? []

  if (!isConnected) {
    return <LandingPage />
  }

  const positions = positionsData?.positions || []

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
          { label: "TOTAL_VAULTS", value: VAULTS.length.toString(), icon: Activity, color: "text-primary" },
          { label: "PLATFORM_USERS", value: platformTvl?.totalPositions?.toString() || "0", icon: TrendingUp, color: "text-foreground/80" },
          { label: "YOUR_DEPOSITS", value: `${userProfile?.totalDepositsUSD?.toFixed(2) || "0.00"}`, icon: Wallet, color: "text-foreground/80" },
          { label: "YOUR_TIER", value: userProfile?.tier?.toUpperCase() || "BRONZE", icon: Zap, color: "text-green-500" },
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

      {/* Main Content: Swap + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Swap Widget — Primary */}
        <div className="lg:col-span-5 space-y-6">
          <SwapWidget />
        </div>

        {/* Positions + Activity */}
        <div className="lg:col-span-7 space-y-6">
          {/* Positions Table */}
          <div>
            <div className="flex items-center justify-between mb-4">
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
                      <th className="px-5 py-3 text-[10px] font-black text-foreground/40 uppercase tracking-widest">Vault</th>
                      <th className="px-5 py-3 text-[10px] font-black text-foreground/40 uppercase tracking-widest">Address</th>
                      <th className="px-5 py-3 text-[10px] font-black text-foreground/40 uppercase tracking-widest text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {positions.length > 0 ? (
                      positions.map((pos: any, i: number) => {
                        const vault = VAULTS.find(v => v.symbol.toLowerCase() === pos.vaultId.toLowerCase())
                        return (
                          <tr key={i} className="hover:bg-white/5 transition-colors">
                            <td className="px-5 py-3 flex items-center gap-3">
                              <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-black text-xs">
                                {vault?.symbol?.[0] || 'V'}
                              </div>
                              <div className="flex flex-col">
                                <span className="text-xs font-bold text-foreground capitalize">{pos.vaultId}</span>
                                <span className="text-[9px] text-foreground/40 uppercase tracking-widest">{vault?.symbol || "TOKEN"}</span>
                              </div>
                            </td>
                            <td className="px-5 py-3 text-[10px] font-mono text-foreground/60">{pos.tokenAddress.slice(0, 10)}...</td>
                            <td className="px-5 py-3 text-right">
                              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20 text-[9px] font-black text-green-500 tracking-widest uppercase">
                                <div className="w-1 h-1 bg-green-500 rounded-full" />
                                {pos.status}
                              </div>
                            </td>
                          </tr>
                        )
                      })
                    ) : (
                      <tr>
                        <td colSpan={3} className="px-5 py-12 text-center">
                          <div className="flex flex-col items-center gap-3">
                            <div className="bg-primary/10 p-3 rounded-full border border-primary/20">
                              <Lock className="w-5 h-5 text-primary/60" />
                            </div>
                            <p className="text-xs font-bold text-foreground">NO_ACTIVE_POSITIONS</p>
                            <Link href="/vaults">
                              <Button className="mt-1 bg-primary hover:bg-primary/90 text-primary-foreground font-black text-[10px] px-5 rounded-xl">
                                BROWSE_VAULTS
                              </Button>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Activity Stream */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-bold tracking-widest text-foreground/60 uppercase">
                VAULT_ACTIVITY // LIVE
              </h2>
              <div className="flex items-center gap-1 text-[9px] text-primary font-bold">
                <div className="w-1 h-1 rounded-full bg-primary animate-pulse" />
                CONNECTED
              </div>
            </div>

            <div className="bg-card/20 border border-border/40 rounded-2xl p-5 backdrop-blur-sm">
              <div className="space-y-4 max-h-[250px] overflow-y-auto pr-2">
                {recentTxns.length > 0 ? (
                  recentTxns.map((tx: any, i: number) => (
                    <div key={i} className="flex gap-4 group cursor-pointer border-l-2 border-primary/10 hover:border-primary pl-4 transition-all py-1">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black tracking-widest uppercase text-foreground">
                            {tx.intentType}
                          </span>
                          <div className="text-[9px] px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 font-bold uppercase">
                            {tx.status}
                          </div>
                        </div>
                        <div className="text-[11px] text-foreground/50 font-medium capitalize">
                          Target: <span className="text-foreground/80">{tx.vaultId}</span>
                        </div>
                        <div className="text-[9px] text-foreground/30 uppercase tracking-tighter">
                          {new Date(tx.createdAt).toLocaleTimeString()} // Tx: {tx.txHash?.slice(0, 10)}...
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center text-center space-y-2 py-8 opacity-30">
                    <Activity className="w-6 h-6" />
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em]">No_Events_Logged</p>
                  </div>
                )}
              </div>

              <Link href="/transactions" className="mt-4 pt-3 border-t border-border/10 text-[9px] text-foreground/40 font-bold uppercase hover:text-primary transition-colors flex items-center justify-between group">
                <span>View Full Diagnostic Log</span>
                <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
