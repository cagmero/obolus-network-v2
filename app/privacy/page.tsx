"use client"

import { useState } from "react"
import { ConnectGate } from "@/components/connect-gate"
import { Button } from "@/components/ui/button"
import { Shield, Key, Lock, Eye, EyeOff, ShieldCheck, ChevronRight, Zap, Info } from "lucide-react"

export default function PrivacyPage() {
  const [demoRevealed, setDemoRevealed] = useState(false)

  return (
    <ConnectGate>
      <div className="flex flex-col gap-8 py-8 font-mono">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold tracking-[0.2em] text-foreground/50 uppercase">
            PRIVACY // fhEVM_STATUS
          </h2>
          <div className="flex items-center gap-2 px-2 py-0.5 rounded border border-primary/30 bg-primary/5 text-[10px] text-primary font-bold tracking-wider uppercase">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            MAXIMUM_SECURITY_PROTOCOL
          </div>
        </div>

        {/* Top Stats Bar */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card rounded-2xl p-8 border-l-4 border-l-primary/40 relative overflow-hidden group">
            <p className="text-foreground/50 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">Encryption Protocol</p>
            <div className="flex items-baseline gap-2">
              <h1 className="text-white text-3xl font-black tracking-tighter tabular-nums">ZAMA_fhEVM</h1>
            </div>
            <Shield className="absolute -bottom-2 -right-2 w-16 h-16 text-primary/5 group-hover:text-primary/10 transition-colors" />
          </div>

          <div className="glass-card rounded-2xl p-8 border-l-4 border-l-white/10 relative overflow-hidden group">
            <p className="text-foreground/50 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">Key Status</p>
            <div className="flex items-baseline gap-2">
              <h1 className="text-white text-5xl font-black tracking-tighter tabular-nums uppercase">Active</h1>
            </div>
            <Key className="absolute -bottom-2 -right-2 w-16 h-16 text-white/5 group-hover:text-white/10 transition-colors" />
          </div>

          <div className="glass-card rounded-2xl p-8 border-l-4 border-l-white/10 relative overflow-hidden group">
            <p className="text-foreground/50 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">Privacy Level</p>
            <div className="flex items-baseline gap-2">
              <h1 className="text-white text-3xl font-black tracking-tighter tabular-nums uppercase">Maximum</h1>
              <span className="text-white/30 font-bold text-xs tracking-widest uppercase inline-flex items-center gap-1.5">
                 <div className="size-1.5 bg-primary rounded-full animate-pulse" />
                 LOCKED
              </span>
            </div>
            <Lock className="absolute -bottom-2 -right-2 w-16 h-16 text-white/5 group-hover:text-white/10 transition-colors" />
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Panel: Explainer */}
          <section className="lg:col-span-7 space-y-6">
             <div className="bg-card/20 border border-border/40 rounded-2xl p-10 space-y-8 backdrop-blur-md relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                   <Shield className="size-32" />
                </div>
                <div className="space-y-4">
                  <h3 className="text-white text-xs font-bold tracking-widest uppercase flex items-center gap-2">
                    <Info className="size-4 text-primary" />
                    ENCRYPTION_EXPLAINER
                  </h3>
                  <div className="text-sm text-foreground/70 leading-relaxed font-mono uppercase tracking-tight text-justify whitespace-pre-wrap">
                    "YOUR POSITIONS ARE ENCRYPTED USING FULLY HOMOMORPHIC ENCRYPTION (FHE).
                    THIS MEANS YOUR HOLDINGS, BALANCES, AND PORTFOLIO WEIGHTS ARE MATHEMATICALLY
                    ENCRYPTED ON-CHAIN. EVEN THE SMART CONTRACT CANNOT READ YOUR RAW BALANCE.
                    ONLY YOU CAN DECRYPT YOUR OWN POSITIONS USING YOUR WALLET KEY."
                  </div>
                </div>

                <div className="grid gap-4 mt-12 bg-black/40 border border-border/20 rounded-xl p-6">
                   {[
                     { label: "WHAT_IS_ENCRYPTED", value: "BALANCES // POSITIONS // WEIGHTS // NAV" },
                     { label: "WHAT_IS_PUBLIC", value: "CONTRACT_INTERACTION // TOTAL_TVL" },
                     { label: "ENCRYPTION_STANDARD", value: "euint64 // Zama_fhEVM_v1" },
                   ].map((stat, i) => (
                     <div key={i} className="flex flex-col gap-1 py-2 first:pt-0 last:pb-0 border-b border-white/5 last:border-0">
                        <span className="text-[10px] text-white/20 font-bold uppercase tracking-[0.2em]">{stat.label}</span>
                        <span className="text-xs font-bold text-primary tracking-widest uppercase">{stat.value}</span>
                     </div>
                   ))}
                </div>
             </div>
          </section>

          {/* Right Panel: Demo */}
          <section className="lg:col-span-5 space-y-6">
             <div className="bg-card/20 border border-border/40 rounded-2xl p-8 space-y-8 backdrop-blur-md">
                <div className="space-y-4">
                  <h3 className="text-white text-xs font-bold tracking-widest uppercase flex items-center gap-2">
                    <Zap className="size-4 text-primary" />
                    ENCRYPTION_DEMO
                  </h3>
                  <div className="bg-background/60 border border-border/30 rounded-2xl p-8 flex flex-col items-center justify-center text-center gap-6 group hover:border-primary/20 transition-all border-dashed">
                    <div className="space-y-4 w-full">
                       <span className="text-[10px] text-foreground/40 font-bold uppercase tracking-widest">
                         {demoRevealed ? "DECRYPTED_VALUE" : "ENCRYPTED_VALUE"}
                       </span>
                       <div className="p-4 bg-black/40 border border-white/5 rounded-lg w-full font-mono text-xs break-all text-foreground/80 overflow-hidden text-ellipsis h-16 flex items-center justify-center uppercase">
                          {demoRevealed ? (
                            <span className="text-2xl font-black text-white">$12,450.00</span>
                          ) : (
                            <span className="text-primary/50 tracking-widest font-bold">0x7f3a...c291</span>
                          )}
                       </div>
                    </div>
                    <Button 
                      onClick={() => setDemoRevealed(!demoRevealed)}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground font-black px-10 py-6 rounded-xl flex items-center gap-3 text-xs uppercase tracking-widest shadow-[0_0_15px_rgba(var(--primary),0.2)]"
                    >
                      {demoRevealed ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      {demoRevealed ? "HIDE_BALANCE" : "DECRYPT_VAULT"}
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                   <h3 className="text-white text-xs font-bold tracking-widest uppercase">PRIVACY_PROOF</h3>
                   <div className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-xl group cursor-pointer hover:bg-white/[0.08] transition-all">
                      <div className="size-8 rounded bg-primary/10 border border-primary/20 flex flex-shrink-0 items-center justify-center text-primary">
                         <ShieldCheck className="size-4" />
                      </div>
                      <div className="flex-1 overflow-hidden">
                         <span className="text-[10px] text-white/20 font-bold uppercase tracking-widest block">Hash Code</span>
                         <span className="text-[11px] font-bold text-white/50 truncate block">0x9a2b...c1d8</span>
                      </div>
                      <Button className="h-8 px-4 bg-secondary hover:bg-secondary/80 text-foreground font-bold text-[10px] tracking-widest uppercase rounded-lg">
                        VERIFY
                      </Button>
                   </div>
                </div>
             </div>
          </section>
        </div>
      </div>
    </ConnectGate>
  )
}
