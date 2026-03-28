"use client"

import React, { useMemo } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface PriceChartProps {
  data: { timestamp: string; price: number }[]
  symbol: string
  color?: string
  timeRange: string
  onTimeRangeChange: (range: string) => void
  isLoading?: boolean
}

const RANGES = ['1D', '1W', '1M', '3M', '1Y', 'ALL']

export default function PriceChart({
  data,
  symbol,
  color = '#76B900', // NVDA green as default
  timeRange,
  onTimeRangeChange,
  isLoading = false,
}: PriceChartProps) {
  const isUp = useMemo(() => {
    if (!data || data.length < 2) return true
    return data[data.length - 1].price >= data[0].price
  }, [data])

  const chartColor = isUp ? '#22c55e' : '#ef4444'

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex gap-2">
          {RANGES.map((r) => (
            <Skeleton key={r} className="h-8 w-12 bg-white/5" />
          ))}
        </div>
        <Skeleton className="h-[350px] w-full bg-white/5 rounded-3xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6 font-mono">
      {/* Time Range Tabs */}
      <div className="flex items-center gap-1 p-1 bg-white/5 rounded-xl border border-white/10 w-fit">
        {RANGES.map((r) => (
          <button
            key={r}
            onClick={() => onTimeRangeChange(r)}
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

      {/* Chart */}
      <div className="h-[350px] w-full bg-black/20 border border-white/5 rounded-3xl p-6 relative group overflow-hidden">
        <div className="absolute top-4 right-6 flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-foreground/40">
           <div className={cn("size-2 rounded-full", isUp ? "bg-green-500" : "bg-red-500")} />
           LIVE_ORACLE_FEED // {symbol}
        </div>

        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={chartColor} stopOpacity={0.2} />
                <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
            <XAxis
              dataKey="timestamp"
              hide
            />
            <YAxis
              hide
              domain={['auto', 'auto']}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0a0a0a',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                fontSize: '11px',
                fontFamily: 'monospace',
                boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
              }}
              itemStyle={{ color: '#fff', fontWeight: 'bold' }}
              labelStyle={{ display: 'none' }}
              formatter={(v: number) => [`$${v.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, 'PRICE']}
            />
            <Area
              type="monotone"
              dataKey="price"
              stroke={chartColor}
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorPrice)"
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
