"use client"

import { AppHeader } from "@/components/header"
import { AppFooter } from "@/components/footer"
import { motion, AnimatePresence } from "framer-motion"
import { Link2, ArrowRight, Shield, Zap, Info, Loader2, CheckCircle2 } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"

export default function BridgePage() {
  const [step, setStep] = useState(1)
  const [asset, setAsset] = useState("USDC")
  const [amount, setAmount] = useState("")

  const startBridge = () => {
    setStep(2)
    setTimeout(() => setStep(3), 3000)
    setTimeout(() => setStep(4), 6000)
    setTimeout(() => setStep(5), 9000)
  }

  return (
    <div className="min-h-screen bg-background font-mono text-foreground">
      <AppHeader />
      <main className="max-w-4xl mx-auto px-6 pt-32 pb-20">
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-4 text-primary">
            <Link2 className="w-5 h-5" />
            <span className="text-xs font-bold tracking-[0.3em] uppercase">Satellite Bridge</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter mb-4">
            Link Collateral via CCIP
          </h1>
          <p className="text-foreground/50 leading-relaxed max-w-xl">
             Send a cross-chain message to the Master Registry on Avalanche to update your global credit limit based on satellite assets.
          </p>
        </header>

        <div className="bg-card/20 border border-border/40 rounded-[32px] p-8 md:p-12 backdrop-blur-md relative overflow-hidden">
           <div className="absolute top-0 right-0 p-8 opacity-5">
              <Shield className="w-40 h-40 text-primary" />
           </div>

           <AnimatePresence mode="wait">
             {step === 1 && (
               <motion.div 
                 key="step1"
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: -10 }}
                 className="space-y-8"
               >
                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-6 rounded-2xl bg-background/40 border border-border/20">
                       <div className="text-[10px] text-foreground/40 uppercase mb-2">Source Chain</div>
                       <div className="text-lg font-bold flex items-center gap-2">
                          <div className="size-4 rounded-full bg-purple-500" />
                          Polygon Amoy
                       </div>
                    </div>
                    <div className="p-6 rounded-2xl bg-background/40 border border-border/20">
                       <div className="text-[10px] text-foreground/40 uppercase mb-2">Destination Chain</div>
                       <div className="text-lg font-bold flex items-center gap-2 text-primary">
                          <div className="size-4 rounded-full bg-primary" />
                          Avalanche Master
                       </div>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <label className="text-[10px] font-bold uppercase text-foreground/40 tracking-widest">Select Satellite Asset</label>
                    <div className="flex gap-4">
                       {["USDC", "WETH", "MATIC"].map(t => (
                         <button 
                           key={t}
                           onClick={() => setAsset(t)}
                           className={`px-6 py-3 rounded-xl border font-bold transition-all ${asset === t ? 'bg-primary/10 border-primary text-primary' : 'bg-white/5 border-border/40 text-foreground/40 hover:border-border'}`}
                         >
                           {t}
                         </button>
                       ))}
                    </div>
                 </div>

                 <div className="space-y-4">
                    <label className="text-[10px] font-bold uppercase text-foreground/40 tracking-widest">Amount to Lock</label>
                    <input 
                      type="number" 
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full bg-black/40 border border-border/40 rounded-2xl px-6 py-4 text-2xl font-bold outline-none focus:border-primary transition-colors" 
                    />
                 </div>

                 <Button 
                   onClick={startBridge}
                   disabled={!amount}
                   className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-black py-8 rounded-2xl text-xl uppercase tracking-widest"
                 >
                   INITIATE_BRIDGE
                 </Button>
               </motion.div>
             )}

             {step > 1 && step < 5 && (
               <motion.div 
                 key="loading"
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 className="flex flex-col items-center justify-center py-20 text-center"
               >
                 <div className="relative mb-12">
                    <Loader2 className="w-20 h-20 text-primary animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                       <Zap className="w-8 h-8 text-primary" />
                    </div>
                 </div>
                 <h2 className="text-2xl font-bold mb-4">Relaying CCIP Message...</h2>
                 <div className="space-y-2 max-w-xs mx-auto">
                    <div className={`text-xs transition-opacity ${step >= 2 ? 'opacity-100 text-emerald-500' : 'opacity-20'}`}>[OK] Locking collateral on Polygon</div>
                    <div className={`text-xs transition-opacity ${step >= 3 ? 'opacity-100 text-emerald-500' : 'opacity-20'}`}>[OK] CCIP Message Committed</div>
                    <div className={`text-xs transition-opacity ${step >= 4 ? 'opacity-100 text-primary' : 'opacity-20'}`}>[..] Awaiting Master Sync (Avalanche)</div>
                 </div>
               </motion.div>
             )}

             {step === 5 && (
               <motion.div 
                 key="success"
                 initial={{ opacity: 0, scale: 0.9 }}
                 animate={{ opacity: 1, scale: 1 }}
                 className="flex flex-col items-center justify-center py-10 text-center"
               >
                 <div className="size-24 rounded-full bg-emerald-500/10 flex items-center justify-center mb-8 border border-emerald-500/20">
                    <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                 </div>
                 <h2 className="text-3xl font-black mb-4 uppercase tracking-tighter">Sync_Complete</h2>
                 <p className="text-foreground/50 mb-12 max-w-sm">
                    Your global credit limit has been updated on the Avalanche Master Chain.
                 </p>
                 <div className="grid grid-cols-2 gap-4 w-full mb-12">
                    <div className="p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
                       <div className="text-[10px] text-emerald-500/60 uppercase font-bold mb-1">New Limit</div>
                       <div className="text-2xl font-black">$10,420.00</div>
                    </div>
                    <div className="p-6 rounded-2xl bg-primary/5 border border-primary/20">
                       <div className="text-[10px] text-primary/60 uppercase font-bold mb-1">Limit Incr.</div>
                       <div className="text-2xl font-black">+$1,200.00</div>
                    </div>
                 </div>
                 <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-6 rounded-xl">
                    <Link href="/vault">RETURN_TO_VAULT</Link>
                 </Button>
               </motion.div>
             )}
           </AnimatePresence>
        </div>

        <div className="mt-12 p-6 rounded-3xl bg-primary/5 border border-primary/10 flex items-start gap-4">
           <Info className="w-5 h-5 text-primary shrink-0 mt-1" />
           <p className="text-xs leading-relaxed text-foreground/60">
              Satellite Bridges utilize **Chainlink CCIP (Cross-Chain Interoperability Protocol)** to securely transmit state proofs. 
              This process usually takes between 3-15 minutes depending on finality depth for each chain. 
              Native gas or LINK is used to pay for cross-chain relay fees.
           </p>
        </div>
      </main>
      <AppFooter />
    </div>
  )
}


