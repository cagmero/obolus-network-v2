"use client"

import { useState } from "react"
import { ConnectGate } from "@/components/connect-gate"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Lock, Eye, EyeOff, Shield, RefreshCw, ChevronRight, ArrowDownLeft, Zap } from "lucide-react"
import { GM_TOKENS } from "@/lib/constants"
import { useAccount, useChainId } from "wagmi"
import { useVaultBalance, useDeposit, useWithdraw, useGMTokenPrices } from "@/hooks/useVaults"
import { formatUnits } from "viem"

export default function VaultPage() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const [revealed, setRevealed] = useState(false)
  const [selectedTokens, setSelectedTokens] = useState<string[]>([])
  const [amount, setAmount] = useState<string>("")
  const [withdrawAmount, setWithdrawAmount] = useState<string>("")

  const { data: balance, isLoading: balanceLoading } = useVaultBalance(address)
  const { data: prices } = useGMTokenPrices()
  const { execute: depositGM } = useDeposit()
  const { execute: withdrawGM } = useWithdraw()

  const [txStatus, setTxStatus] = useState<string>("IDLE")

  const toggleToken = (symbol: string) => {
    // Single selection for V1 simplified flow
    setSelectedTokens([symbol])
  }

  const handleDeposit = async () => {
    if (!selectedTokens[0] || !amount) return
    setTxStatus("PENDING")
    try {
      const token = Object.values(GM_TOKENS).find(t => t.symbol === selectedTokens[0])
      if (token) {
        await depositGM(token.address as `0x${string}`, amount)
        setTxStatus("SUCCESS")
      }
    } catch (e) {
      console.error(e)
      setTxStatus("ERROR")
    }
  }

  const handleWithdraw = async () => {
    if (!selectedTokens[0] || !withdrawAmount) return
    setTxStatus("PENDING")
    try {
      const token = Object.values(GM_TOKENS).find(t => t.symbol === selectedTokens[0])
      if (token) {
        await withdrawGM(token.address as `0x${string}`, withdrawAmount)
        setTxStatus("SUCCESS")
      }
    } catch (e) {
      console.error(e)
      setTxStatus("ERROR")
    }
  }

  return (
    <ConnectGate>
      <div className="flex flex-col gap-6 py-8 font-mono">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold tracking-[0.2em] text-foreground/50 uppercase">
            VAULT // DEPOSIT_WITHDRAW
          </h2>
          <div className="flex items-center gap-2 px-2 py-0.5 rounded border border-primary/30 bg-primary/5 text-[10px] text-primary font-bold tracking-wider uppercase">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            SECURE_VAULT_V1 // {chainId === 97 ? "BSC_TESTNET" : chainId === 56 ? "BSC_MAINNET" : "UNKNOWN_CHAIN"}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Panel: Deposit/Withdraw */}
          <div className="lg:col-span-7 space-y-8 text-sm">
            {/* Deposit Section */}
            <div className="bg-card/20 border border-border/40 rounded-2xl p-6 backdrop-blur-md space-y-6">
              <div className="space-y-4">
                <div className="text-[10px] text-foreground/50 uppercase tracking-widest font-bold">Select Active Asset</div>
                <div className="grid gap-3">
                  {Object.entries(GM_TOKENS).map(([key, token]) => (
                    <div 
                      key={key}
                      onClick={() => toggleToken(token.symbol)}
                      className={`flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer ${
                        selectedTokens.includes(token.symbol) 
                          ? "bg-primary/10 border-primary/40" 
                          : "bg-background/40 border-border/20 hover:border-white/10"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                          selectedTokens.includes(token.symbol) ? "bg-primary border-primary" : "border-white/20"
                        }`}>
                          {selectedTokens.includes(token.symbol) && <div className="w-2 h-2 bg-black rounded-sm" />}
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: token.color }} />
                          <span className="font-bold tracking-tight">{token.symbol}</span>
                          <span className="text-[10px] text-foreground/40 font-bold">{token.name}</span>
                        </div>
                      </div>
                      <div className="font-bold text-foreground/70">
                        ${formatUnits(prices[token.symbol] || 0n, 18)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="text-[10px] text-foreground/50 uppercase tracking-widest font-bold">DEPOSIT_AMOUNT</div>
                <div className="relative">
                  <Input 
                    type="number" 
                    placeholder="0.00" 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="bg-background/60 border-border/30 h-14 pl-4 pr-12 text-lg font-bold"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-white/20 uppercase">Units</div>
                </div>
                <Button 
                  onClick={handleDeposit}
                  disabled={txStatus === "PENDING" || !amount}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-black py-7 rounded-xl flex items-center justify-center gap-3 uppercase tracking-widest"
                >
                  <Zap className="w-5 h-5 fill-current" />
                  <span>{txStatus === "PENDING" ? "EXECUTING..." : "DEPOSIT_ASSETS"}</span>
                </Button>
                {txStatus === "SUCCESS" && <div className="text-[10px] text-primary font-bold text-center uppercase tracking-widest">Transaction_Success // Shielded_Ledger_Update</div>}
                {txStatus === "ERROR" && <div className="text-[10px] text-red-500 font-bold text-center uppercase tracking-widest">Transaction_Error // Check_Permissions</div>}
              </div>
            </div>

            {/* Withdraw Section */}
            <div className="bg-card/20 border border-border/40 rounded-2xl p-6 backdrop-blur-md space-y-6">
              <div className="text-[10px] text-foreground/50 uppercase tracking-widest font-bold">WITHDRAW // SETTLE_POSITION</div>
              <div className="space-y-4">
                <div className="relative">
                  <Input 
                    type="number" 
                    placeholder="0.00" 
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="bg-background/60 border-border/30 h-14 pl-4 pr-12 text-lg font-bold"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-white/20 uppercase">Shares</div>
                </div>
                <Button 
                  onClick={handleWithdraw}
                  disabled={txStatus === "PENDING" || !withdrawAmount}
                  variant="outline" className="w-full border-primary/20 hover:bg-primary/5 text-primary font-black py-7 rounded-xl flex items-center justify-center gap-3 uppercase tracking-widest"
                >
                  <ArrowDownLeft className="w-5 h-5" />
                  <span>{txStatus === "PENDING" ? "EXECUTING..." : "WITHDRAW_FROM_VAULT"}</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Right Panel: Status/Shares */}
          <div className="lg:col-span-5 space-y-6">
             {/* Vault Status */}
             <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 space-y-4">
               <h3 className="text-xs font-bold tracking-widest text-primary uppercase flex items-center gap-2">
                 <Shield className="w-4 h-4" />
                 VAULT_STATUS
               </h3>
               <div className="space-y-3">
                 <div className="flex justify-between items-center py-2 border-b border-white/5">
                   <span className="text-[10px] text-white/40 uppercase">Encryption_Status</span>
                   <span className="text-[10px] font-bold text-primary px-2 py-0.5 bg-primary/10 rounded">ACTIVE</span>
                 </div>
                 <div className="flex justify-between items-center py-2 border-b border-white/5">
                   <span className="text-[10px] text-white/40 uppercase">Connection</span>
                   <span className="text-[10px] font-bold text-white/80 uppercase">
                     {isConnected ? `0X...${address?.slice(-4)}` : "DISCONNECTED"}
                   </span>
                 </div>
                 <div className="flex justify-between items-center py-2">
                   <span className="text-[10px] text-white/40 uppercase">Protocol_Version</span>
                   <span className="text-[10px] font-bold text-white/80 uppercase">fhEVM_V1_STABLE</span>
                 </div>
               </div>
             </div>

             {/* Your Shares */}
             <div className="bg-card/20 border border-border/40 rounded-2xl p-8 space-y-6 text-center">
                <div className="text-[10px] text-foreground/50 uppercase tracking-widest font-bold mb-4">YOUR_VAULT_SHARES</div>
                <div className="flex flex-col items-center gap-4">
                  {revealed ? (
                    <div className="text-4xl font-black text-white tabular-nums tracking-tighter">
                      {formatUnits(balance || 0n, 18)}
                    </div>
                  ) : (
                    <div className="px-4 py-2 bg-primary/10 border border-primary/20 rounded-lg text-primary text-xs font-bold tracking-[0.3em] flex items-center gap-3 uppercase">
                      <Lock className="w-4 h-4" />
                      ENCRYPTED
                    </div>
                  )}
                  <Button 
                    onClick={() => setRevealed(!revealed)}
                    className="bg-secondary hover:bg-secondary/80 text-foreground font-bold px-6 py-2 rounded-full flex items-center gap-2 text-[10px] uppercase tracking-widest"
                  >
                    {revealed ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    {revealed ? "HIDE_BALANCE" : "REVEAL_BALANCE"}
                  </Button>
                </div>
             </div>

             {/* Activity Stream */}
             <div className="bg-card/20 border border-border/40 rounded-2xl p-6 space-y-6">
                <div className="text-[10px] text-foreground/50 uppercase tracking-widest font-bold">RECENT_VAULT_EVENTS</div>
                <div className="space-y-6">
                   {[
                     { type: "VAULT_DEPOSIT", asset: "NVDAon", time: "2M AGO" },
                     { type: "VAULT_WITHDRAW", asset: "TSLAon", time: "1H AGO" },
                     { type: "BALANCE_REVEAL", asset: "SYS_CALL", time: "4H AGO" },
                   ].map((event, i) => (
                     <div key={i} className="flex gap-4 group cursor-pointer">
                        <div className="w-0.5 bg-primary/20 group-hover:bg-primary transition-colors" />
                        <div className="space-y-1">
                          <div className="text-[10px] font-bold tracking-wider uppercase text-foreground/90">
                            {event.type}
                          </div>
                          <div className="text-[11px] text-foreground/50 uppercase">
                            Asset: {event.asset} // ENCRYPTED
                          </div>
                        </div>
                        <div className="ml-auto text-[10px] text-foreground/20 whitespace-nowrap">
                          {event.time}
                        </div>
                     </div>
                   ))}
                </div>
                <a href="/transactions" className="block mt-6 text-[10px] text-foreground/40 uppercase hover:text-primary transition-colors flex items-center gap-2 group">
                  View Full Event Log
                  <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </a>
             </div>
          </div>
        </div>
      </div>
    </ConnectGate>
  )
}
