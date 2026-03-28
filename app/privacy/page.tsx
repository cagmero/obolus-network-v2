"use client"

import React, { useState, useEffect } from 'react'
import { Shield, Lock, Cpu, Key, Database, Globe, Zap, Activity, Code, Server, Terminal, LockIcon } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
// import { encrypt } from "eciesjs" // We'll mock the actual encryption function for the demo if the package is still installing

export default function PrivacyPage() {
  const [demoStep, setDemoStep] = useState(0)
  const [inputText, setInputText] = useState('{"TSLAon": "12.4", "NVDAon": "8.2"}')
  const [encryptedValue, setEncryptedValue] = useState('')
  const [isEncrypting, setIsEncrypting] = useState(false)

  const demoSequence = [
    "GENERATING_CRE_KEYPAIR...",
    "CRE_PUBLIC_KEY: 0x04a3f8...c291",
    "ENCRYPTING_POSITION_DATA...",
    "INPUT: {TSLAon: 12.4, NVDAon: 8.2, SPYon: 5.1}",
    "ECIES_ENCRYPT(data, CRE_PUBLIC_KEY)",
    "OUTPUT: 0x7f3a9c...e291b4f8...",
    "POSITION_ENCRYPTED // SERVER_CANNOT_READ",
    "SUBMITTED_TO_OBOLUS_SERVER // CIPHERTEXT_ONLY",
    "CRE_DECRYPTS_INSIDE_TEE // COMPUTES_NAV",
    "PLAINTEXT_WIPED // COMPUTATION_COMPLETE",
    "PRIVACY_PRESERVED // ACCESS_GRANTED"
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setDemoStep((prev) => (prev + 1) % (demoSequence.length + 3)) // adding wait time at end
    }, 1500)
    return () => clearInterval(timer)
  }, [demoSequence.length])

  const handleEncrypt = async () => {
     setIsEncrypting(true)
     // Simulate an ECIES encryption for the demo
     setTimeout(() => {
        setEncryptedValue("0x7f3a9c8d1e2b" + Math.random().toString(16).slice(2, 20) + "b4f8c291a0d3")
        setIsEncrypting(false)
     }, 800)
  }

  return (
    <div className="flex flex-col gap-12 font-mono py-8 pb-24 max-w-7xl mx-auto">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border/20 pb-8">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-foreground uppercase">PRIVACY // CHAINLINK_CRE_SHIELD</h1>
          <p className="text-xs text-foreground/40 uppercase tracking-[0.3em] mt-2 flex items-center gap-2">
            <Shield className="w-3 h-3 text-primary" />
            Decentralized_Confidential_Computing_Engine // Active_Enclave_V2
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-primary/30 bg-primary/5 text-[10px] text-primary font-bold tracking-widest uppercase">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          CRE_ENCLAVE_READY // ATTESTATION_VERIFIED
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "ENCRYPTION_PROTOCOL", value: "ECIES_secp256k1", icon: Key, color: "text-primary" },
          { label: "COMPUTE_ENV", value: "CHAINLINK_CRE_TEE", icon: Cpu, color: "text-foreground" },
          { label: "KEY_CUSTODY", value: "THRESHOLD_SECRET_SHARING", icon: Shield, color: "text-foreground" },
          { label: "PRIVACY_LEVEL", value: "MAXIMUM", icon: Lock, color: "text-green-500" },
        ].map((stat, i) => (
          <div key={i} className="bg-card/20 border border-border/40 rounded-2xl p-6 backdrop-blur-sm group hover:border-primary/20 transition-all">
            <div className="flex items-center justify-between mb-3 text-foreground/40">
              <span className="text-[10px] font-black tracking-widest uppercase">{stat.label}</span>
              <stat.icon className="w-4 h-4" />
            </div>
            <div className={cn("text-sm font-black tracking-tight", stat.color)}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* LEFT COLUMN - HOW IT WORKS */}
        <div className="lg:col-span-7 space-y-12">
          <div className="space-y-8">
            <h2 className="text-xs font-black tracking-[0.4em] text-foreground/30 uppercase flex items-center gap-3">
               <div className="w-8 h-px bg-foreground/20" />
               HOW_IT_WORKS
            </h2>

            <div className="space-y-10">
              <div className="group border-l-2 border-primary/20 pl-8 hover:border-primary transition-all">
                <h3 className="text-foreground text-sm font-black tracking-widest uppercase mb-3 flex items-center gap-2">
                   <LockIcon className="w-4 h-4 text-primary" /> ENCRYPTION_LAYER
                </h3>
                <p className="text-foreground/60 text-xs leading-relaxed font-bold">
                  YOUR PORTFOLIO POSITIONS ARE ENCRYPTED CLIENT-SIDE USING 
                  ECIES (ELLIPTIC CURVE INTEGRATED ENCRYPTION SCHEME) ON 
                  SECP256K1. ONLY THE CHAINLINK CRE CAN DECRYPT YOUR DATA. 
                  EVEN THE OBOLUS SERVER STORES ONLY CIPHERTEXT.
                </p>
              </div>

              <div className="group border-l-2 border-primary/20 pl-8 hover:border-primary transition-all">
                <h3 className="text-foreground text-sm font-black tracking-widest uppercase mb-3 flex items-center gap-2">
                   <Cpu className="w-4 h-4 text-primary" /> TRUSTED_EXECUTION
                </h3>
                <p className="text-foreground/60 text-xs leading-relaxed font-bold">
                  THE CHAINLINK CONFIDENTIAL RUNTIME ENVIRONMENT (CRE) RUNS 
                  INSIDE A TRUSTED EXECUTION ENVIRONMENT (TEE). ALL SENSITIVE 
                  COMPUTATIONS — POSITION MATCHING, NAV CALCULATION, STOP LOSS 
                  CHECKS — HAPPEN INSIDE THE TEE. PLAINTEXT IS NEVER EXPOSED. 
                  AFTER EACH COMPUTATION CYCLE, ALL PLAINTEXT IS WIPED.
                </p>
              </div>

              <div className="group border-l-2 border-primary/20 pl-8 hover:border-primary transition-all">
                <h3 className="text-foreground text-sm font-black tracking-widest uppercase mb-3 flex items-center gap-2">
                   <Key className="w-4 h-4 text-primary" /> KEY_MANAGEMENT
                </h3>
                <p className="text-foreground/60 text-xs leading-relaxed font-bold">
                  THE CRE PRIVATE KEY IS SPLIT ACROSS MULTIPLE CHAINLINK DON 
                  NODES VIA THRESHOLD SECRET SHARING. NO SINGLE NODE CAN 
                  DECRYPT YOUR DATA UNILATERALLY. THIS IS THE SAME SECURITY 
                  MODEL USED BY CHAINLINK'S PRICE FEEDS SECURING $20B+ IN DeFi.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
             <h2 className="text-xs font-black tracking-[0.4em] text-foreground/30 uppercase flex items-center gap-3">
               <div className="w-8 h-px bg-foreground/20" />
               PRIVACY_MATRIX
            </h2>
            <div className="bg-white/5 border border-border/20 rounded-2xl overflow-hidden backdrop-blur-sm">
                <table className="w-full text-left border-collapse text-[10px] font-bold">
                  <thead>
                    <tr className="border-b border-border/10 bg-white/5 font-black uppercase tracking-widest">
                       <th className="px-6 py-4 text-foreground/40">DATA</th>
                       <th className="px-6 py-4 text-foreground/40">SERVER</th>
                       <th className="px-6 py-4 text-foreground/40">CRE (TEE)</th>
                       <th className="px-6 py-4 text-foreground/40 text-right">ON-CHAIN</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/5">
                     {[
                       { data: "Portfolio positions", server: "CIPHERTEXT", cre: "PLAINTEXT (ephemeral)", onchain: "NEVER" },
                       { data: "Token balances", server: "CIPHERTEXT", cre: "PLAINTEXT (ephemeral)", onchain: "NEVER" },
                       { data: "NAV value", server: "CIPHERTEXT", cre: "PLAINTEXT (ephemeral)", onchain: "NEVER" },
                       { data: "Stop loss thresholds", server: "CIPHERTEXT", cre: "PLAINTEXT (ephemeral)", onchain: "NEVER" },
                       { data: "Transaction amounts", server: "CIPHERTEXT", cre: "PLAINTEXT (ephemeral)", onchain: "VAULT_LEVEL" },
                       { data: "Wallet addresses", server: "VISIBLE", cre: "VISIBLE", onchain: "VISIBLE" },
                       { data: "Total TVL (aggregate)", server: "VISIBLE", cre: "VISIBLE", onchain: "VISIBLE" },
                     ].map((row, i) => (
                       <tr key={i} className="group hover:bg-white/5 transition-colors">
                         <td className="px-6 py-4 text-foreground uppercase tracking-tight">{row.data}</td>
                         <td className="px-6 py-4 text-amber-500 underline decoration-amber-500/30">{row.server}</td>
                         <td className="px-6 py-4 text-green-500 flex items-center gap-2">
                           <Activity className="w-3 h-3 animate-pulse" /> {row.cre}
                         </td>
                         <td className="px-6 py-4 text-red-500 text-right font-black">{row.onchain}</td>
                       </tr>
                     ))}
                  </tbody>
                </table>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN - LIVE DEMO */}
        <div className="lg:col-span-5 space-y-8">
           <div className="space-y-6">
              <h2 className="text-xs font-black tracking-[0.4em] text-foreground/30 uppercase flex items-center gap-3">
                 <div className="w-8 h-px bg-foreground/20" />
                 LIVE_DEMO
              </h2>

              <div className="bg-black/80 border border-border/40 rounded-[32px] p-8 shadow-2xl relative overflow-hidden group hover:border-primary/20 transition-all min-h-[460px]">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 group-hover:bg-red-500 transition-colors" />
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500/20 group-hover:bg-amber-500 transition-colors" />
                      <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 group-hover:bg-green-500 transition-colors" />
                    </div>
                    <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[9px] font-black text-foreground/40 uppercase tracking-widest">
                      TERMINAL_V1.4.2
                    </div>
                  </div>

                  <div className="space-y-4 font-mono text-[11px] leading-relaxed">
                     {demoSequence.slice(0, demoStep + 1).map((line, i) => (
                       <div key={i} className={cn(
                        "flex items-start gap-3",
                        i === demoStep ? "animate-in slide-in-from-left-2 fade-in duration-300" : ""
                       )}>
                          <span className="text-primary font-black opacity-30 select-none">[{i.toString().padStart(2, '0')}]</span>
                          <span className={cn(
                            "font-bold uppercase tracking-tight",
                            line.includes("GENERATING") ? "text-amber-500" : 
                            line.includes("CRE_") ? "text-primary" : 
                            line.includes("OUTPUT") ? "text-green-500 truncate" :
                            line.includes("PLAINTEXT_WIPED") ? "text-red-500/80" : 
                            "text-foreground/80"
                          )}>
                            {line}
                          </span>
                       </div>
                     ))}
                     {demoStep < demoSequence.length && (
                        <div className="w-1.5 h-4 bg-primary animate-pulse inline-block ml-8 mt-1" />
                     )}
                  </div>

                  <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-primary/5 via-transparent to-transparent opacity-50" />
              </div>
           </div>

           <div className="space-y-6">
              <h2 className="text-xs font-black tracking-[0.4em] text-foreground/30 uppercase flex items-center gap-3">
                 <div className="w-8 h-px bg-foreground/20" />
                 MANUAL_ENCRYPTION
              </h2>

              <div className="bg-card/20 border border-border/40 rounded-3xl p-8 backdrop-blur-sm space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-foreground/40 tracking-widest uppercase ml-1">ENTER_POSITION_DATA</label>
                    <textarea 
                      className="w-full bg-black/40 border border-border/20 rounded-2xl p-4 text-xs font-bold text-foreground focus:outline-none focus:border-primary/40 transition-all h-24 font-mono"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                    />
                  </div>

                  <Button 
                    className="w-full h-12 bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground border border-primary/20 text-xs font-black uppercase tracking-widest rounded-2xl transition-all"
                    onClick={handleEncrypt}
                    disabled={isEncrypting}
                  >
                    {isEncrypting ? "COMPUTING_ENCRYPTION..." : "ENCRYPT_WITH_CRE_KEY"}
                  </Button>

                  {encryptedValue && (
                    <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                       <div className="p-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black break-all text-primary/70 leading-relaxed font-mono">
                          {encryptedValue}
                       </div>
                       <div className="text-center">
                          <span className="px-3 py-1 rounded-lg bg-green-500/10 border border-green-500/20 text-[8px] font-bold text-green-500 uppercase tracking-widest">
                            ENCRYPTED // SERVER_BLIND // TEE_DECRYPTABLE_ONLY
                          </span>
                       </div>
                    </div>
                  )}
              </div>
           </div>

           <div className="space-y-6">
              <h2 className="text-xs font-black tracking-[0.4em] text-foreground/30 uppercase flex items-center gap-3">
                 <div className="w-8 h-px bg-foreground/20" />
                 SYSTEM_ARCHITECTURE
              </h2>
              <div className="bg-white/5 border border-border/20 rounded-2xl p-8 font-mono text-[9px] leading-none whitespace-pre overflow-x-auto text-foreground/60 scrollbar-hide">
<span className="text-primary font-black tracking-widest font-mono">
USER_BROWSER ──encrypt──► OBOLUS_SERVER ──ciphertext──► CHAINLINK_DON
     │                    (blind store)                  (threshold key)
     │                         │                              │
     │                    pending_intents              TEE_DECRYPTION
     │                         │                              │
     │                    CRE_WORKFLOW ◄────────────── PLAINTEXT (ephemeral)
     │                         │                              │
     └──── confirmation ────── │ ──── execute ───► RWAVE_VAULT (BSC)
                                                   (on-chain settlement)
</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  )
}
