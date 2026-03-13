"use client"

import { ConnectGate } from "@/components/connect-gate"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import {
  User,
  Wallet,
  Award,
  TrendingUp,
  ShieldCheck,
  Lock,
  CheckCircle,
  ArrowRight,
  Shield,
  Zap
} from "lucide-react"

const fetcher = (u: string) => fetch(u).then((r) => r.json())

export default function LimitsPage() {
  const { data } = useSWR("/api/limits", fetcher)

  const score = data?.creditScore ?? 610
  const totalLimit = data?.currentLimit ?? 500
  const healthFactor = (score / 250).toFixed(2)
  const healthPercentage = Math.min(100, (score / 800) * 100)

  return (
    <ConnectGate>
      <div className="max-w-[800px] mx-auto py-12 px-4 flex flex-col gap-12 glow-bg min-h-screen font-mono">
        <div className="flex flex-col gap-4 text-center">
          <h1 className="text-white text-4xl md:text-5xl font-extrabold leading-tight tracking-tight">
            Your Journey to Higher Limits
          </h1>
          <p className="text-foreground/60 text-lg max-w-2xl mx-auto">
            Empower your portfolio on . Every step you take unlocks more borrowing power and exclusive financial flexibility.
          </p>
        </div>

        <div className="flex flex-col gap-8 relative">
          {/* Step 1: Current Standing */}
          <div className="relative flex gap-8">
            <div className="flex flex-col items-center">
              <div className="step-node size-12 rounded-full bg-primary flex items-center justify-center shadow-[0_0_20px_rgba(var(--primary),0.4)]">
                <User className="w-6 h-6 text-primary-foreground" />
              </div>
              <div className="step-line"></div>
            </div>
            <div className="flex-1 glass-card rounded-2xl p-8 transition-all hover:bg-white/[0.05]">
              <h2 className="text-white text-2xl font-bold mb-6">Current Standing</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="flex flex-col">
                  <span className="text-foreground/50 text-xs font-bold uppercase tracking-wider mb-1">Total Limit</span>
                  <span className="text-white text-4xl font-black">${totalLimit.toFixed(2)}</span>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-primary text-[10px] font-black bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                      {totalLimit < 1500 ? "BRONZE LEVEL" : totalLimit < 5000 ? "SILVER LEVEL" : "GOLD LEVEL"}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-foreground/50 text-xs font-bold uppercase tracking-wider mb-1">Account Health</span>
                  <div className="flex items-center gap-3">
                    <span className="text-white text-4xl font-black">{healthFactor}</span>
                    <span className="text-primary text-[10px] font-bold px-2 py-1 border border-primary/30 rounded-lg">
                      {score > 700 ? "EXCELLENT" : score > 600 ? "GOOD" : "STABLE"}
                    </span>
                  </div>
                  <div className="mt-4 w-full bg-white/5 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-primary h-full rounded-full shadow-[0_0_10px_#a7f24a]"
                      style={{ width: `${healthPercentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2: Collateral Section */}
          <div className="relative flex gap-8">
            <div className="flex flex-col items-center">
              <div className="step-node size-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <div className="step-line"></div>
            </div>
            <div className="flex-1 glass-card rounded-2xl p-8 border-l-4 border-l-primary/40">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                  <h2 className="text-white text-2xl font-bold">Secure Your Future with Collateral</h2>
                  <p className="text-foreground/50 text-sm mt-1">Increasing your CTC collateral directly boosts your limit potential.</p>
                </div>
                <div className="bg-white/5 rounded-full p-1 flex border border-white/5">
                  <button className="px-6 py-2 text-sm font-bold bg-primary text-primary-foreground rounded-full">Add</button>
                  <button className="px-6 py-2 text-sm font-medium text-white/50 hover:text-white transition-all">Withdraw</button>
                </div>
              </div>

              <div className="bg-white/5 rounded-xl p-6 border border-white/5 mb-6">
                <div className="flex justify-between text-[10px] font-bold text-white/40 mb-3 uppercase tracking-widest px-1">
                  <span>Amount to Deposit</span>
                  <span>Balance: 4,520 CTC</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <input
                      className="w-full bg-transparent border-none p-0 text-white text-3xl font-black focus:ring-0 placeholder:text-white/10"
                      placeholder="0.00"
                      type="number"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <button className="text-[10px] font-black text-primary hover:bg-primary/20 transition-colors bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/20">MAX</button>
                    <span className="text-xl font-bold text-white/30 tracking-widest">CTC</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <div className="p-4 rounded-lg bg-white/5 flex flex-col border border-white/5">
                  <span className="text-white/40 text-[10px] uppercase font-bold tracking-wider">New Health Factor</span>
                  <span className="text-primary font-black text-lg">{healthFactor} → {(parseFloat(healthFactor) + 0.37).toFixed(2)}</span>
                </div>
                <div className="p-4 rounded-lg bg-white/5 flex flex-col border border-white/5">
                  <span className="text-white/40 text-[10px] uppercase font-bold tracking-wider">Collateral LTV</span>
                  <span className="text-white font-black text-lg">40.8%</span>
                </div>
              </div>

              <Button className="w-full py-8 bg-primary hover:bg-primary/90 text-primary-foreground font-black rounded-xl text-lg tracking-tight shadow-[0_0_30px_rgba(var(--primary),0.3)] transition-all">
                DEPOSIT CTC & BOOST LIMIT
              </Button>
            </div>
          </div>

          {/* Step 3: Tiers */}
          <div className="relative flex gap-8">
            <div className="flex flex-col items-center">
              <div className="step-node size-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                <Award className="w-6 h-6 text-white/40" />
              </div>
            </div>
            <div className="flex-1 glass-card rounded-2xl p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <TrendingUp className="w-32 h-32 text-white" />
              </div>
              <div className="mb-8">
                <h2 className="text-white text-2xl font-bold">Unlock Your Next Level</h2>
                <p className="text-foreground/50 text-sm mt-1">
                  You are {Math.round((totalLimit / 1500) * 100)}% of the way to the <strong className="text-white">Silver Tier</strong>.
                </p>
              </div>

              <div className="relative mb-12 py-4 px-2">
                <div className="h-4 bg-white/5 rounded-full w-full relative border border-white/5">
                  <div className="absolute h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${Math.round((totalLimit / 1500) * 100)}%` }}>
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 size-8 bg-[#0a0b10] border-4 border-primary rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(var(--primary),0.5)]">
                      <div className="size-2 bg-primary rounded-full animate-pulse"></div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between mt-6 px-1">
                  <div className="text-center">
                    <span className="block text-white font-bold text-sm">Bronze</span>
                    <span className="text-[9px] text-white/40 uppercase font-black tracking-widest">Current</span>
                  </div>
                  <div className="text-center opacity-40">
                    <span className="block text-white font-bold text-sm">Silver</span>
                    <span className="text-[9px] text-white/40 uppercase font-black tracking-widest">30k CTC</span>
                  </div>
                  <div className="text-center opacity-20">
                    <span className="block text-white font-bold text-sm">Gold</span>
                    <span className="text-[9px] text-white/40 uppercase font-black tracking-widest">75k CTC</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 rounded-xl bg-primary/10 border border-primary/20">
                  <div className="flex items-center gap-4">
                    <div className="size-10 rounded-lg bg-primary/20 flex items-center justify-center">
                      <ShieldCheck className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-sm">Bronze Level</h4>
                      <p className="text-[11px] text-foreground/50">Requirement: 10,000 CTC</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="block text-white font-black text-sm">$500 Limit</span>
                    <span className="text-[9px] font-black text-primary px-2 py-0.5 rounded bg-primary/10 border border-primary/20 uppercase">Active</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 opacity-70 group hover:opacity-100 transition-all cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="size-10 rounded-lg bg-white/10 flex items-center justify-center">
                      <Shield className="w-5 h-5 text-foreground/40" />
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-sm">Silver Level</h4>
                      <p className="text-[11px] text-foreground/50">Requirement: 30,000 CTC</p>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-4">
                    <div>
                      <span className="block text-white font-black text-sm">$1,500 Limit</span>
                      <span className="text-[9px] font-medium text-white/30 uppercase tracking-widest">Locked</span>
                    </div>
                    <Lock className="w-4 h-4 text-white/20" />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 opacity-40">
                  <div className="flex items-center gap-4">
                    <div className="size-10 rounded-lg bg-white/10 flex items-center justify-center">
                      <Award className="w-5 h-5 text-foreground/20" />
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-sm">Gold Level</h4>
                      <p className="text-[11px] text-foreground/50">Requirement: 75,000 CTC</p>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-4">
                    <div>
                      <span className="block text-white font-black text-sm">$5,000 Limit</span>
                      <span className="text-[9px] font-medium text-white/30 uppercase tracking-widest">Locked</span>
                    </div>
                    <Lock className="w-4 h-4 text-white/10" />
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-white/5">
                <div className="flex gap-4 items-start bg-gradient-to-r from-primary/10 to-transparent p-6 rounded-xl border border-primary/10">
                  <div className="bg-primary/20 p-3 rounded-full">
                    <CheckCircle className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg leading-tight">Boost Limit with Your Credit Score</h3>
                    <p className="text-foreground/50 text-sm mt-2 leading-relaxed">
                      Maintaining a perfect payment record on Polaris for 3 months unlocks a 25% "Trust Multiplier". No extra collateral needed.
                    </p>
                    <button className="mt-4 flex items-center gap-2 text-primary font-black text-[10px] hover:gap-3 transition-all uppercase tracking-[0.2em]">
                      Analyze Credit Score <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ConnectGate>
  )
}


