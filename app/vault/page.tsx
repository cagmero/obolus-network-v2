"use client"

import { motion } from "framer-motion"
import { Shield, Lock, Globe, Zap, AlertTriangle, ArrowRight, Activity } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useVaults } from "@/hooks/useVaults"

import CCIPVisualizer from "@/components/ccip-visualizer"

import { useAccount, useReadContract } from "wagmi"
import { creditManagerAbi } from "@/generated"
import { CONTRACT_ADDRESSES, MASTER_CHAIN_ID } from "@/lib/constants"
import { formatUnits } from "viem"

export default function VaultPage() {
  const { address } = useAccount()

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

  const { vaults, loading: vaultsLoading } = useVaults()

  const totalCollateral = totalCollateralRaw ? Number(formatUnits(totalCollateralRaw as bigint, 18)) : 0
  const creditLimit = creditLimitRaw ? Number(formatUnits(creditLimitRaw as bigint, 18)) : 0

  const CHAIN_MAP: Record<number, string> = {
    43113: "Avalanche Fuji",
    80002: "Polygon Amoy",
    11155111: "Ethereum Sepolia",
    84532: "Base Sepolia"
  }

  return (
    <div className="min-h-screen bg-background font-mono">
      <main className="max-w-7xl mx-auto px-6 pt-32 pb-20">
        <header className="mb-16">
          <div className="flex items-center gap-3 mb-4 text-primary">
            <Shield className="w-5 h-5" />
            <span className="text-xs font-bold tracking-[0.3em] uppercase">Cross-Chain Vault</span>
          </div>
          <h1 className="text-5xl font-black tracking-tighter mb-6">
            Shielded Collateral <br /> Powered by CCIP
          </h1>
          <p className="text-foreground/50 max-w-2xl leading-relaxed">
            uses Chainlink CCIP to link lending pools across Ethereum, Polygon, and Base.
            Your credit limit is calculated on Avalanche (Master Chain) while your assets stay in
            sovereign satellite vaults.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
          <div className="lg:col-span-2 space-y-8">
            {/* Master Chain Status */}
            <div className="bg-card/20 border border-border/40 rounded-3xl p-8 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Globe className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">Master Control (Avalanche)</h3>
                    <p className="text-[10px] text-foreground/40 uppercase">Credit Manager & Debt Registry</p>
                  </div>
                </div>
                <div className="px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/5 text-emerald-500 text-[10px] font-bold">
                  SYNC_SUCCESS
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <div>
                    <div className="text-[10px] text-foreground/40 uppercase tracking-widest mb-1">Total_Collateral_Value</div>
                    <div className="text-3xl font-bold">${totalCollateral.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-foreground/40 uppercase tracking-widest mb-1">Aggregated_Credit_Limit</div>
                    <div className="text-3xl font-bold text-primary">${creditLimit.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                  </div>
                </div>
                <div className="bg-background/40 border border-border/20 rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Health Factor</span>
                  </div>
                  <div className="text-4xl font-bold mb-2 text-emerald-500">2.14</div>
                  <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 w-[70%]" />
                  </div>
                  <p className="text-[9px] text-foreground/30 mt-3 uppercase leading-tight">
                    Liquidation threshold: 1.15 // Your position is highly secure across all 4 linked chains.
                  </p>
                </div>
              </div>
            </div>

            {/* CCIP Visualizer integrated here */}
            <CCIPVisualizer />
          </div>

          {/* Quick Stats Sidebar */}
          <div className="space-y-8">
            <div className="bg-primary/5 border border-primary/20 rounded-3xl p-8 relative overflow-hidden">
              <Zap className="absolute -top-6 -right-6 w-32 h-32 text-primary/5 rotate-12" />
              <h3 className="text-lg font-bold mb-6 relative z-10">Cross-Chain Activity</h3>
              <div className="space-y-6 relative z-10">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-foreground/50">Active Bridges</span>
                  <span className="text-xs font-bold font-mono">{vaults.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-foreground/50">Avg Sync Latency</span>
                  <span className="text-xs font-bold font-mono">~180s</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-foreground/50">Relay Fees (MTD)</span>
                  <span className="text-xs font-bold font-mono">0.42 LINK</span>
                </div>
                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold mt-4">
                  SYNC_NOW
                </Button>
              </div>
            </div>

            {/* Added a real-time terminal feel block */}
            <div className="bg-black/40 border border-border/40 rounded-3xl p-6 font-mono">
              <div className="flex items-center gap-2 mb-4 text-[10px] font-bold text-foreground/30">
                <Activity className="w-3 h-3" />
                RAW_EVENT_LOG
              </div>
              <div className="space-y-2 text-[9px] text-primary/60">
                <div>[08:14:02] Master: Received Credit_Update from Chain 101</div>
                <div>[08:13:58] Satellite: commit_checkpoint Polygon_Vault</div>
                <div>[08:12:45] Master: Recalculating user_tvl 0x71...49f</div>
                <div className="animate-pulse">_</div>
              </div>
            </div>
          </div>
        </div>

        {/* Linked Vaults */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold tracking-tight">Linked Satellite Vaults</h2>
            <div className="flex gap-4">
              <Link href="/vault/bridge">
                <Button className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground text-xs gap-2 px-6">
                  <span>BRIDGE_COLLATERAL</span>
                  <ArrowRight className="w-3 h-3" />
                </Button>
              </Link>
              <Button variant="outline" className="rounded-full border-border/40 text-xs gap-2">
                <Link href="/vault/link" className="flex items-center gap-2">
                  <span>ADD_NEW_CHAIN</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {vaultsLoading ? (
              <div className="col-span-full py-20 text-center text-foreground/30 text-xs uppercase tracking-widest animate-pulse">
                Synthesizing_Vault_Data...
              </div>
            ) : vaults.map((v, i) => (
              <div key={i} className="bg-card/10 border border-border/30 rounded-2xl p-6 hover:border-primary/40 transition-colors group">
                <div className="flex justify-between items-start mb-6">
                  <div className={`text-[9px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500`}>
                    SYNCED
                  </div>
                  <Lock className="w-4 h-4 text-foreground/20 group-hover:text-primary transition-colors" />
                </div>
                <div className="text-[10px] text-foreground/40 uppercase mb-1">{CHAIN_MAP[v.chain_id] || "Unknown Chain"}</div>
                <div className="text-xl font-bold mb-4">{v.total_assets.toLocaleString()} {v.asset_symbol}</div>
                <div className="text-sm font-mono text-foreground/60">${(v.total_assets * 1).toLocaleString()}</div> {/* Placeholder USD math */}
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}


