"use client"

import React from 'react'
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts'
import { usePriceHistory } from '@/hooks/useMarketData'

export default function Sparkline({ symbol }: { symbol: string }) {
  const { data, isLoading } = usePriceHistory(symbol, '1W') // 7 days trend

  if (isLoading || !data || data.length < 2) {
    return <div className="w-20 h-8 bg-white/5 animate-pulse rounded" />
  }

  const isUp = data[data.length - 1].price >= data[0].price
  const strokeColor = isUp ? '#22c55e' : '#ef4444'

  return (
    <div className="w-20 h-8">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <YAxis hide domain={['auto', 'auto']} />
          <Line
            type="monotone"
            dataKey="price"
            stroke={strokeColor}
            strokeWidth={1.5}
            dot={false}
            animationDuration={1000}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
