"use client"

import React, { useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { Shield, Lock } from 'lucide-react'

interface NAVChartProps {
  data: { timestamp: string; nav: number }[]
  userAddress: string
  isLoading?: boolean
  blurred?: boolean
}

const RANGES = ['1W', '1M', '3M', 'ALL']

export default function NAVChart({
  data,
  userAddress,
  isLoading = false,
  blurred = false,
}: NAVChartProps) {
  const [timeRange, setTimeRange] = React.useState('1M')

  const stats = useMemo(() => {
    if (!data || data.length < 2) return { return: 0, best: 0, worst: 0 }
    
    const first = data[0].nav
    const last = data[data.length - 1].nav
    const totalReturn = ((last - first) / first) * 100
    
    // Simple daily change for best/worst (assumes roughly daily data)
    let best = -Infinity
    let worst = Infinity
    for (let i = 1; i < data.length; i++) {
        const d = ((data[i].nav - data[i-1].nav) / data[i-1].nav) * 100
        if (d > best) best = d
        if (d < worst) worst = d
    }

    return {
        return: totalReturn,
        best: best === -Infinity ? 0 : best,
        worst: worst === Infinity ? 0 : worst
    }
  }, [data])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-3 gap-4">
           {[1,2,3].map(i => <Skeleton key={i} className="h-20 bg-white/5 rounded-2xl" />)}
        </div>
        <Skeleton className="h-[300px] w-full bg-white/5 rounded-3xl" />
      </div>
    )
  }

  const isPositive = stats.return >= 0
  const lineColor = isPositive ? '#22c55e' : '#ef4444'

  return (
    <div className="space-y-8 font-mono">
      {/* Mini Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
            { label: "TOTAL_RETURN", value: `${isPositive ? "+" : ""}${stats.return.toFixed(1)}%`, color: isPositive ? "text-green-500" : "text-red-500" },
            { label: "BEST_DAY", value: `${stats.best > 0 ? "+" : ""}${stats.best.toFixed(1)}%`, color: "text-green-500" },
            { label: "WORST_DAY", value: `${stats.worst.toFixed(1)}%`, color: "text-red-500" },
            { label: "CURRENT_NAV", value: `$${data[data.length-1]?.nav.toLocaleString() || "---"}`, color: "text-foreground", isEncrypted: true },
        ].map((stat, i) => (
            <div key={i} className="bg-card/20 border border-border/40 rounded-2xl p-6 backdrop-blur-sm group hover:border-primary/20 transition-all">
               <div className="flex items-center justify-between mb-2">
                  <span className="text-[9px] font-black text-foreground/40 uppercase tracking-widest">{stat.label}</span>
                  {stat.isEncrypted && <Lock className="size-3 text-primary/40" />}
               </div>
                <div className={cn(
                  "text-xl font-black tabular-nums tracking-tighter transition-all duration-700", 
                  stat.color,
                  blurred && "blur-md opacity-20"
                )}>
                   {blurred ? "$XX,XXX" : stat.value}
                </div>
             </div>
        ))}
      </div>

      <div className="bg-card/10 border border-border/20 rounded-[32px] p-8 backdrop-blur-sm group hover:border-border/30 transition-all">
        {/* Header & Tabs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-3">
               <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                  <Activity className="size-5" />
               </div>
               <div>
                  <h3 className="text-white text-xs font-black tracking-widest uppercase">PORTFOLIO_PERFORMANCE</h3>
                  <p className="text-[9px] text-foreground/30 font-bold uppercase tracking-widest mt-0.5">Time_Series // {userAddress.slice(0, 6)}...{userAddress.slice(-4)}</p>
               </div>
            </div>

            <div className="flex items-center gap-1 p-1 bg-white/5 rounded-xl border border-white/10 w-fit">
               {RANGES.map((r) => (
                  <button
                    key={r}
                    onClick={() => setTimeRange(r)}
                    className={cn(
                        "px-3 py-1.5 text-[10px] font-black tracking-widest uppercase rounded-lg transition-all",
                        timeRange === r
                            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                            : "text-foreground/40 hover:text-foreground hover:bg-white/5"
                    )}
                  >
                    {r}
                  </button>
               ))}
            </div>
        </div>

        {/* Chart */}
        <div className={cn("h-[350px] w-full relative transition-all duration-1000", blurred && "blur-xl opacity-20 scale-[0.98]")}>
            {blurred && (
               <div className="absolute inset-0 z-20 flex items-center justify-center">
                  <div className="bg-black/60 border border-white/10 px-6 py-3 rounded-2xl flex items-center gap-3 shadow-2xl backdrop-blur-md">
                     <Lock className="size-4 text-primary animate-pulse" />
                     <span className="text-[10px] font-black tracking-[0.2em] text-white uppercase">Data_Shielded // Sign_to_Reveal</span>
                  </div>
               </div>
            )}
            <ResponsiveContainer width="100%" height="100%">
               <LineChart data={data}>
                  <defs>
                     <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={lineColor} stopOpacity={0.2}/>
                        <stop offset="95%" stopColor={lineColor} stopOpacity={0}/>
                     </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                  <XAxis dataKey="timestamp" hide />
                  <YAxis hide domain={['auto', 'auto']} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#000', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '11px', fontFamily: 'monospace' }}
                    itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                    labelStyle={{ display: 'none' }}
                    formatter={(v: number) => [`$${v.toLocaleString()}`, 'NAV']}
                  />
                  <Line
                    type="monotone"
                    dataKey="nav"
                    stroke={lineColor}
                    strokeWidth={3}
                    dot={false}
                    activeDot={{ r: 4, fill: lineColor, stroke: '#000', strokeWidth: 2 }}
                    animationDuration={2000}
                  />
               </LineChart>
            </ResponsiveContainer>
        </div>

        {/* Note */}
        <div className="mt-8 flex items-center justify-between border-t border-border/10 pt-6">
            <div className="flex items-center gap-2 text-[9px] font-black tracking-widest text-primary/50 uppercase">
                <Shield className="size-3" />
                ENCRYPTED_DATA // DECRYPTED_FOR_DISPLAY
            </div>
            <div className="flex gap-2">
               <button className="text-[9px] font-black tracking-widest text-foreground/20 hover:text-foreground uppercase py-2 px-4 border border-border/10 rounded-xl transition-all"> EXPORT_CSV </button>
               <button className="text-[9px] font-black tracking-widest text-foreground/20 hover:text-foreground uppercase py-2 px-4 border border-border/10 rounded-xl transition-all"> VIEW_DETAILS </button>
            </div>
        </div>
      </div>
    </div>
  )
}

function Activity(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
    )
}
