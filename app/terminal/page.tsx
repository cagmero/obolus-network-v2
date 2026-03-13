"use client"

import { Globe, Cpu, Server, Layers, RefreshCw, Activity } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { useAccount, useReadContract } from "wagmi"
import { creditManagerAbi, debtManagerAbi } from "@/generated"
import { CONTRACT_ADDRESSES, MASTER_CHAIN_ID } from "@/lib/constants"
import { formatUnits } from "viem"

export default function TerminalPage() {
   const { address } = useAccount()
   const [pools, setPools] = useState<any[]>([]);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      async function fetchPools() {
         try {
            const response = await fetch('/api/pools');
            const data = await response.json();
            if (Array.isArray(data)) {
               setPools(data);
            }
         } catch (error) {
            console.error("Failed to fetch pools:", error);
         } finally {
            setLoading(false);
         }
      }
      fetchPools();
   }, []);

   // 1. Fetch Real User Debt
   const { data: debtRaw } = useReadContract({
      address: CONTRACT_ADDRESSES[MASTER_CHAIN_ID].DEBT_MANAGER as `0x${string}`,
      abi: debtManagerAbi,
      functionName: "getDebt",
      args: [address!],
      query: { enabled: !!address }
   })

   // 2. Fetch Real User Credit Limit
   const { data: creditRaw } = useReadContract({
      address: CONTRACT_ADDRESSES[MASTER_CHAIN_ID].CREDIT_MANAGER as `0x${string}`,
      abi: creditManagerAbi,
      functionName: "getCreditLimit",
      args: [address!],
      query: { enabled: !!address }
   })

   const userDebt = debtRaw ? Number(formatUnits(debtRaw as bigint, 18)) : 0
   const userCredit = creditRaw ? Number(formatUnits(creditRaw as bigint, 18)) : 0

   return (
      <div className="min-h-screen bg-background text-foreground font-mono selection:bg-primary selection:text-background relative overflow-x-hidden">
         <div className="terminal-grid" />

         <main className="flex-1 flex flex-col py-12 px-6 lg:px-40 gap-8 relative z-10">
            {/* Top Header */}
            <div className="flex items-center justify-between mb-8 shrink-0">
               <div className="flex items-center gap-3">
                  <div className="size-3 bg-primary rounded-full animate-pulse shadow-[0_0_12px_#A6F24A]" />
                  <h1 className="text-xl font-bold tracking-widest uppercase">LENDING_REGISTRY // V1.4.2</h1>
               </div>
               <div className="flex items-center gap-4">
                  <div className="text-[10px] text-foreground/40 font-bold uppercase tracking-widest">
                     Network_Load: <span className="text-primary font-bold">OPTIMAL</span>
                  </div>
                  <Button variant="secondary" className="text-[10px] h-8 rounded-sm font-bold uppercase tracking-tighter bg-white/5 border border-white/10 hover:bg-white/10">
                     EXPORT_MANIFEST
                  </Button>
               </div>
            </div>

            {/* Dashboard Grid */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 overflow-hidden min-h-0">
               {/* Left Column: Chain Explorer */}
               <div className="lg:col-span-1 glass-card border border-white/5 rounded-2xl flex flex-col overflow-hidden">
                  <div className="p-4 border-b border-white/5 bg-white/5">
                     <h3 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                        <Globe className="w-4 h-4 text-primary" />
                        Active_Chains
                     </h3>
                  </div>
                  <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                     {loading ? (
                        <div className="p-8 text-center opacity-20 animate-pulse">
                           <span className="text-[10px] uppercase tracking-widest font-bold">Relay_Syncing...</span>
                        </div>
                     ) : pools.map((pool, i) => (
                        <div key={i} className="p-4 rounded-xl border border-transparent hover:border-primary/20 hover:bg-primary/5 transition-all cursor-pointer group">
                           <div className="flex items-center justify-between mb-2">
                              <span className="text-[11px] font-bold text-foreground/80 group-hover:text-primary transition-colors">{pool.chain_name}</span>
                              <div className={`size-1.5 rounded-full ${pool.ccip_status === 'CORE' ? 'bg-primary' : 'bg-blue-500'}`} />
                           </div>
                           <div className="flex justify-between text-[10px] text-foreground/40 font-mono">
                              <span>TVL: ${Number(pool.tvl).toLocaleString()}</span>
                              <span className="text-primary font-bold">{pool.apy}%</span>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>

               {/* Center Column: Terminal View */}
               <div className="lg:col-span-2 bg-black/40 border border-white/10 rounded-2xl flex flex-col overflow-hidden relative shadow-2xl">
                  <div className="p-4 border-b border-white/10 bg-white/5 flex items-center justify-between relative z-10">
                     <div className="flex items-center gap-4">
                        <div className="flex gap-1.5">
                           <div className="size-2.5 rounded-full bg-rose-500/80" />
                           <div className="size-2.5 rounded-full bg-amber-500/80" />
                           <div className="size-2.5 rounded-full bg-primary/80" />
                        </div>
                        <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">TERMINAL_V.sh</span>
                     </div>
                     <div className="text-[9px] text-primary/40 font-mono">SH_SECURE_PATH: /dev/blockchain/avax-main-router</div>
                  </div>

                  <div className="flex-1 p-6 font-mono overflow-y-auto relative z-10 scrollbar-hide text-primary/80">
                     <div className="mb-4 text-primary/60 leading-tight">
                        {`> init --protocol lending-master`} <br />
                        {`> loading components [CreditManager, DebtRegistry, LiquidationEngine]...`} <br />
                        {`> establishing ccip_socket connection [Avalanche -> CCIP_ROUTER]...`} <br />
                        {`> status: CONNECTED`}
                     </div>

                     <div className="mb-8 p-6 rounded-xl border border-primary/20 bg-primary/5 space-y-4">
                        <div className="flex items-center justify-between">
                           <div className="flex items-center gap-2">
                              <Cpu className="w-4 h-4 text-primary" />
                              <span className="text-xs font-bold uppercase text-white">Personal_Lending_State</span>
                           </div>
                           <span className="text-[10px] text-primary font-bold">REALTIME</span>
                        </div>
                        <div className="grid grid-cols-2 gap-8">
                           <div>
                              <div className="text-[9px] text-foreground/30 uppercase mb-1">Current_Debt</div>
                              <div className="text-2xl font-black text-white">${userDebt.toLocaleString()}</div>
                           </div>
                           <div>
                              <div className="text-[9px] text-foreground/30 uppercase mb-1">Total_Credit_Line</div>
                              <div className="text-2xl font-black text-primary font-mono shadow-primary/20 shadow-sm">${userCredit.toLocaleString()}</div>
                           </div>
                        </div>
                     </div>

                     <div className="space-y-2">
                        <div className="text-[10px] font-bold text-foreground/20 uppercase mb-3 tracking-widest">Live_Network_Activity</div>
                        {[...Array(6)].map((_, i) => (
                           <div key={i} className="flex items-center gap-3 py-1 border-b border-primary/5">
                              <div className="text-primary text-[9px]">[SYNC]</div>
                              <div className="flex-1 text-[10px] truncate">Received cross_chain_msg (ID: 0x48a...{i}) from Remote Satellite</div>
                              <div className="text-foreground/20 text-[9px]">14:14:{12 + i}</div>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>

               {/* Right Column: Node Controls */}
               <div className="lg:col-span-1 space-y-6 overflow-y-auto pr-2 custom-scrollbar">
                  <div className="glass-card border border-white/5 rounded-2xl p-6">
                     <h3 className="text-xs font-bold uppercase tracking-widest mb-6 flex items-center gap-2 text-primary">
                        <Server className="w-4 h-4" />
                        Protocol_Controls
                     </h3>
                     <div className="space-y-3">
                        <Button className="w-full bg-primary/10 border border-primary/30 text-primary text-[10px] font-bold h-10 hover:bg-primary/20">
                           DEPLOY_CCIP_RELAY
                        </Button>
                        <Button className="w-full bg-white/5 border border-white/10 text-foreground/60 text-[10px] font-bold h-10 hover:bg-white/10">
                           PAUSE_GLOBAL_DEBT
                        </Button>
                        <Button className="w-full bg-rose-500/10 border border-rose-500/30 text-rose-500 text-[10px] font-bold h-10 hover:bg-rose-500/20">
                           EMERGENCY_SHUTDOWN
                        </Button>
                     </div>
                  </div>

                  <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
                     <h3 className="text-[10px] font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Layers className="w-4 h-4 text-primary" />
                        Infrastructure
                     </h3>
                     <div className="space-y-4">
                        <div className="p-3 rounded-lg bg-black/40 border border-white/10">
                           <div className="flex justify-between items-center mb-1">
                              <span className="text-[9px] font-bold">CCIP_ROUTER</span>
                              <span className="size-1.5 bg-primary rounded-full neon-glow" />
                           </div>
                           <div className="text-[10px] text-foreground/40 font-mono truncate">0xROUTER...ccip</div>
                        </div>
                        <div className="p-3 rounded-lg bg-black/40 border border-white/10">
                           <div className="flex justify-between items-center mb-1">
                              <span className="text-[9px] font-bold">LENDING_ORACLE</span>
                              <span className="size-1.5 bg-primary rounded-full neon-glow" />
                           </div>
                           <div className="text-[10px] text-foreground/40 font-mono truncate">0xCHAINLINK...feed</div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </main>
      </div>
   )
}


