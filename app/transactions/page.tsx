"use client"

import { ConnectGate } from "@/components/connect-gate"
import {
  History,
  TrendingDown,
  ArrowUpRight,
  Lightbulb,
  Info,
  ChevronRight,
  Shield,
  Zap,
  Lock,
  Eye,
  ArrowDownLeft
} from "lucide-react"
import Link from "next/link"

export default function TransactionsPage() {
  const transactions = [
    { type: "VAULT_DEPOSIT", asset: "NVDAon", amount: "ENCRYPTED", date: "2M AGO", status: "CONFIRMED" },
    { type: "VAULT_WITHDRAW", asset: "TSLAon", amount: "ENCRYPTED", date: "1H AGO", status: "CONFIRMED" },
    { type: "BALANCE_REVEAL", asset: "SYS_CALL", amount: "VAULT_v1", date: "4H AGO", status: "COMPLETED" },
    { type: "POSITION_UPDATE", asset: "SPYon", amount: "ENCRYPTED", date: "1D AGO", status: "CONFIRMED" },
    { type: "VAULT_DEPOSIT", asset: "QQQon", amount: "ENCRYPTED", date: "2D AGO", status: "CONFIRMED" },
  ]

  return (
    <ConnectGate>
      <div className="flex flex-col gap-8 py-8 font-mono">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold tracking-[0.2em] text-foreground/50 uppercase">
            TRANSACTIONS // VAULT_HISTORY
          </h2>
          <div className="flex items-center gap-2 px-2 py-0.5 rounded border border-primary/30 bg-primary/5 text-[10px] text-primary font-bold tracking-wider uppercase">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            BLOCKCHAIN_LEDGER_SYNCED
          </div>
        </div>

        {/* Top Summary Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="glass-card rounded-2xl p-8 border-l-4 border-l-primary/40 relative overflow-hidden group">
            <p className="text-foreground/50 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">Total Volume</p>
            <div className="flex items-baseline gap-2">
              <h1 className="text-white text-5xl font-black tracking-tighter tabular-nums">14</h1>
              <span className="text-primary font-bold text-xs tracking-widest uppercase">TXS</span>
            </div>
            <History className="absolute -bottom-2 -right-2 w-16 h-16 text-primary/5 group-hover:text-primary/10 transition-colors" />
          </div>

          <div className="glass-card rounded-2xl p-8 border-l-4 border-l-white/10 relative overflow-hidden group">
            <p className="text-foreground/50 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">Encrypted Vault Actions</p>
            <div className="flex items-baseline gap-2">
              <h1 className="text-white text-5xl font-black tracking-tighter tabular-nums">92%</h1>
              <span className="text-white/30 font-bold text-xs tracking-widest uppercase">PRIVACY</span>
            </div>
            <Shield className="absolute -bottom-2 -right-2 w-16 h-16 text-white/5 group-hover:text-white/10 transition-colors" />
          </div>

          <div className="lg:col-span-1 md:col-span-2">
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 relative overflow-hidden">
               <div className="flex items-center justify-between mb-3">
                 <h3 className="text-white font-bold text-xs flex items-center gap-2 tracking-wider">
                   <Lightbulb className="w-4 h-4 text-primary" />
                   fhEVM INSIGHTS
                 </h3>
               </div>
               <p className="text-foreground/60 text-xs leading-relaxed uppercase">
                 <strong className="text-white">SHIELDED LEDGER:</strong> YOUR TRANSACTION HISTORY IS PRIVATELY RECORDED. ONLY YOUR WALLET KEY CAN LINK THESE ACTIONS TO YOUR RAW POSITION BALANCES.
               </p>
            </div>
          </div>
        </section>

        {/* Transaction History List */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-white text-lg font-bold tracking-tight uppercase tracking-wider">Transaction History</h2>
            <div className="flex items-center gap-3">
               <div className="bg-background/40 border border-border/20 rounded-full px-4 py-1 flex items-center gap-2">
                  <span className="text-primary font-bold text-[9px] uppercase tracking-widest">Sort: By_Date</span>
               </div>
            </div>
          </div>
          
          <div className="flex flex-col gap-3">
            {transactions.map((t, i) => (
              <div
                key={i}
                className="glass-card rounded-xl p-6 flex items-center justify-between hover:bg-white/[0.04] transition-all group cursor-pointer border-l-2 border-l-white/10 hover:border-l-primary"
              >
                <div className="flex items-center gap-6">
                  <div className="size-12 rounded-xl bg-white/5 flex items-center justify-center text-white/40 group-hover:text-primary transition-colors border border-white/5">
                    {t.type === "VAULT_DEPOSIT" && <Zap className="w-5 h-5" />}
                    {t.type === "VAULT_WITHDRAW" && <ArrowDownLeft className="w-5 h-5" />}
                    {t.type === "BALANCE_REVEAL" && <Eye className="w-5 h-5" />}
                    {t.type === "POSITION_UPDATE" && <Lock className="w-5 h-5" />}
                  </div>
                  <div className="space-y-1">
                    <span className="text-white font-black block leading-tight tracking-wider uppercase text-sm">{t.type}</span>
                    <span className="text-foreground/40 text-[10px] font-bold uppercase tracking-[0.2em]">
                      Asset: {t.asset} // {t.status}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-12">
                   <div className="hidden md:flex flex-col text-right">
                      <span className="text-foreground/30 text-[9px] font-black uppercase tracking-widest">Timestamp</span>
                      <span className="text-white font-bold text-[10px] uppercase tracking-tighter">{t.date}</span>
                   </div>
                   <div className="text-right min-w-[120px]">
                      <span className={cn("font-black text-xl tabular-nums tracking-tighter", t.amount === "ENCRYPTED" ? "text-primary/70" : "text-white")}>
                         {t.amount}
                      </span>
                      <span className="text-white/20 text-[9px] font-bold ml-2 uppercase tracking-widest">STATE</span>
                   </div>
                   <ChevronRight className="size-4 text-white/10 group-hover:text-primary/50 transition-colors" />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-card/20 border border-border/40 rounded-2xl p-8 flex items-center justify-between group cursor-pointer hover:border-primary/20 transition-all border-dashed">
            <div className="flex items-center gap-4">
               <div className="size-10 rounded bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <Info className="size-5" />
               </div>
               <div>
                  <h3 className="text-white/70 text-[10px] font-bold uppercase tracking-widest">System Ledger Archive</h3>
                  <p className="text-[11px] text-foreground/40 uppercase font-bold tracking-tight mt-1">Export full transaction manifest in encrypted CSV format</p>
               </div>
            </div>
            <Button variant="ghost" className="text-primary hover:text-primary/70 font-black text-[10px] uppercase tracking-widest">
               EXPORT_ARCHIVE
            </Button>
        </section>
      </div>
    </ConnectGate>
  )
}
