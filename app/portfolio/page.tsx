"use client"

import { useState, useMemo, useEffect } from "react"
import { ConnectGate } from "@/components/connect-gate"
import { Button } from "@/components/ui/button"
import { 
  Lock, 
  Eye, 
  EyeOff, 
  BarChart3, 
  TrendingUp, 
  ShieldCheck, 
  RefreshCcw, 
  Zap, 
  AlertTriangle, 
  ChevronRight,
  Shield,
  Bell,
  Sliders
} from "lucide-react"
import { GM_TOKENS } from "@/lib/constants"
import { useAccount } from "wagmi"
import { usePortfolioPositions, useVaultBalance, usePortfolioNAV, useGMTokenPrices, usePerformanceData, DEMO_MODE } from "@/hooks/useVaults"
import { useRebalancePreview, useSubmitRebalance } from "@/hooks/useRebalance"
import { useSetStopLoss, useSetDriftTrigger, useSaveAlerts } from "@/hooks/useRiskProtection"
import { formatUnits, parseUnits } from "viem"
import { TerminalLoader } from "@/components/terminal-loader"
import { TerminalErrorDisplay } from "@/components/terminal-error-display"
import { useChainId } from "wagmi"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"

import { usePortfolioNAVHistory } from "@/hooks/useChartData"
import NAVChart from "@/components/NAVChart"

export default function PortfolioPage() {
  const { address } = useAccount()
  const [decryptedRows, setDecryptedRows] = useState<string[]>([])
  const chainId = useChainId()

  const { data: positions, loading: positionsLoading } = usePortfolioPositions(address)
  const { data: balance } = useVaultBalance(address)
  const { data: nav } = usePortfolioNAV()
  const { data: prices, loading: pricesLoading } = useGMTokenPrices()
  const { change24h, volatility } = usePerformanceData()

  const { data: navHistory, isLoading: navLoading } = usePortfolioNAVHistory(address || '')

  if (address && (positionsLoading || pricesLoading) && !DEMO_MODE) {
    return <TerminalLoader />
  }

  return (
    <ConnectGate>
      <div className="flex flex-col gap-8 py-8 font-mono">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold tracking-[0.2em] text-foreground/50 uppercase">
            PORTFOLIO // PRIVACY_ENGINE_V2
          </h2>
          <div className="flex items-center gap-2 px-2 py-0.5 rounded border border-primary/30 bg-primary/5 text-[10px] text-primary font-bold tracking-wider uppercase">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            CRE_ENCLAVE_READY
          </div>
        </div>

        <Tabs defaultValue="holdings" className="w-full">
          <TabsList className="bg-white/5 border border-white/10 p-1 rounded-xl w-fit mb-4">
            <TabsTrigger value="holdings" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary text-[10px] font-black uppercase tracking-widest px-6 py-2 rounded-lg transition-all">
              HOLDINGS
            </TabsTrigger>
            <TabsTrigger value="rebalance" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary text-[10px] font-black uppercase tracking-widest px-6 py-2 rounded-lg transition-all">
              REBALANCE
            </TabsTrigger>
            <TabsTrigger value="risk" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary text-[10px] font-black uppercase tracking-widest px-6 py-2 rounded-lg transition-all">
              RISK_PROTECTION
            </TabsTrigger>
          </TabsList>

          <TabsContent value="holdings" className="space-y-10 outline-none">
            <HoldingsTab 
              positions={positions} 
              nav={nav} 
              prices={prices} 
              change24h={change24h} 
              volatility={volatility}
              decryptedRows={decryptedRows}
              setDecryptedRows={setDecryptedRows}
              navHistory={navHistory}
              navLoading={navLoading}
              address={address}
            />
          </TabsContent>

          <TabsContent value="rebalance" className="outline-none">
            <RebalanceTab positions={positions} />
          </TabsContent>

          <TabsContent value="risk" className="outline-none">
            <RiskProtectionTab />
          </TabsContent>
        </Tabs>
      </div>
    </ConnectGate>
  )
}

// ── Tab 1: HOLDINGS ──────────────────────────────────────────────────────────

function HoldingsTab({ positions, nav, prices, change24h, volatility, decryptedRows, setDecryptedRows, navHistory, navLoading, address }: any) {
  const toggleDecrypt = (symbol: string) => {
    setDecryptedRows((prev: string[]) => 
      prev.includes(symbol) ? prev.filter(s => s !== symbol) : [...prev, symbol]
    )
  }

  const mockAllocations: Record<string, number> = {
    'TSLAx': 30, 'NVDAon': 25, 'SPYx': 20, 'QQQon': 15, 'AAPLx': 10
  }

  return (
    <div className="space-y-12">
      {/* Performance Section */}
      <section className="space-y-6">
        <NAVChart 
          data={navHistory || []} 
          userAddress={address || 'UNCONNECTED'} 
          isLoading={navLoading} 
        />
      </section>

      {/* Holdings Table */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
             <div className="size-2 bg-primary rounded-full animate-pulse" />
             <h2 className="text-white text-xs font-black tracking-widest uppercase">HOLDINGS_MATRIX</h2>
          </div>
          <div className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.2em]">STATE: ATTESTED // VERIFIED</div>
        </div>

        <div className="glass-card rounded-2xl border-white/5 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/5 border-b border-white/10 text-[9px] font-black uppercase tracking-widest text-white/40">
                <th className="px-6 py-4">Asset</th>
                <th className="px-6 py-4">Encrypted Balance</th>
                <th className="px-6 py-4">Current Price</th>
                <th className="px-6 py-4">Value USD</th>
                <th className="px-6 py-4">Allocation%</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {Object.entries(GM_TOKENS).map(([key, token]) => {
                const isDecrypted = DEMO_MODE || decryptedRows.includes(token.symbol)
                const position = (positions as Record<string, bigint>)[token.symbol] || BigInt(0)
                const price = (prices as Record<string, bigint>)[token.symbol] || BigInt(0)
                const value = (position * price) / BigInt("1000000000000000000")
                const allocation = mockAllocations[token.symbol] || 0

                return (
                  <tr key={key} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: token.color }} />
                      <span className="font-bold text-sm">{token.symbol}</span>
                    </td>
                    <td className="px-6 py-4 font-black text-xs tabular-nums tracking-tighter">
                      {isDecrypted ? formatUnits(position, 18) : "█████████"}
                    </td>
                    <td className="px-6 py-4 text-foreground/50 font-bold text-xs tabular-nums">
                      ${formatUnits(price, 18)}
                    </td>
                    <td className="px-6 py-4 font-bold text-xs tabular-nums">
                      {isDecrypted ? `$${formatUnits(value, 18)}` : "████"}
                    </td>
                    <td className="px-6 py-4 w-48">
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[8px] font-black text-foreground/30 uppercase">
                          <span>{allocation}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full transition-all duration-1000" 
                            style={{ width: `${allocation}%`, boxShadow: '0 0 10px rgba(var(--primary), 0.5)' }} 
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => toggleDecrypt(token.symbol)}
                        className="h-7 px-3 rounded-md bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                      >
                        {isDecrypted ? <EyeOff className="size-3 mr-2" /> : <Eye className="size-3 mr-2" />}
                        {isDecrypted ? "HIDE" : "DECRYPT"}
                      </Button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

// ── Tab 2: REBALANCE ─────────────────────────────────────────────────────────

function RebalanceTab({ positions }: any) {
  const currentAlloc: Record<string, number> = {
    'TSLAx': 30, 'NVDAon': 25, 'SPYx': 20, 'QQQon': 15, 'AAPLx': 10
  }
  
  const [targetAlloc, setTargetAlloc] = useState<Record<string, number>>(currentAlloc)
  const [status, setStatus] = useState<string | null>(null)
  
  const trades = useRebalancePreview(currentAlloc, targetAlloc)
  const { execute: submitRebalance, loading } = useSubmitRebalance()
  
  const totalAlloc = Object.values(targetAlloc).reduce((a, b) => a + b, 0)
  const isValid = Math.abs(totalAlloc - 100) < 0.01

  const setStrategy = (type: 'EQUAL' | 'RISK' | 'MCAP') => {
    const symbols = Object.keys(currentAlloc)
    const newAlloc: Record<string, number> = {}
    
    if (type === 'EQUAL') {
      const weight = Math.floor(100 / symbols.length)
      symbols.forEach(s => newAlloc[s] = weight)
      // Add remainder to first
      newAlloc[symbols[0]] += (100 - weight * symbols.length)
    } else if (type === 'RISK') {
      // Mock risk parity
      const weights = [15, 20, 25, 10, 30]
      symbols.forEach((s, i) => newAlloc[s] = weights[i % weights.length])
    } else {
      // Mock market cap
      const weights = [40, 20, 15, 15, 10]
      symbols.forEach((s, i) => newAlloc[s] = weights[i % weights.length])
    }
    setTargetAlloc(newAlloc)
  }

  const handleRebalance = async () => {
    setStatus("ENCRYPTING_REBALANCE_INTENT...")
    try {
      await submitRebalance(trades)
      setStatus("REBALANCE_SUBMITTED // CRE_WILL_EXECUTE_IN_30S")
      setTimeout(() => setStatus(null), 5000)
    } catch (e) {
      setStatus("ERROR // FAILED_TO_SUBMIT")
      setTimeout(() => setStatus(null), 3000)
    }
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="space-y-2">
        <h2 className="text-xl font-black tracking-tighter text-white uppercase flex items-center gap-3">
          <RefreshCcw className="size-5 text-primary" />
          PORTFOLIO_REBALANCER // <span className="text-primary/50">ENCRYPTED</span>
        </h2>
        
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 font-mono text-[10px] text-foreground/40 leading-relaxed">
          <p>REBALANCING COMPUTES YOUR TARGET ALLOCATION OFF-CHAIN INSIDE A TEE.</p>
          <p>YOUR ACTUAL POSITIONS REMAIN ENCRYPTED. THE CRE ONLY SEES PERCENTAGE</p>
          <p>WEIGHTS, NEVER ABSOLUTE BALANCES.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Current Allocation */}
        <div className="glass-card rounded-2xl p-6 border-white/5 space-y-6">
           <h3 className="text-[10px] font-black tracking-widest text-foreground/40 uppercase">CURRENT_ALLOCATION</h3>
           <div className="space-y-4">
              {Object.entries(currentAlloc).map(([symbol, pct]) => (
                <div key={symbol} className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold">
                    <span className="text-foreground/60">{symbol}</span>
                    <span className="text-primary">{pct}%</span>
                  </div>
                  <div className="flex gap-px">
                     {Array.from({ length: 20 }).map((_, i) => (
                       <div key={i} className={cn("h-3 flex-1 rounded-sm", i < pct/5 ? "bg-primary/40" : "bg-white/5")} />
                     ))}
                  </div>
                </div>
              ))}
           </div>
        </div>

        {/* Target Allocation */}
        <div className="glass-card rounded-2xl p-6 border-white/5 space-y-6">
           <h3 className="text-[10px] font-black tracking-widest text-foreground/40 uppercase">TARGET_ALLOCATION</h3>
           <div className="space-y-6">
              {Object.entries(targetAlloc).map(([symbol, pct]) => (
                <div key={symbol} className="space-y-3">
                  <div className="flex justify-between text-[10px] font-bold">
                    <span className="text-foreground/60">{symbol}</span>
                    <span className="text-primary">{pct}%</span>
                  </div>
                  <Slider 
                    value={[pct]} 
                    max={100} 
                    step={1}
                    onValueChange={([val]) => setTargetAlloc(prev => ({ ...prev, [symbol]: val }))}
                  />
                </div>
              ))}

              <div className={cn(
                "p-3 rounded-lg text-[10px] font-black text-center border uppercase tracking-widest",
                isValid ? "bg-green-500/10 border-green-500/20 text-green-500" : "bg-red-500/10 border-red-500/20 text-red-500"
              )}>
                {isValid ? `TOTAL: ${totalAlloc}% // VALID` : `TOTAL: ${totalAlloc}% // NEEDS ${100 - totalAlloc}% ${totalAlloc > 100 ? 'LESS' : 'MORE'}`}
              </div>
           </div>
        </div>
      </div>

      {/* Strategies */}
      <div className="flex flex-wrap gap-3">
        <StrategyButton label="EQUAL_WEIGHT" onClick={() => setStrategy('EQUAL')} />
        <StrategyButton label="RISK_PARITY" onClick={() => setStrategy('RISK')} />
        <StrategyButton label="MARKET_CAP" onClick={() => setStrategy('MCAP')} />
      </div>

      {/* Preview Panel */}
      {trades.length > 0 && (
        <div className="glass-card rounded-2xl p-6 border-primary/20 bg-primary/5 space-y-4">
           <h3 className="text-[10px] font-black tracking-widest text-primary uppercase">REBALANCE_PREVIEW</h3>
           <div className="space-y-2">
             {trades.map((trade, i) => (
               <div key={i} className="text-[11px] font-bold flex items-center justify-between border-b border-primary/10 pb-2">
                 <span className={cn(trade.side === 'BUY' ? 'text-green-500' : 'text-red-500')}>
                    {trade.side} {trade.percentage}% {trade.symbol}
                 </span>
                 <span className="text-foreground/20 text-[9px] uppercase tracking-tighter">ENCRYPTED // HIDDEN</span>
               </div>
             ))}
           </div>
           
           <Button 
            disabled={!isValid || loading}
            onClick={handleRebalance}
            className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-black text-xs uppercase tracking-[0.2em] rounded-xl relative overflow-hidden group"
           >
              {loading ? (
                <div className="flex items-center gap-3">
                   <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                   ENCRYPTING...
                </div>
              ) : (
                "SUBMIT_REBALANCE"
              )}
           </Button>
           
           {status && (
             <div className="text-[10px] font-black text-primary animate-pulse text-center mt-2 uppercase tracking-widest">
                {status}
             </div>
           )}
        </div>
      )}
    </div>
  )
}

function StrategyButton({ label, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-[9px] font-black text-foreground/50 hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-all uppercase tracking-widest"
    >
      {label}
    </button>
  )
}

// ── Tab 3: RISK_PROTECTION ──────────────────────────────────────────────────

function RiskProtectionTab() {
  const { execute: setStopLoss } = useSetStopLoss()
  const { execute: setDrift } = useSetDriftTrigger()
  const { execute: saveAlerts } = useSaveAlerts()

  const [driftValue, setDriftValue] = useState(5)
  const [alertSettings, setAlertSettings] = useState({ navBelow: "10000", posAbove: "40", lossAbove: "15" })

  return (
    <div className="space-y-10 max-w-5xl mx-auto">
      <div className="space-y-2">
        <h2 className="text-xl font-black tracking-tighter text-white uppercase flex items-center gap-3">
          <Shield className="size-5 text-primary" />
          RISK_PROTECTION // <span className="text-primary/50">VAULT_SHIELD</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Module 1: Stop Loss */}
        <div className="glass-card rounded-2xl p-8 border-white/5 space-y-6">
           <div className="space-y-2">
              <h3 className="text-xs font-black tracking-widest text-foreground uppercase flex items-center gap-2">
                <AlertTriangle className="size-4 text-orange-500" />
                STOP_LOSS_ENGINE
              </h3>
              <p className="text-[10px] text-foreground/40 leading-relaxed font-bold uppercase">
                Automatically exit a position if it drops below your threshold.
                Executed privately by CRE — nobody sees your stop price.
              </p>
           </div>

           <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {Object.keys(GM_TOKENS).map((symbol) => (
                <div key={symbol} className="flex items-center justify-between group">
                   <span className="text-[10px] font-bold text-foreground/60">{symbol}</span>
                   <div className="flex items-center gap-3">
                      <div className="flex items-center bg-white/5 border border-white/10 rounded px-2">
                        <input 
                          type="number" 
                          placeholder="0" 
                          className="bg-transparent w-10 h-8 text-[10px] font-bold focus:outline-none"
                        />
                        <span className="text-[9px] text-foreground/20 font-bold">%</span>
                      </div>
                      <div className="text-[8px] font-black text-foreground/20 uppercase tracking-widest bg-white/5 px-2 py-1 rounded">
                        INACTIVE
                      </div>
                   </div>
                </div>
              ))}
           </div>

           <Button className="w-full bg-white/5 border border-white/10 text-foreground/50 hover:text-white hover:bg-white/10 text-[10px] font-black uppercase tracking-widest h-12 rounded-xl">
             SET_STOP_LOSSES
           </Button>
        </div>

        <div className="space-y-8">
           {/* Module 2: Rebalance Triggers */}
           <div className="glass-card rounded-2xl p-8 border-white/5 space-y-6">
              <div className="space-y-2">
                <h3 className="text-xs font-black tracking-widest text-foreground uppercase flex items-center gap-2">
                  <Sliders className="size-4 text-primary" />
                  REBALANCE_TRIGGERS
                </h3>
                <p className="text-[10px] text-foreground/40 leading-relaxed font-bold uppercase">
                  Auto-rebalance when any position drifts more than X% from target.
                </p>
              </div>

              <div className="flex items-center justify-between">
                 <span className="text-[10px] font-bold text-foreground/60 uppercase">DRIFT_THRESHOLD</span>
                 <div className="flex items-center bg-white/5 border border-white/10 rounded px-3">
                    <input 
                      type="number" 
                      value={driftValue} 
                      onChange={(e) => setDriftValue(Number(e.target.value))}
                      className="bg-transparent w-12 h-10 text-[10px] font-black focus:outline-none"
                    />
                    <span className="text-[9px] text-foreground/20 font-bold">%</span>
                 </div>
              </div>

              <div className="flex items-center justify-between border-t border-white/5 pt-4">
                 <span className="text-[10px] font-bold text-foreground/60 uppercase">AUTO_REBALANCE</span>
                 <div className="text-[10px] font-black text-red-500/50 uppercase tracking-widest">OFF</div>
              </div>

              <div className="text-[9px] text-foreground/20 font-bold uppercase text-center italic">
                LAST_REBALANCE: NEVER_CHECKED
              </div>

              <Button 
                onClick={() => setDrift(driftValue)}
                className="w-full bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 text-[10px] font-black uppercase tracking-widest h-12 rounded-xl"
              >
                SAVE_TRIGGER_SETTINGS
              </Button>
           </div>

           {/* Module 3: Portfolio Alerts */}
           <div className="glass-card rounded-2xl p-8 border-white/5 space-y-6">
              <div className="space-y-2">
                <h3 className="text-xs font-black tracking-widest text-foreground uppercase flex items-center gap-2">
                  <Bell className="size-4 text-yellow-500" />
                  PORTFOLIO_ALERTS
                </h3>
                <p className="text-[10px] text-foreground/40 leading-relaxed font-bold uppercase">
                  Get notified when your encrypted portfolio hits thresholds.
                </p>
              </div>

              <div className="space-y-4">
                 <AlertInput 
                    label="NAV drops below" 
                    unit="$" 
                    value={alertSettings.navBelow} 
                    onChange={(v: string) => setAlertSettings(p => ({ ...p, navBelow: v }))} 
                  />
                 <AlertInput 
                    label="Single position exceeds" 
                    unit="%" 
                    value={alertSettings.posAbove} 
                    onChange={(v: string) => setAlertSettings(p => ({ ...p, posAbove: v }))} 
                  />
                 <AlertInput 
                    label="24H loss exceeds" 
                    unit="%" 
                    value={alertSettings.lossAbove} 
                    onChange={(v: string) => setAlertSettings(p => ({ ...p, lossAbove: v }))} 
                  />
              </div>

              <div className="flex items-center justify-between border-t border-white/5 pt-4">
                <span className="text-[10px] font-bold text-foreground/60 uppercase">NOTIFICATIONS</span>
                <div className="text-[10px] font-black text-green-500/50 uppercase tracking-widest">ON</div>
              </div>

              <Button 
                onClick={() => saveAlerts(alertSettings)}
                className="w-full bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 text-[10px] font-black uppercase tracking-widest h-12 rounded-xl"
              >
                SAVE_ALERTS_CONFIG
              </Button>
              
              <div className="text-[8px] text-foreground/30 font-bold text-center uppercase">
                * ALERTS ARE COMPUTED BY CRE // YOUR BALANCES STAY ENCRYPTED
              </div>
           </div>
        </div>
      </div>
    </div>
  )
}

function AlertInput({ label, unit, value, onChange }: any) {
  return (
    <div className="flex items-center justify-between gap-4">
       <span className="text-[10px] font-bold text-foreground/60 uppercase">{label}</span>
       <div className="flex items-center bg-white/5 border border-white/10 rounded px-2">
          {unit === '$' && <span className="text-[10px] text-foreground/20 mr-1 font-bold">{unit}</span>}
          <input 
            type="text" 
            value={value} 
            onChange={(e) => onChange(e.target.value)}
            className="bg-transparent w-16 h-8 text-[10px] font-black focus:outline-none text-right"
          />
          {unit === '%' && <span className="text-[10px] text-foreground/20 ml-1 font-bold">{unit}</span>}
       </div>
    </div>
  )
}

function StatCard({ label, value, subValue, icon: Icon, color = "text-white", primary }: any) {
  return (
    <div className={cn(
      "glass-card rounded-2xl p-6 border-l-4 relative overflow-hidden group transition-all hover:translate-y-[-2px]",
      primary ? "border-l-primary/40 bg-primary/[0.02]" : "border-l-white/10"
    )}>
      <p className="text-foreground/40 text-[9px] font-black uppercase tracking-[0.2em] mb-3">{label}</p>
      <div className="flex items-baseline gap-2">
        <h1 className={cn("text-2xl lg:text-3xl font-black tracking-tighter tabular-nums", color)}>
          {value}
        </h1>
        <span className="text-foreground/20 font-black text-[9px] tracking-widest uppercase">{subValue}</span>
      </div>
      <Icon className="absolute -bottom-2 -right-2 w-12 h-12 text-foreground/5 opacity-[0.03] group-hover:opacity-10 transition-all pointer-events-none" />
    </div>
  )
}
