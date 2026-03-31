"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Search, ArrowUpDown, ChevronDown, Activity, TrendingUp, BarChart3, Search as SearchIcon, Globe, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { VAULTS, Vault } from "@/lib/vaults"
import { cn } from "@/lib/utils"
import { useAccount, useReadContract, useChainId } from "wagmi"
import { formatUnits } from "viem"
import { useAllPrices } from "@/hooks/useMarketData"
import { usePlatformTVL, useVaultPositions } from "@/hooks/useVaults"
import Sparkline from "@/components/Sparkline"

const ERC20_ABI = [
  {
    "inputs": [{ "name": "account", "type": "address" }],
    "name": "balanceOf",
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  }
] as const

export default function VaultsPage() {
  const [filter, setFilter] = useState<'ALL' | 'MY_POSITIONS' | 'BLUE_CHIPS' | 'TECH' | 'ETF'>('ALL')
  const [search, setSearch] = useState('')
  const chainId = useChainId()
  const { data: prices } = useAllPrices()
  const { data: platformTvl } = usePlatformTVL()
  const { data: positionsData } = useVaultPositions()

  const positions = positionsData?.positions || []

  const filteredVaults = VAULTS.filter(vault => {
    const matchesSearch = vault.name.toLowerCase().includes(search.toLowerCase()) || 
                          vault.symbol.toLowerCase().includes(search.toLowerCase())
    
    if (filter === 'ALL') return matchesSearch
    if (filter === 'MY_POSITIONS') return matchesSearch && positions.some((p: any) => p.vaultId.toLowerCase() === vault.symbol.toLowerCase())
    return matchesSearch && vault.category === filter
  })

  return (
    <div className="flex flex-col gap-8 font-mono pb-20 w-full px-6 lg:px-12">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/20 pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tighter text-foreground uppercase">VAULTS // TOKENIZED_EQUITY</h1>
          <p className="text-[10px] text-foreground/40 uppercase tracking-[0.2em] mt-1">
             Obolus_Dynamic_Position_Management // Active_Market_Feed
          </p>
        </div>
        
        {/* Stats bar */}
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <span className="text-[9px] text-foreground/40 font-black uppercase tracking-widest">Active_Vaults</span>
            <span className="text-xl font-bold text-primary">{VAULTS.length}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] text-foreground/40 font-black uppercase tracking-widest">Total_Users</span>
            <span className="text-xl font-bold text-foreground font-black tabular-nums tracking-tighter">{platformTvl?.totalPositions || 0}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] text-foreground/40 font-black uppercase tracking-widest">Avg_APY</span>
            <span className="text-xl font-bold text-green-500">11.1%</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        <div className="lg:col-span-8 flex flex-wrap items-center gap-2">
          {['ALL', 'MY_POSITIONS', 'BLUE_CHIPS', 'TECH', 'ETF'].map((f) => (
            <Button
              key={f}
              variant="outline"
              onClick={() => setFilter(f as any)}
              className={cn(
                "h-8 text-[9px] font-black tracking-widest uppercase px-4 border overflow-hidden relative",
                filter === f 
                  ? "bg-primary text-primary-foreground border-primary" 
                  : "bg-white/5 border-border/40 text-foreground/60 hover:border-primary/40"
              )}
            >
              {f}
              {filter === f && <div className="absolute top-0 right-0 w-1.5 h-1.5 bg-white/20 -mr-1 -mt-1 rotate-45" />}
            </Button>
          ))}
        </div>

        <div className="lg:col-span-4 relative group">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40 group-focus-within:text-primary transition-colors">
            <SearchIcon className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="SEARCH_BY_ASSET_NAME"
            className="w-full h-10 bg-white/5 border border-border/40 rounded-xl pl-10 pr-4 text-[11px] font-bold text-foreground placeholder:text-foreground/20 focus:outline-none focus:border-primary/40 focus:bg-white/10 transition-all uppercase tracking-widest"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table Header / Sort Controls */}
      <div className="bg-white/5 border border-border/20 rounded-2xl overflow-hidden backdrop-blur-sm shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border/10 bg-black/20">
                <th className="px-6 py-5">
                  <span className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">Asset</span>
                </th>
                <th className="px-6 py-5">
                   <div className="flex items-center gap-1.5 cursor-pointer hover:text-primary transition-colors">
                    <span className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">Live Price</span>
                    <ArrowUpDown className="w-3 h-3 text-foreground/20" />
                  </div>
                </th>
                <th className="px-6 py-5">
                   <div className="flex items-center gap-1.5 cursor-pointer hover:text-primary transition-colors">
                    <span className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">APY</span>
                    <ArrowUpDown className="w-3 h-3 text-foreground/20" />
                  </div>
                </th>
                <th className="px-6 py-5">
                  <span className="text-[10px] font-black text-foreground/40 uppercase tracking-widest text-right">7D_TREND</span>
                </th>
                <th className="px-6 py-5 text-right">
                   <span className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">Action</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredVaults.length > 0 ? (
                filteredVaults.map((vault) => (
                  <VaultRow key={vault.id} vault={vault} isLocalhost={chainId === 1337} prices={prices} />
                ))
              ) : (
                <tr>
                   <td colSpan={6} className="px-6 py-20 text-center opacity-30 text-[10px] uppercase font-black tracking-widest">
                     No_vaults_found_matching_search_parameters
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function VaultRow({ vault, isLocalhost, prices }: { vault: Vault, isLocalhost: boolean, prices: any }) {
  const { address } = useAccount()
  const { data: balanceValue } = useReadContract({
    address: vault.tokenAddress as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  })

  const formattedBalance = balanceValue ? formatUnits(balanceValue, 18) : "0.00"
  const data = prices?.[vault.symbol]
  const currentPrice = data?.price

  // Strip suffixes (x, on, X, on) to match files in /public/stocks/
  const cleanSymbol = vault.symbol.replace(/x$|on$|X$/i, '')
  const logoUrl = `/stocks/${cleanSymbol}.png`

  return (
    <tr key={vault.id} className="group hover:bg-white/5 transition-colors border-b border-border/5 last:border-0 relative">
      <td className="px-6 py-6">
         <div className="flex items-center gap-4">
            <div className="relative">
              <div 
                className="w-12 h-12 rounded-2xl flex items-center justify-center font-black relative z-10 overflow-hidden border border-white/5 bg-white/5 shadow-inner"
              >
                <img 
                  src={logoUrl} 
                  alt={vault.symbol} 
                  className="w-full h-full object-cover" 
                  onError={(e) => (e.currentTarget.style.display = 'none')} 
                />
                <span className="absolute inset-0 flex items-center justify-center text-lg opacity-20">{vault.symbol[0]}</span>
              </div>
              <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-6 rounded-full" style={{ backgroundColor: vault.color }} />
            </div>
            <div className="flex flex-col">
               <div className="flex items-center gap-2">
                 <span className="text-base font-black text-foreground uppercase tracking-tight">{vault.symbol}</span>
                 {isLocalhost && (
                    <span className="text-[8px] bg-amber-500/10 text-amber-500 border border-amber-500/20 px-1 py-0.5 rounded font-black tracking-tighter">LOCAL_TESTNET</span>
                 )}
               </div>
               <span className="text-[10px] text-foreground/40 font-bold uppercase tracking-tight">{vault.name}</span>
            </div>
         </div>
      </td>
       <td className="px-6 py-5">
         <div className="flex flex-col gap-1">
            <div className="text-base font-black text-foreground tabular-nums tracking-tighter">
               ${currentPrice ? currentPrice.toFixed(2) : "---"}
            </div>
            <div className={cn(
              "inline-flex self-start px-1 py-0.5 rounded text-[7px] font-black tracking-widest uppercase border leading-none",
              data?.source === 'ondo+twelve_data'
                ? "bg-green-500/10 text-green-500 border-green-500/20" 
                : data?.source === 'twelve_data_only'
                  ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
                  : "bg-amber-500/10 text-amber-500 border-amber-500/20"
            )}>
              {data?.source === 'ondo+twelve_data' ? "ONDO+LIVE" : data?.source === 'twelve_data_only' ? "LIVE" : "COINGECKO"}
            </div>
            {data?.paused && (
              <div className="text-[7px] bg-amber-500/10 text-amber-500 border border-amber-500/20 px-1 py-0.5 rounded-sm font-black tracking-tighter">⚠ PAUSED</div>
            )}
         </div>
      </td>
      <td className="px-6 py-5">
         <div className="flex flex-col">
            <span className="text-sm font-black text-green-500">{vault.baseApy}%</span>
            <span className="text-[9px] text-foreground/20 uppercase font-black">Perf_Fee: 0%</span>
         </div>
      </td>
      <td className="px-6 py-5 whitespace-nowrap">
         <Sparkline symbol={vault.symbol} />
      </td>
      <td className="px-6 py-5 text-right flex items-center justify-end gap-2">
         <Link href={`/assets/${vault.symbol.toLowerCase()}`}>
          <Button className="h-7 bg-white/5 hover:bg-white/10 text-foreground/60 hover:text-foreground border border-border/20 text-[8px] font-black uppercase tracking-widest px-3 rounded-lg transition-all">
            VIEW
          </Button>
         </Link>
         <Link href={`/vault/${vault.id}`}>
          <Button className="h-7 bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground border border-primary/20 text-[8px] font-black uppercase tracking-widest px-3 rounded-lg transition-all">
            DEPOSIT
          </Button>
         </Link>
      </td>
    </tr>
  )
}
