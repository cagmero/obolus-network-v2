"use client"

import { useParams, useRouter } from "next/navigation"
import { useState, useMemo } from "react"
import { 
  ArrowLeft, 
  Info, 
  TrendingUp, 
  Activity, 
  Zap, 
  Lock, 
  ShieldCheck, 
  ChevronRight, 
  Plus, 
  Minus,
  LineChart as LineChartIcon,
  Globe
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { getVaultById } from "@/lib/vaults"
import { useVaultDeposit, useVaultWithdraw } from "@/hooks/useVaults"
import { cn } from "@/lib/utils"
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts"

export default function VaultDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const vault = getVaultById(id as string)
  
  const [depositAmount, setDepositAmount] = useState("")
  const [withdrawAmount, setWithdrawAmount] = useState("")
  const [depositSlider, setDepositSlider] = useState([0])
  const [withdrawSlider, setWithdrawSlider] = useState([0])
  
  const { execute: handleDeposit } = useVaultDeposit()
  const { execute: handleWithdraw } = useVaultWithdraw()

  // Mock chart data
  const chartData = useMemo(() => {
    if (!vault) return []
    const basePrice = vault.mockPrice
    return Array.from({ length: 30 }).map((_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (30 - i))
      return {
        name: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        price: basePrice * (1 + (Math.random() * 0.1 - 0.05)),
        apy: vault.mockAPY * (1 + (Math.random() * 0.2 - 0.1)),
        tvl: Math.random() * 1000000 + 500000
      }
    })
  }, [vault])

  if (!vault) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] font-mono">
        <h2 className="text-xl font-bold mb-4">VAULT_NOT_FOUND // ERROR_404</h2>
        <Button onClick={() => router.push('/vaults')} variant="outline">RETURN_TO_VAULTS</Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8 font-mono pb-20 max-w-7xl mx-auto">
      {/* Breadcrumbs / Back */}
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          onClick={() => router.push('/vaults')}
          className="h-8 px-2 text-foreground/40 hover:text-primary transition-colors text-[10px] uppercase font-black tracking-widest"
        >
          <ArrowLeft className="w-3 h-3 mr-2" />
          BACK_TO_LIST
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Info & Stats */}
        <div className="lg:col-span-8 space-y-10">
          {/* Header */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
               <div className="w-2.5 h-12 rounded-full" style={{ backgroundColor: vault.color }} />
               <div>
                  <h1 className="text-4xl font-black tracking-tighter text-foreground uppercase leading-none">
                    {vault.name} // <span className="text-foreground/40">{vault.symbol}</span>
                  </h1>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Badge label="CHAIN: BSC_TESTNET" />
                    <Badge label="PLATFORM: OBOLUS_VAULT" />
                    <Badge label="PRIVACY: fhEVM_ENCRYPTED" />
                  </div>
               </div>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard label="TVL" value={`$${(chartData[chartData.length-1]?.tvl / 1000).toFixed(1)}K`} subValue="TOTAL_LOCKED" />
            <StatCard label="APY" value={`${vault.mockAPY}%`} subValue="CURRENT_YIELD" color="text-green-500" />
            <StatCard label="DAILY" value={`${vault.mockDailyAPY}%`} subValue="DAILY_RATE" />
          </div>

          {/* User Specific Stats */}
          <div className="bg-card/10 border border-border/20 rounded-2xl p-6 backdrop-blur-sm grid grid-cols-2 gap-8 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-5">
                <ShieldCheck className="w-24 h-24" />
             </div>
             <div>
                <span className="text-[9px] text-foreground/40 font-black uppercase tracking-widest">YOUR_DEPOSIT</span>
                <div className="text-2xl font-black text-foreground mt-1">0 {vault.symbol}</div>
                <div className="text-[10px] text-foreground/20 uppercase mt-1">Value: $0.00</div>
             </div>
             <div>
                <span className="text-[9px] text-foreground/40 font-black uppercase tracking-widest">LAST_HARVEST</span>
                <div className="text-2xl font-black text-foreground/60 mt-1 uppercase">NEVER</div>
                <div className="text-[10px] text-foreground/20 uppercase mt-1">Pending: $0.00</div>
             </div>
          </div>

          {/* Vault Info */}
          <div className="space-y-4">
            <h3 className="text-xs font-black tracking-widest text-foreground/40 uppercase flex items-center gap-2">
              <Info className="w-3.5 h-3.5" />
              VAULT_INFO
            </h3>
            <div className="bg-white/5 border border-border/10 rounded-2xl p-6">
               <p className="text-sm text-foreground/80 leading-relaxed font-medium">
                 {vault.description}
               </p>
               <div className="grid grid-cols-2 gap-6 mt-8">
                  <div className="space-y-1">
                     <span className="text-[9px] text-foreground/40 font-black uppercase tracking-widest">STRATEGY</span>
                     <p className="text-[11px] font-bold text-foreground/70">DYNAMIC_EXPOSURE_COMPOUNDING</p>
                  </div>
                  <div className="space-y-1 text-right">
                     <span className="text-[9px] text-foreground/40 font-black uppercase tracking-widest">UNDERLYING</span>
                     <p className="text-[11px] font-bold text-foreground/70 uppercase">{vault.underlying} // NASDAQ</p>
                  </div>
               </div>
            </div>
          </div>

          {/* Historical Rate / Chart */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black tracking-widest text-foreground/40 uppercase flex items-center gap-2">
                <LineChartIcon className="w-3.5 h-3.5" />
                HISTORICAL_RATE
              </h3>
              <div className="flex gap-1">
                {['APY', 'TVL', 'PRICE'].map((tab) => (
                  <button key={tab} className="px-3 py-1 text-[9px] font-black uppercase tracking-widest border border-border/20 rounded-md hover:bg-primary/10 hover:border-primary/20 transition-all text-foreground/60">
                    {tab}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="bg-white/5 border border-border/10 rounded-3xl p-6 h-[400px]">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={vault.color} stopOpacity={0.3}/>
                        <stop offset="95%" stopColor={vault.color} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.3)', fontWeight: 900 }}
                      dy={10}
                    />
                    <YAxis 
                      hide
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#000', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                      itemStyle={{ color: vault.color, fontSize: '10px', fontWeight: 900, textTransform: 'uppercase' }}
                      labelStyle={{ color: 'rgba(255,255,255,0.4)', fontSize: '9px', fontWeight: 900, marginBottom: '4px' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="price" 
                      stroke={vault.color} 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorPrice)" 
                      animationDuration={2000}
                    />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Column: Deposit Widget */}
        <div className="lg:col-span-4 space-y-6">
          <div className="sticky top-24 space-y-6">
            <div className="bg-card/20 border-2 border-border/40 rounded-3xl overflow-hidden backdrop-blur-xl shadow-2xl">
              <Tabs defaultValue="deposit" className="w-full">
                <TabsList className="w-full h-16 bg-white/5 rounded-none p-0 border-b border-border/20">
                  <TabsTrigger 
                    value="deposit" 
                    className="flex-1 h-full font-black text-[11px] uppercase tracking-widest data-[state=active]:bg-white/5 data-[state=active]:text-primary rounded-none transition-all"
                  >
                    DEPOSIT
                  </TabsTrigger>
                  <TabsTrigger 
                    value="withdraw" 
                    className="flex-1 h-full font-black text-[11px] uppercase tracking-widest data-[state=active]:bg-white/5 data-[state=active]:text-red-500 rounded-none transition-all"
                  >
                    WITHDRAW
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="deposit" className="p-8 space-y-8 mt-0 outline-none">
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">SELECT_TOKEN</label>
                      <span className="text-[10px] font-black text-foreground/20 uppercase">BAL: 0.00</span>
                    </div>
                    
                    <div className="relative">
                      <input 
                        type="number" 
                        placeholder="0"
                        className="w-full h-16 bg-white/5 border border-border/40 rounded-2xl px-6 text-2xl font-black text-foreground focus:outline-none focus:border-primary/40 focus:bg-white/10 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                      />
                      <button className="absolute right-4 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-primary/20 text-primary border border-primary/30 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-primary/30 transition-all">
                        MAX
                      </button>
                    </div>

                    <div className="pt-2 px-2">
                       <Slider 
                         defaultValue={[0]} 
                         max={100} 
                         step={25}
                         value={depositSlider}
                         onValueChange={setDepositSlider}
                        />
                       <div className="flex justify-between mt-3 px-1 text-[9px] font-black text-foreground/20">
                          <span>0%</span>
                          <span>25%</span>
                          <span>50%</span>
                          <span>75%</span>
                          <span>100%</span>
                       </div>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-white/5 border border-border/10">
                     <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                        <span className="text-foreground/40">YOU_DEPOSIT</span>
                        <span className="text-foreground">{depositAmount || '0'} {vault.symbol}</span>
                     </div>
                  </div>

                  <Button 
                    className="w-full h-16 bg-primary hover:bg-primary/90 text-primary-foreground font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-[0_0_20px_rgba(var(--primary),0.3)] group"
                    onClick={() => handleDeposit(vault.tokenAddress as `0x${string}`, depositAmount)}
                  >
                    DEPOSIT_ASSETS
                  </Button>

                  <div className="space-y-3 pt-2">
                     <FeeRow label="DEPOSIT_FEE" value="0%" />
                     <FeeRow label="WITHDRAWAL_FEE" value="0%" />
                     <p className="text-[9px] text-foreground/30 font-bold uppercase tracking-widest leading-relaxed mt-4">
                        * APY accounts for performance fee deducted from yield only
                     </p>
                  </div>
                </TabsContent>

                <TabsContent value="withdraw" className="p-8 space-y-8 mt-0 outline-none">
                  {/* Similar to deposit but for withdrawal */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">AMOUNT_TO_WITHDRAW</label>
                      <span className="text-[10px] font-black text-foreground/20 uppercase">DEPOSITED: 0</span>
                    </div>
                    
                    <div className="relative">
                      <input 
                        type="number" 
                        placeholder="0"
                        className="w-full h-16 bg-white/5 border border-border/40 rounded-2xl px-6 text-2xl font-black text-foreground focus:outline-none focus:border-red-500/40 focus:bg-white/10 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                      />
                      <button className="absolute right-4 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-red-500/20 text-red-500 border border-red-500/30 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-red-500/30 transition-all">
                        MAX
                      </button>
                    </div>

                    <div className="pt-2 px-2">
                       <Slider 
                         defaultValue={[0]} 
                         max={100} 
                         step={25}
                         value={withdrawSlider}
                         onValueChange={setWithdrawSlider}
                        />
                    </div>
                  </div>

                  <Button 
                    className="w-full h-16 bg-red-500 hover:bg-red-600 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl group"
                    onClick={() => handleWithdraw(vault.tokenAddress as `0x${string}`, withdrawAmount)}
                  >
                    WITHDRAW_ASSETS
                  </Button>
                </TabsContent>
              </Tabs>
            </div>

            {/* Privacy Shield Info */}
            <div className="bg-primary/5 border border-primary/20 rounded-3xl p-6 backdrop-blur-md relative overflow-hidden group">
               <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:rotate-12 transition-transform duration-500">
                  <ShieldCheck className="w-24 h-24 text-primary" />
               </div>
               <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                     <Lock className="w-4 h-4 text-primary" />
                  </div>
                  <h4 className="text-[11px] font-black uppercase tracking-widest text-primary">PRIVACY_SHIELD_ACTIVE</h4>
               </div>
               <p className="text-[10px] text-foreground/60 font-medium uppercase tracking-widest leading-relaxed">
                  Your position in this vault is encrypted via Chainlink CRE.
                  Nobody can see your balance or portfolio composition.
               </p>
               <div className="mt-4 pt-4 border-t border-primary/20 flex items-center justify-between">
                  <span className="text-[8px] font-bold text-primary/40 uppercase">ENCRYPTION: AES_256 // fhEVM</span>
                  <Globe className="w-3 h-3 text-primary/40" />
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Badge({ label }: { label: string }) {
  return (
    <div className="px-2.5 py-1 rounded-md bg-white/5 border border-border/20 text-[9px] font-black uppercase tracking-[0.15em] text-foreground/50">
      {label}
    </div>
  )
}

function StatCard({ label, value, subValue, color = "text-foreground" }: { label: string, value: string, subValue: string, color?: string }) {
  return (
    <div className="bg-card/20 border border-border/20 rounded-2xl p-5 backdrop-blur-sm">
      <div className="text-[9px] text-foreground/30 font-black uppercase tracking-widest mb-2">{label}</div>
      <div className={cn("text-2xl font-black tracking-tighter", color)}>{value}</div>
      <div className="text-[8px] text-foreground/20 font-bold uppercase tracking-widest mt-1">{subValue}</div>
    </div>
  )
}

function FeeRow({ label, value }: { label: string, value: string }) {
  return (
     <div className="flex justify-between items-center">
        <span className="text-[9px] font-black text-foreground/40 uppercase tracking-widest">{label}</span>
        <span className="text-[10px] font-black text-foreground/80 uppercase">{value}</span>
     </div>
  )
}
