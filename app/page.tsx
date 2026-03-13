"use client"

import useSWR from "swr"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { Zap, History, ArrowUpRight, ChevronRight, CreditCard } from "lucide-react"
import { useAccount, useReadContract } from "wagmi"
import { LandingPage } from "@/components/landing-page"
import { creditManagerAbi, debtManagerAbi } from "@/generated"
import { CONTRACT_ADDRESSES, MASTER_CHAIN_ID } from "@/lib/constants"
import { formatUnits } from "viem"

export default function Page() {
  const { address, isConnected } = useAccount()

  const { data: txData } = useSWR("/api/transactions", (url) => fetch(url).then(r => r.json()))

  // Real contract reads
  const { data: totalCollateralRaw } = useReadContract({
    address: CONTRACT_ADDRESSES[MASTER_CHAIN_ID].CREDIT_MANAGER as `0x${string}`,
    abi: creditManagerAbi,
    functionName: "s_userTotalCollateralUSD",
    args: [address!],
    query: { enabled: !!address }
  })

  const { data: creditLimitRaw } = useReadContract({
    address: CONTRACT_ADDRESSES[MASTER_CHAIN_ID].CREDIT_MANAGER as `0x${string}`,
    abi: creditManagerAbi,
    functionName: "getCreditLimit",
    args: [address!],
    query: { enabled: !!address }
  })

  const { data: debtRaw } = useReadContract({
    address: CONTRACT_ADDRESSES[MASTER_CHAIN_ID].DEBT_MANAGER as `0x${string}`,
    abi: debtManagerAbi,
    functionName: "getDebt",
    args: [address!],
    query: { enabled: !!address }
  })

  if (!isConnected) {
    return <LandingPage />
  }

  const total = creditLimitRaw ? Number(formatUnits(creditLimitRaw as bigint, 18)) : 0
  const used = debtRaw ? Number(formatUnits(debtRaw as bigint, 18)) : 0
  const available = Math.max(0, total - used)
  const pct = total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 0

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-mono">
      {/* Main Content */}
      <div className="lg:col-span-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold tracking-[0.2em] text-foreground/50 uppercase">
            Credit Analytics // Terminal
          </h2>
          <div className="flex items-center gap-2 px-2 py-0.5 rounded border border-primary/30 bg-primary/5 text-[10px] text-primary font-bold tracking-wider uppercase">
            <div className="w-1 h-1 rounded-full bg-primary animate-pulse" />
            Active_Session
          </div>
        </div>

        {/* Core Metrics */}
        <div className="bg-card/20 border border-border/40 rounded-2xl p-6 backdrop-blur-sm relative overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
            {/* Liquidity */}
            <div className="space-y-4">
              <div>
                <div className="text-[10px] text-foreground/50 uppercase tracking-widest mb-1">Available Liquidity</div>
                <div className="text-5xl font-bold tracking-tight text-foreground">
                  ${available.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
                <div className="text-[10px] text-foreground/30 uppercase mt-2">
                  Sys_Total_Limit: ${total.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Utilization */}
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <div className="text-[10px] text-foreground/50 uppercase tracking-widest">Utilization_Rate</div>
                <div className="text-sm font-bold text-primary">{pct}%</div>
              </div>
              <div className="h-3 bg-secondary rounded-full overflow-hidden border border-border/20">
                <div
                  className="h-full bg-primary shadow-[0_0_10px_rgba(var(--primary),0.5)] transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-foreground/40 uppercase">
                <span>Debt: ${(used).toFixed(2)}</span>
                <span>Buffer: ${available.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-border/20">
            <div className="text-[10px] text-foreground/50 uppercase tracking-widest mb-4">Upcoming Obligations</div>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-background/40 border border-border/30 rounded-xl p-4">
                <div className="text-[9px] text-foreground/40 uppercase mb-2">Next Settlement</div>
                <div className="text-sm font-bold">Oct 24</div>
              </div>
              <div className="bg-background/40 border border-border/30 rounded-xl p-4">
                <div className="text-[9px] text-foreground/40 uppercase mb-2">Minimum Due</div>
                <div className="text-sm font-bold text-primary">$12.40</div>
              </div>
              <div className="bg-background/40 border border-border/30 rounded-xl p-4">
                <div className="text-[9px] text-foreground/40 uppercase mb-2">Accrued Interest</div>
                <div className="text-sm font-bold">0.0021 BTC</div>
              </div>
            </div>
          </div>
        </div>

        {/* Network Nodes */}
        <div className="bg-card/20 border border-border/40 rounded-2xl p-6 backdrop-blur-sm">
          <div className="text-[10px] text-foreground/50 uppercase tracking-widest mb-6">Network Nodes & Partners</div>
          <div className="overflow-x-auto scrollbar-hide">
            <div className="flex gap-6 pb-2">
              {[
                { name: "Zomato", logo: "/logos/zomato.svg" },
                { name: "Swiggy", logo: "/logos/swiggy.png" },
                { name: "Uber", logo: "/logos/uber.svg" },
                { name: "Netflix", logo: "/logos/netflix.svg" },
                { name: "Spotify", logo: "/logos/spotify.svg" },
                { name: "Google", logo: "/logos/google.svg" },
                { name: "Microsoft", logo: "/logos/microsoft.svg" },
                { name: "Amazon", logo: "/logos/amazon.svg" },
                { name: "Apple", logo: "/logos/apple.png" },
              ].map((partner, i) => (
                <div
                  key={i}
                  className="flex-shrink-0 w-12 h-12 rounded-xl bg-secondary/50 border border-border/30 flex items-center justify-center grayscale hover:grayscale-0 transition-all cursor-pointer overflow-hidden p-2"
                >
                  <Image
                    src={partner.logo}
                    alt={partner.name}
                    width={32}
                    height={32}
                    className="object-contain"
                    unoptimized
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="lg:col-span-4 space-y-6">
        {/* Quick Actions */}
        <div className="bg-card/20 border border-border/40 rounded-2xl p-6 backdrop-blur-sm space-y-4">
          <div className="text-[10px] text-foreground/50 uppercase tracking-widest mb-2">Quick Actions</div>
          <Link href="/checkout" className="block">
            <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-6 rounded-xl flex items-center justify-center gap-3 group">
              <Zap className="w-5 h-5 fill-current group-hover:scale-110 transition-transform" />
              <span>EXECUTE_PAYMENT</span>
            </Button>
          </Link>
          <Link href="/transactions" className="block">
            <Button variant="secondary" className="w-full bg-secondary hover:bg-secondary/80 text-foreground font-bold py-6 rounded-xl flex items-center justify-center gap-3">
              <History className="w-5 h-5" />
              <span>QUERY_HISTORY</span>
            </Button>
          </Link>
          <Link href="/limits" className="block">
            <Button variant="secondary" className="w-full bg-secondary hover:bg-secondary/80 text-foreground font-bold py-6 rounded-xl flex items-center justify-center gap-3">
              <ArrowUpRight className="w-5 h-5" />
              <span>LIMIT_EXPANSION</span>
            </Button>
          </Link>
          <Link href="/repay" className="block">
            <Button variant="outline" className="w-full border-primary/20 hover:bg-primary/5 text-primary font-bold py-6 rounded-xl flex items-center justify-center gap-3">
              <CreditCard className="w-5 h-5" />
              <span>SETTLE_DEBT</span>
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

          <div className="space-y-6 flex-grow">
            {txData?.transactions?.map((tx: any, i: number) => (
              <div key={i} className="flex gap-4 group cursor-pointer">
                <div className="w-0.5 bg-primary/20 group-hover:bg-primary transition-colors" />
                <div className="space-y-1">
                  <div className="text-[10px] font-bold tracking-wider uppercase text-foreground/90">
                    TX_{Math.random().toString(36).substring(7).toUpperCase()}_AUTH
                  </div>
                  <div className="text-[11px] text-foreground/50">
                    Merchant: {tx.title} // -${tx.amount.toFixed(2)}
                  </div>
                </div>
                <div className="ml-auto text-[10px] text-foreground/20 whitespace-nowrap">
                  {i === 0 ? "2M AGO" : i === 1 ? "1H AGO" : "4H AGO"}
                </div>
              </div>
            ))}

            {/* Extra mock records to fill space */}
            <div className="flex gap-4 group cursor-pointer opacity-50">
              <div className="w-0.5 bg-primary/20 group-hover:bg-primary transition-colors" />
              <div className="space-y-1">
                <div className="text-[10px] font-bold tracking-wider uppercase text-foreground/90">
                  SYS_LIMIT_UP
                </div>
                <div className="text-[11px] text-foreground/50">
                  Score update: +$50.00 ceiling
                </div>
              </div>
              <div className="ml-auto text-[10px] text-foreground/20 whitespace-nowrap">
                1D AGO
              </div>
            </div>
          </div>

          <Link href="/transactions" className="mt-8 text-[10px] text-foreground/40 uppercase hover:text-primary transition-colors flex items-center gap-2 group">
            View Full Manifest
            <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  )
}
