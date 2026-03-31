'use client'

import { useState, useEffect } from 'react'
import { Terminal, Globe, CheckCircle2, Copy, ExternalLink, RefreshCw, Smartphone, ShieldCheck, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAccount, useChainId, useSwitchChain } from 'wagmi'
import { useAllTokenBalances, useTokenBalance } from '@/hooks/useContracts'
import { useMintFaucet } from '@/hooks/useContractWrite'
import { CONTRACT_ADDRESSES } from '@/lib/wagmi'
import { cn } from '@/lib/utils'
import { Metadata } from 'next'

// Client-side only component to prevent hydration mismatch
export default function FaucetPage() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()
  const { balances, isLoading: isLoadingBalances, refetch } = useAllTokenBalances()
  const { mint, mintAll, mintingSymbol, lastTxHash, error: mintError } = useMintFaucet()
  const [logs, setLogs] = useState<string[]>([])
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    addLog('SYSTEM_BOOT // INITIALIZING_FAUCET_PROTOCOL')
  }, [])

  const addLog = (msg: string) => {
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 50))
  }

  const handleMint = async (symbol: string, tokenAddress: string) => {
    if (!address) return addLog('ERROR: WALLET_NOT_CONNECTED')
    try {
      addLog(`INITIATING_MINT // ${symbol} // ${tokenAddress}`)
      const tx = await mint(symbol, tokenAddress)
      addLog(`TX_SUBMITTED // HASH: ${tx}`)
      addLog(`MINT_COMPLETE // VIEW_ON_BSCSCAN: https://testnet.bscscan.com/tx/${tx}`)
    } catch (e: any) {
      addLog(`MINT_FAILED // ${e.message}`)
    }
  }

  const handleMintAll = async () => {
    addLog('INITIATING_BATCH_MINT // ALL_9_TOKENS')
    await mintAll()
    addLog('BATCH_MINT_SEQUENCE_COMPLETE')
    refetch()
  }

  if (!isMounted) return null

  const isBscTestnet = chainId === 97

  return (
    <div className="max-w-7xl mx-auto space-y-10 py-10 px-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Zap className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tighter text-foreground uppercase">
                FAUCET <span className="text-amber-500">//</span> BSC_TESTNET
              </h1>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/5 border border-border/20">
                  <div className={cn("w-1.5 h-1.5 rounded-full", isBscTestnet ? "bg-green-500" : "bg-red-500 animate-pulse")} />
                  <span className="text-[9px] font-black uppercase tracking-widest text-foreground/40 text-xs">
                    {isBscTestnet ? "NETWORK_SYNCED // 97" : "WRONG_NETWORK // EXPECTED: 97"}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <p className="text-xs text-foreground/60 font-medium max-w-xl leading-relaxed uppercase tracking-tight">
            Claim testnet assets to interact with the Obolus RWAVault. Each claim dispenses 1,000 mock units. 
            These tokens represent GM assets on the BSC Testnet deployment.
          </p>
        </div>

        {!isBscTestnet && (
          <Button 
            onClick={() => switchChain({ chainId: 97 })}
            className="bg-amber-500 hover:bg-amber-600 text-black font-black text-xs h-12 px-8 rounded-2xl uppercase tracking-widest"
          >
            Switch to BSC Testnet
          </Button>
        )}

        {isBscTestnet && (
           <Button 
            onClick={handleMintAll}
            disabled={!!mintingSymbol}
            className="bg-foreground hover:bg-foreground/90 text-background font-black text-xs h-12 px-8 rounded-2xl uppercase tracking-widest flex items-center gap-2"
          >
            {mintingSymbol ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
            {mintingSymbol ? `MINTING_${mintingSymbol}...` : 'Claim All Tokens'}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Token Grid */}
        <div className="lg:col-span-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {Object.entries(CONTRACT_ADDRESSES)
              .filter(([key]) => !['RWAVault', 'ObolusOracle', 'ObolusAMM'].includes(key))
              .map(([symbol, address]) => (
                <TokenCard 
                  key={symbol}
                  symbol={symbol}
                  address={address as string}
                  balance={balances?.[symbol]?.formatted || '0'}
                  onClaim={() => handleMint(symbol, address as string)}
                  isMinting={mintingSymbol === symbol}
                />
              ))}
          </div>
        </div>

        {/* Terminal Logs */}
        <div className="lg:col-span-4 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold tracking-widest text-foreground/60 uppercase">
              TERMINAL_FEEDBACK // STREAMS
            </h2>
            <div className="flex items-center gap-1.5">
              <span className="text-[8px] font-black text-amber-500/60 uppercase tracking-widest">LIVE_SYNC</span>
              <div className="w-1 h-1 rounded-full bg-amber-500 animate-pulse" />
            </div>
          </div>
          <div className="bg-black/40 border border-border/40 rounded-[32px] p-6 backdrop-blur-sm h-[600px] flex flex-col font-mono">
            <div className="flex-grow space-y-4 overflow-y-auto pr-2 custom-scrollbar">
              {logs.length > 0 ? (
                logs.map((log, i) => (
                  <div key={i} className="text-[10px] text-foreground/70 leading-relaxed break-all animate-in fade-in slide-in-from-left-2 duration-300">
                    <span className="text-amber-500/60 font-bold mr-2">{">"}</span>
                    {log}
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-3 opacity-20 italic">
                   <Terminal className="w-8 h-8 mb-2" />
                   <p className="text-[10px] uppercase tracking-widest">Awaiting execution...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Contract Registry Section */}
      <div className="bg-white/5 border border-border/20 rounded-[40px] p-10 backdrop-blur-sm relative overflow-hidden group hover:border-amber-500/20 transition-all">
        <div className="absolute top-0 right-0 p-10 opacity-5">
           <Globe className="w-40 h-40 text-amber-500" />
        </div>
        
        <div className="relative z-10 space-y-8">
           <div className="space-y-2">
              <h2 className="text-xs font-black text-amber-500 uppercase tracking-[0.3em]">CONTRACT_REGISTRY // BSC_TESTNET</h2>
              <p className="text-2xl font-black text-foreground tracking-tighter uppercase">Deployed Protocol infrastructure</p>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { name: 'RWAVault', address: CONTRACT_ADDRESSES.RWAVault },
                { name: 'ObolusOracle', address: CONTRACT_ADDRESSES.ObolusOracle },
                { name: 'ObolusAMM', address: CONTRACT_ADDRESSES.ObolusAMM },
                ...Object.entries(CONTRACT_ADDRESSES).filter(([k]) => !['RWAVault', 'ObolusOracle', 'ObolusAMM'].includes(k)).map(([k, v]) => ({ name: k, address: v }))
              ].map((contract) => (
                <div key={contract.name} className="p-4 bg-black/20 rounded-2xl border border-border/10 group/item hover:border-amber-500/30 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">{contract.name}</span>
                    <a href={`https://testnet.bscscan.com/address/${contract.address}`} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-3 h-3 text-amber-500/40 group-hover/item:text-amber-500 transition-colors" />
                    </a>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <code className="text-[10px] text-foreground/70 font-mono truncate">{contract.address}</code>
                    <button onClick={() => { navigator.clipboard.writeText(contract.address as string); }} className="p-1 hover:bg-white/5 rounded-md">
                      <Copy className="w-3 h-3 text-foreground/20 hover:text-foreground/60" />
                    </button>
                  </div>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  )
}

function TokenCard({ symbol, address, balance, onClaim, isMinting }: { 
  symbol: string, 
  address: string, 
  balance: string, 
  onClaim: () => void,
  isMinting: boolean 
}) {
  return (
    <div className="bg-white/5 border border-border/20 rounded-[32px] p-6 backdrop-blur-sm group hover:border-amber-500/30 transition-all flex flex-col gap-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-5 transition-opacity">
        <Zap className="w-16 h-16 text-amber-500" />
      </div>
      
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="w-14 h-14 rounded-2xl bg-foreground/5 border border-border/20 flex items-center justify-center text-lg font-black text-foreground relative z-10 overflow-hidden bg-white/5">
             <img 
              src={symbol === 'oUSD' ? '/logo-only.png' : `/stocks/${symbol.replace(/x$|on$|X$/i, '')}.png`} 
              alt={symbol} 
              className="w-full h-full object-cover"
              onError={(e) => (e.currentTarget.style.display = 'none')}
             />
          </div>
          <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-6 rounded-full bg-amber-500/40" />
        </div>
        <div>
          <h3 className="text-sm font-black text-foreground uppercase tracking-tight">{symbol}</h3>
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] text-foreground/40 font-mono truncate max-w-[80px]">{address}</span>
            <a href={`https://testnet.bscscan.com/address/${address}`} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-2.5 h-2.5 text-foreground/20 hover:text-amber-500 transition-colors" />
            </a>
          </div>
        </div>
      </div>
      
      <div className="bg-black/40 rounded-2xl p-5 border border-border/10">
        <div className="flex justify-between items-center mb-1">
          <span className="text-[9px] text-foreground/30 font-black uppercase tracking-widest">WALLETS_BALANCE</span>
          <div className="w-1 h-1 rounded-full bg-green-500/50" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-black text-foreground tabular-nums tracking-tighter">
            {parseFloat(balance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className="text-xs font-bold text-foreground/20 uppercase">{symbol}</span>
        </div>
      </div>

      <Button 
        onClick={onClaim}
        disabled={isMinting}
        className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-amber-500/20 text-black font-black text-xs h-12 rounded-2xl uppercase tracking-widest transition-all"
      >
        {isMinting ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : null}
        {isMinting ? 'MINTING_PROTOCOL...' : `Claim_1000_${symbol}`}
      </Button>
    </div>
  )
}
