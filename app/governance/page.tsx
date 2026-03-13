"use client"

import { AppHeader } from "@/components/header"
import { AppFooter } from "@/components/footer"
import { motion } from "framer-motion"
import { ShieldCheck, History, Gavel, ArrowUpRight, Activity } from "lucide-react"
import { Button } from "@/components/ui/button"

import { useAccount, useReadContract, useWriteContract } from "wagmi"
import { creditManagerAbi, debtManagerAbi, liquidationControllerAbi } from "@/generated"
import { CONTRACT_ADDRESSES, MASTER_CHAIN_ID } from "@/lib/constants"
import { formatUnits } from "viem"

export default function GovernancePage() {
  const { address } = useAccount()
  const { writeContract, isPending: isLiquidating } = useWriteContract()

  const { data: totalDebtRaw } = useReadContract({
    address: CONTRACT_ADDRESSES[MASTER_CHAIN_ID].DEBT_MANAGER as `0x${string}`,
    abi: debtManagerAbi,
    functionName: "s_userDebt", // Simplified for demo or we'd aggregate
    args: [address!],
    query: { enabled: !!address }
  })

  const totalDebt = totalDebtRaw ? Number(formatUnits(totalDebtRaw as bigint, 18)) : 0

  return (
    <div className="min-h-screen bg-background font-mono">
      <main className="max-w-7xl mx-auto px-6 pt-32 pb-20">
        <header className="mb-16">
          <div className="flex items-center gap-3 mb-4 text-primary">
            <ShieldCheck className="w-5 h-5" />
            <span className="text-xs font-bold tracking-[0.3em] uppercase">Protocol Admin</span>
          </div>
          <h1 className="text-5xl font-black tracking-tighter mb-6">
            Liquidation & <br /> Global Governance
          </h1>
          <p className="text-foreground/50 max-w-2xl leading-relaxed">
            Monitor protocol health and trigger cross-chain liquidations for undercollateralized accounts. 
            Master Control on Avalanche manages the global debt registry across all linked networks.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-20">
          {/* Liquidation Queue */}
          <div className="lg:col-span-8 bg-card/20 border border-border/40 rounded-3xl p-8 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-bold flex items-center gap-3">
                <Gavel className="w-5 h-5 text-rose-500" />
                Active Liquidation Queue
              </h3>
              <div className="flex items-center gap-2">
                 <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                 <span className="text-[10px] text-rose-500 font-bold uppercase tracking-widest">3 Accounts Critical</span>
              </div>
            </div>

            <div className="space-y-4">
               {[
                 { user: "0x71C...49f", chain: "Polygon", health: "1.02", collateral: "$1,200", debt: "$1,150" },
                 { user: "0xa2b...3c1", chain: "Ethereum", health: "0.85", collateral: "$3,000", debt: "$3,500" },
                 { user: "0xf9e...d22", chain: "Base", health: "1.08", collateral: "$500", debt: "$450" },
               ].map((q, i) => (
                 <div key={i} className="flex flex-col md:flex-row md:items-center justify-between p-6 rounded-2xl bg-background/40 border border-border/20 group hover:border-rose-500/30 transition-colors">
                    <div className="mb-4 md:mb-0">
                       <div className="text-xs font-bold mb-1">{q.user}</div>
                       <div className="text-[10px] text-foreground/40 uppercase">{q.chain} Satellite Vault</div>
                    </div>
                    <div className="grid grid-cols-3 gap-8 mb-4 md:mb-0">
                       <div>
                          <div className="text-[9px] text-foreground/40 uppercase mb-1">Health</div>
                          <div className={`text-sm font-bold ${Number(q.health) < 1 ? 'text-rose-500' : 'text-amber-500'}`}>{q.health}</div>
                       </div>
                       <div>
                          <div className="text-[9px] text-foreground/40 uppercase mb-1">Debt</div>
                          <div className="text-sm font-bold">{q.debt}</div>
                       </div>
                       <div>
                          <div className="text-[9px] text-foreground/40 uppercase mb-1">Collateral</div>
                          <div className="text-sm font-bold">{q.collateral}</div>
                       </div>
                    </div>
                    <Button 
                      variant={Number(q.health) < 1 ? "destructive" : "outline"} 
                      className={`text-[10px] font-bold h-10 px-6 rounded-full uppercase tracking-tighter ${Number(q.health) >= 1 ? 'border-border/40 hover:bg-rose-500/10 hover:text-rose-500 hover:border-rose-500/50' : ''}`}
                    >
                       {Number(q.health) < 1 ? 'TRIGGER_LIQUIDATION' : 'MONITOR'}
                    </Button>
                 </div>
               ))}
            </div>
          </div>

          {/* Protocol Metrics */}
          <div className="lg:col-span-4 space-y-8">
             <div className="bg-background/20 border border-border/40 rounded-3xl p-8 backdrop-blur-sm">
                <h3 className="text-lg font-bold mb-6 flex items-center gap-3">
                   <Activity className="w-5 h-5 text-primary" />
                   Global Debt
                </h3>
                <div className="space-y-6">
                   <div>
                      <div className="text-[10px] text-foreground/40 uppercase tracking-widest mb-1">Total System Debt</div>
                      <div className="text-3xl font-black">${totalDebt.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                   </div>
                   <div className="pt-4 border-t border-border/20 space-y-3">
                      <div className="flex justify-between text-xs">
                         <span className="text-foreground/50">LTV Target</span>
                         <span className="font-bold">75.0%</span>
                      </div>
                      <div className="flex justify-between text-xs">
                         <span className="text-foreground/50">Current Avg LTV</span>
                         <span className="font-bold text-emerald-500">62.4%</span>
                      </div>
                   </div>
                </div>
             </div>

             <div className="bg-primary border border-primary/20 rounded-3xl p-8 text-primary-foreground relative overflow-hidden">
                <History className="absolute -bottom-4 -right-4 w-24 h-24 text-black/5 rotate-12" />
                <h3 className="text-lg font-bold mb-4 relative z-10">Admin Actions</h3>
                <div className="space-y-3 relative z-10">
                   <button className="w-full text-left bg-black/10 hover:bg-black/20 p-4 rounded-xl text-xs font-bold flex justify-between items-center transition-colors">
                      SET_FEE_PARAMETERS
                      <ArrowUpRight className="w-4 h-4" />
                   </button>
                   <button className="w-full text-left bg-black/10 hover:bg-black/20 p-4 rounded-xl text-xs font-bold flex justify-between items-center transition-colors">
                      EMERGENCY_PAUSE_MASTER
                      <ArrowUpRight className="w-4 h-4" />
                   </button>
                   <button className="w-full text-left bg-black/10 hover:bg-black/20 p-4 rounded-xl text-xs font-bold flex justify-between items-center transition-colors">
                      SYNC_PROTOCOL_STATE
                      <ArrowUpRight className="w-4 h-4" />
                   </button>
                </div>
             </div>
          </div>
        </div>
      </main>
      <AppFooter />
    </div>
  )
}


