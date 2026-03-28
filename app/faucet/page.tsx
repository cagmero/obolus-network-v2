"use client"

import { useState, useEffect } from "react"
import { useAccount, useWriteContract, useBalance, usePublicClient } from "wagmi"
import { parseUnits } from "viem"
import { Button } from "@/components/ui/button"
import { TOKEN_ADDRESSES } from "@/lib/tokenAddresses"
import { VAULTS } from "@/lib/vaults"
import { Wallet, Coins, Terminal, CheckCircle2, AlertCircle, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

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

export default function FaucetPage() {
  const { isConnected, address } = useAccount()
  const { writeContractAsync } = useWriteContract()
  const [logs, setLogs] = useState<string[]>([])
  const [isMintingAll, setIsMintingAll] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const addLog = (message: string) => {
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${message}`, ...prev].slice(0, 10))
  }

  const claimToken = async (symbol: string, address_?: string) => {
    if (!address || !address_) return

    try {
      addLog(`MINTING_${symbol}...`)
      const tx = await writeContractAsync({
        address: address_ as `0x${string}`,
        abi: MOCK_ERC20_ABI,
        functionName: 'mint',
        args: [address, parseUnits('1000', 18)],
      })
      addLog(`TX_CONFIRMED // +1000 ${symbol} // ADDED_TO_WALLET`)
      setRefreshTrigger(prev => prev + 1)
    } catch (error) {
      addLog(`ERROR_MINTING_${symbol}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const claimAll = async () => {
    setIsMintingAll(true)
    addLog("INITIATING_BULK_MINT...")
    
    for (const [symbol, addr] of Object.entries(TOKEN_ADDRESSES)) {
      await claimToken(symbol, addr)
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
                onClaim={() => claimToken(vault.symbol, vault.tokenAddress)}
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
    </div>
  )
}

import { useReadContract } from "wagmi"
import { formatUnits } from "viem"

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
