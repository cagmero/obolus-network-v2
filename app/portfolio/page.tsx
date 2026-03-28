"use client"

import { useState } from "react"
import { ConnectGate } from "@/components/connect-gate"
import { Button } from "@/components/ui/button"
import { Lock, Eye, EyeOff, BarChart3, TrendingUp, ShieldCheck } from "lucide-react"
import { GM_TOKENS } from "@/lib/constants"
import { useAccount } from "wagmi"
import { usePortfolioPositions, useVaultBalance, usePortfolioNAV, useGMTokenPrices } from "@/hooks/useVaults"
import { formatUnits } from "viem"

export default function PortfolioPage() {
  const { address } = useAccount()
  const [decryptedRows, setDecryptedRows] = useState<string[]>([])

  const { data: positions, loading: positionsLoading } = usePortfolioPositions(address)
  const { data: balance } = useVaultBalance(address)
  const { data: nav } = usePortfolioNAV(address)
  const { data: prices } = useGMTokenPrices()

  const toggleDecrypt = (symbol: string) => {
    setDecryptedRows(prev => 
      prev.includes(symbol) ? prev.filter(s => s !== symbol) : [...prev, symbol]
    )
  }

  return (
    <ConnectGate>
      <div className="flex flex-col gap-8 py-8 font-mono">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold tracking-[0.2em] text-foreground/50 uppercase">
            PORTFOLIO // ENCRYPTED_HOLDINGS
          </h2>
          <div className="flex items-center gap-2 px-2 py-0.5 rounded border border-primary/30 bg-primary/5 text-[10px] text-primary font-bold tracking-wider uppercase">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            fhEVM_DECRYPTION_GATEWAY
          </div>
        </div>

        {/* Top Stats Bar */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card rounded-2xl p-8 border-l-4 border-l-primary/40 relative overflow-hidden group">
            <p className="text-foreground/50 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">Vault Total NAV</p>
            <div className="flex items-baseline gap-2">
              <h1 className="text-white text-5xl font-black tracking-tighter tabular-nums">
                ${formatUnits(nav || 0n, 18)}
              </h1>
              <span className="text-primary font-bold text-xs tracking-widest uppercase">USD</span>
            </div>
            <TrendingUp className="absolute -bottom-2 -right-2 w-16 h-16 text-primary/5 group-hover:text-primary/10 transition-colors" />
          </div>

          <div className="glass-card rounded-2xl p-8 border-l-4 border-l-white/10 relative overflow-hidden group">
            <p className="text-foreground/50 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">User Shares</p>
            <div className="flex items-baseline gap-2">
              <h1 className="text-white text-5xl font-black tracking-tighter tabular-nums">
                {formatUnits(balance || 0n, 18)}
              </h1>
              <span className="text-white/30 font-bold text-xs tracking-widest uppercase truncate max-w-[80px]">wGM_SHARES</span>
            </div>
            <Lock className="absolute -bottom-2 -right-2 w-16 h-16 text-white/5 group-hover:text-white/10 transition-colors" />
          </div>

          <div className="glass-card rounded-2xl p-8 border-l-4 border-l-white/10 relative overflow-hidden group">
            <p className="text-foreground/50 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">Portfolio Change 24H</p>
            <div className="flex items-baseline gap-2">
              <h1 className="text-white text-5xl font-black tracking-tighter tabular-nums">+0.00%</h1>
              <span className="text-white/30 font-bold text-xs tracking-widest uppercase">STABLE</span>
            </div>
            <BarChart3 className="absolute -bottom-2 -right-2 w-16 h-16 text-white/5 group-hover:text-white/10 transition-colors" />
          </div>
        </section>

        {/* Holdings Matrix */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-white text-lg font-bold tracking-tight uppercase tracking-wider">HOLDINGS_MATRIX</h2>
            <div className="bg-primary/10 text-primary text-[10px] font-black px-2 py-0.5 rounded-full uppercase border border-primary/20 tracking-tighter">
              LIVE_DATA // ENCRYPTED_STATE
            </div>
          </div>
          
          <div className="glass-card rounded-2xl border-border/10 overflow-hidden">
            <div className="overflow-x-auto overflow-y-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-white/5 border-b border-white/10 text-[10px] font-bold uppercase tracking-widest text-white/40">
                    <th className="px-6 py-4">Asset</th>
                    <th className="px-6 py-4">Encrypted Balance</th>
                    <th className="px-6 py-4">Current Price</th>
                    <th className="px-6 py-4">Value USD (Est)</th>
                    <th className="px-6 py-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {Object.entries(GM_TOKENS).map(([key, token]) => {
                    const isDecrypted = decryptedRows.includes(token.symbol)
                    const position = positions[token.symbol] || 0n
                    const price = prices[token.symbol] || 0n
                    const value = (position * price) / 10n**18n
                    
                    return (
                      <tr key={key} className="group hover:bg-white/[0.04] transition-all">
                        <td className="px-6 py-4 font-bold flex items-center gap-3 tracking-tight">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: token.color }} />
                          {token.symbol}
                        </td>
                        <td className="px-6 py-4 font-black tabular-nums tracking-tighter text-lg">
                          {isDecrypted ? formatUnits(position, 18) : "██████"}
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => toggleDecrypt(token.symbol)}
                            className="ml-3 h-6 px-2 rounded-md bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 text-[9px] font-bold uppercase tracking-widest"
                          >
                            {isDecrypted ? <EyeOff className="size-3" /> : <Lock className="size-3" />}
                            {isDecrypted ? "HIDE" : "DECRYPT"}
                          </Button>
                        </td>
                        <td className="px-6 py-4 text-foreground/70 font-bold tabular-nums">
                           ${formatUnits(price, 18)}
                        </td>
                        <td className="px-6 py-4 font-bold tabular-nums tracking-tight">
                          {isDecrypted ? `$${formatUnits(value, 18)}` : "████"}
                        </td>
                        <td className="px-6 py-4 text-right">
                           <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded-full bg-primary/5 border border-primary/20 text-[9px] font-bold text-primary tracking-widest uppercase">
                             <ShieldCheck className="size-3" />
                             SECURED
                           </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Performance Chart Placeholder */}
        <section className="bg-card/20 border border-dashed border-border/40 rounded-2xl p-16 flex flex-col items-center justify-center text-center space-y-4">
           <div className="size-16 rounded-full bg-primary/5 border border-primary/20 flex items-center justify-center text-primary/40 animate-pulse">
              <BarChart3 className="size-8" />
           </div>
           <div>
             <h3 className="text-white text-xs font-bold tracking-widest uppercase">PERFORMANCE_CHART</h3>
             <p className="text-[10px] text-foreground/30 font-bold uppercase tracking-tighter mt-1">CHART_LOADING // ENCRYPTED_V1</p>
           </div>
        </section>
      </div>
    </ConnectGate>
  )
}
