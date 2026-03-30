"use client"

import { useState, useEffect } from "react"
import { useAccount, useWriteContract, useBalance, usePublicClient } from "wagmi"
import { parseUnits } from "viem"
import { Button } from "@/components/ui/button"
import { TOKEN_ADDRESSES } from "@/lib/tokenAddresses"
import { VAULTS } from "@/lib/vaults"
import { Wallet, Coins, Terminal, CheckCircle2, AlertCircle, Loader2, Globe } from "lucide-react"
import { cn } from "@/lib/utils"
import { getKeyUsageStats, getTotalCallsRemaining } from "@/lib/twelvedata"
import { useReadContract } from "wagmi"
import { formatUnits } from "viem"

const MOCK_ERC20_ABI = [
  {
    "inputs": [
      { "name": "to", "type": "address" },
      { "name": "amount", "type": "uint256" }
    ],
    "name": "mint",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const

import { useObolusAuth } from "@/hooks/useVaults"
import { api } from "@/lib/api"

import { toast } from "react-toastify"

export default function FaucetPage() {
  const { isConnected, address } = useAccount()
  const { writeContractAsync } = useWriteContract()
  const { getSignature } = useObolusAuth()
  const [logs, setLogs] = useState<string[]>([])
  const [isMintingAll, setIsMintingAll] = useState(false)
  const [minting, setMinting] = useState<string | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const chainId = 1337

  const addLog = (message: string) => {
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${message}`, ...prev].slice(0, 10))
  }

  const handleMint = async (tokenAddress: string, symbol: string) => {
    if (!address) return
    
    console.log('[OBOLUS:FAUCET] Minting tokens', { tokenAddress, symbol, to: address })

    try {
      setMinting(symbol)
      addLog(`Requesting ${symbol} from faucet...`)

      // 1. Mint on-chain
      const txHash = await writeContractAsync({
        address: tokenAddress as `0x${string}`,
        abi: MOCK_ERC20_ABI,
        functionName: 'mint',
        args: [address, parseUnits('1000', 18)],
      })

      console.log('[OBOLUS:FAUCET] Mint confirmed', { txHash, symbol, amount: '1000' })
      addLog(`Transaction submitted: ${txHash.slice(0, 10)}...`)
      
      // 2. Record in DB
      const { signature, nonce } = await getSignature()
      await api.post('/api/v1/transactions/record', {
        userAddress: address,
        type: 'faucet',
        vaultId: 'FAUCET',
        tokenAddress,
        encryptedAmount: "1000",
        txHash,
        chainId,
        status: 'executed'
      }, { walletAddress: address, signature, nonce })

      addLog(`Successfully minted 1,000 ${symbol}!`)
      toast.success(`Successfully minted 1,000 ${symbol}!`)
      setRefreshTrigger(prev => prev + 1)
    } catch (e: any) {
      console.error('[OBOLUS:FAUCET:ERROR] Mint failed', { symbol, error: e.message })
      addLog(`Error minting ${symbol}: ${e.message}`)
      toast.error(`Error minting ${symbol}: ${e.message}`)
    } finally {
      setMinting(null)
    }
  }

  const claimAll = async () => {
    setIsMintingAll(true)
    addLog("INITIATING_BULK_MINT...")
    
    for (const vault of VAULTS) {
      await handleMint(vault.tokenAddress, vault.symbol)
    }
    
    addLog("BULK_MINT_COMPLETE")
    setIsMintingAll(false)
  }

  return (
    <div className="flex flex-col gap-8 font-mono pb-20">
      {/* Header Info */}
      <div className="flex items-center justify-between border-b border-border/20 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tighter text-foreground">FAUCET // TESTNET_TOKENS</h1>
          <p className="text-[10px] text-amber-500 font-bold uppercase tracking-[0.2em] mt-1">
            NETWORK: LOCAL_GANACHE // CHAIN_ID: 1337
          </p>
        </div>
        <div className="flex items-center gap-4">
           <Button 
            onClick={claimAll} 
            disabled={!isConnected || isMintingAll}
            className="bg-amber-500 hover:bg-amber-600 text-black font-black text-[10px] px-6 rounded-xl h-9"
          >
            {isMintingAll ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : null}
            CLAIM_ALL_TOKENS
          </Button>
        </div>
      </div>

      {/* Explanation Box */}
      <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-6 backdrop-blur-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Terminal className="w-20 h-20" />
        </div>
        <div className="relative z-10 space-y-2">
          <h2 className="text-[10px] font-black tracking-widest text-amber-500 uppercase">SYSTEM_NOTICE // FAUCET_PROTOCOL</h2>
          <p className="text-xs text-foreground/80 leading-relaxed max-w-2xl">
            GET FREE TESTNET TOKENS TO TRY THE OBOLUS VAULT. 
            EACH REQUEST DISPENSES 1,000 UNITS OF EACH TOKEN. 
            FOR DEMO PURPOSES ONLY.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Token Grid */}
        <div className="lg:col-span-8">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {VAULTS.map((vault) => (
              <TokenCard 
                key={vault.id} 
                vault={vault} 
                onClaim={() => handleMint(vault.tokenAddress, vault.symbol)}
                refreshTrigger={refreshTrigger}
              />
            ))}
          </div>
        </div>

        {/* Terminal Logs */}
        <div className="lg:col-span-4 space-y-6">
          <h2 className="text-xs font-bold tracking-widest text-foreground/60 uppercase">
            TERMINAL_FEEDBACK // STREAMS
          </h2>
          <div className="bg-black/40 border border-border/40 rounded-3xl p-6 backdrop-blur-sm min-h-[400px] flex flex-col">
            <div className="flex-grow space-y-3 overflow-y-auto pr-2 custom-scrollbar">
              {logs.length > 0 ? (
                logs.map((log, i) => (
                  <div key={i} className="text-[10px] text-foreground/70 leading-relaxed break-all font-mono animate-in fade-in slide-in-from-left-2 duration-300">
                    <span className="text-primary/60 font-bold mr-2">{">"}</span>
                    {log}
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-3 py-10 opacity-20 italic">
                   <p className="text-[10px] uppercase">Waiting for input...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* API Status Section */}
      <div className="mt-8 space-y-4">
        <h2 className="text-xs font-bold tracking-widest text-foreground/60 uppercase px-2">
          API_STATUS // TWELVE_DATA // KEY_ROTATION
        </h2>
        <div className="bg-white/5 border border-border/20 rounded-[32px] p-8 backdrop-blur-sm overflow-hidden relative group hover:border-primary/20 transition-all">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Globe className="w-24 h-24 text-primary" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {getKeyUsageStats().map((stat) => (
              <div key={stat.keyIndex} className="space-y-3 p-4 bg-black/20 rounded-2xl border border-border/10">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-primary/60 uppercase tracking-widest">KEY_{stat.keyIndex}</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                </div>
                <div className="text-xs font-mono font-bold text-foreground/80 truncate">{stat.keyPreview}</div>
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between text-[8px] font-black text-foreground/30 uppercase tracking-tighter">
                    <span>Usage</span>
                    <span>{stat.callsUsed}/800</span>
                  </div>
                  <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-1000" 
                      style={{ width: `${(stat.callsUsed / 800) * 100}%` }} 
                    />
                  </div>
                </div>
              </div>
            ))}

            <div className="space-y-3 p-4 bg-primary/5 rounded-2xl border border-primary/20 flex flex-col justify-center text-center">
              <span className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">TOTAL_REMAINING</span>
              <div className="text-2xl font-black text-primary tabular-nums tracking-tighter">
                {getTotalCallsRemaining()}<span className="text-xs text-primary/40 font-bold ml-1">/2400</span>
              </div>
              <p className="text-[8px] text-primary/40 font-bold uppercase tracking-widest mt-1">Daily Reset: 00:00 UTC</p>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-border/10 grid grid-cols-1 md:grid-cols-2 gap-4 text-[9px] font-black uppercase tracking-[0.2em] text-foreground/30">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3 h-3 text-green-500/50" />
              <span>KEYS_ROTATE_AUTOMATICALLY // LEAST_USED_SELECTED</span>
            </div>
            <div className="flex items-center gap-2">
               <div className="w-1 h-1 rounded-full bg-primary animate-pulse" />
               <span>LIVE_MARKET_DATA // SYNCED_BY_PRICE_ENGINE</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


// ... (inside TokenCard)
function TokenCard({ vault, onClaim, refreshTrigger }: { vault: any, onClaim: () => void, refreshTrigger: number }) {
  const { address } = useAccount()
  
  const { data: balance, refetch } = useReadContract({
    address: vault.tokenAddress as `0x${string}`,
    abi: [
      {
        "inputs": [{ "name": "account", "type": "address" }],
        "name": "balanceOf",
        "outputs": [{ "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
      }
    ] as const,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  })

  useEffect(() => {
    if (address) refetch()
  }, [refreshTrigger, refetch, address])

  const formattedBalance = balance !== undefined ? formatUnits(balance, 18) : "0.00"

  return (
    <div className="bg-card/20 border border-border/40 rounded-2xl p-5 backdrop-blur-sm group hover:border-primary/30 transition-all flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-black"
            style={{ backgroundColor: `${vault.color}10`, color: vault.color, border: `1px solid ${vault.color}30` }}
          >
            {vault.symbol[0]}
          </div>
          <div>
            <h3 className="text-xs font-bold text-foreground">{vault.symbol}</h3>
            <p className="text-[10px] text-foreground/40 uppercase tracking-tighter">{vault.name}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white/5 rounded-xl p-3 border border-border/10">
        <p className="text-[9px] text-foreground/40 uppercase font-black mb-1">Your Balance</p>
        <div className="flex items-baseline gap-1">
          <span className="text-lg font-mono font-bold text-foreground">
            {parseFloat(formattedBalance).toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </span>
          <span className="text-[10px] text-foreground/40 font-bold">{vault.symbol}</span>
        </div>
      </div>

      <Button 
        onClick={onClaim}
        variant="outline"
        className="w-full border-primary/20 hover:bg-primary/5 text-primary font-black text-[10px] rounded-xl h-10 uppercase"
      >
        CLAIM_1000_{vault.symbol}
      </Button>
    </div>
  )
}
