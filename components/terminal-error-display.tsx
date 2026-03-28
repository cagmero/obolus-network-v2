"use client"

import { useAccount, useChainId, useSwitchChain } from "wagmi"
import { AlertCircle, RefreshCw, Unplug } from "lucide-react"
import { Button } from "./ui/button"

interface TerminalErrorDisplayProps {
  error?: Error | null
  isRPCError?: boolean
}

export function TerminalErrorDisplay({ error, isRPCError }: TerminalErrorDisplayProps) {
  const { isConnected } = useAccount()
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()

  const isWrongNetwork = isConnected && chainId !== 7202 && chainId !== 97 && chainId !== 56

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center p-12 min-h-[400px] border-2 border-dashed border-red-500/20 rounded-3xl bg-red-500/5 font-mono">
        <Unplug className="w-12 h-12 text-red-500 mb-6 group-hover:scale-110 transition-transform" />
        <h2 className="text-red-500 text-sm font-black tracking-[0.3em] uppercase mb-2">WALLET_NOT_CONNECTED</h2>
        <p className="text-red-500/60 text-[10px] font-bold uppercase tracking-widest mb-8 text-center px-4">
          CONNECT_TO_CONTINUE // AUTHORIZATION_REQUIRED
        </p>
        <div className="animate-pulse flex items-center gap-2 text-red-500 text-[10px] font-black uppercase">
          <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
          WAITING_FOR_INPUT
        </div>
      </div>
    )
  }

  if (isWrongNetwork) {
    return (
      <div className="flex flex-col items-center justify-center p-12 min-h-[400px] border-2 border-dashed border-red-500/20 rounded-3xl bg-red-500/5 font-mono">
        <AlertCircle className="w-12 h-12 text-red-500 mb-6" />
        <h2 className="text-red-500 text-sm font-black tracking-[0.3em] uppercase mb-2">WRONG_NETWORK</h2>
        <p className="text-red-500/60 text-[10px] font-bold uppercase tracking-widest mb-8 text-center px-4">
          SWITCH_TO_BSC_REQUIRED // INVALID_LEDGER_CONTEXT
        </p>
        <Button 
          onClick={() => switchChain({ chainId: 7202 })}
          className="bg-red-500 hover:bg-red-600 text-white font-black px-8 py-6 rounded-xl uppercase tracking-widest text-xs"
        >
          SWITCH_PROTOCOL
        </Button>
      </div>
    )
  }

  if (isRPCError || error) {
    return (
      <div className="flex flex-col items-center justify-center p-12 min-h-[400px] border-2 border-dashed border-red-500/20 rounded-3xl bg-red-500/5 font-mono text-center">
        <RefreshCw className="w-12 h-12 text-red-500 mb-6 animate-spin-slow" />
        <h2 className="text-red-500 text-sm font-black tracking-[0.3em] uppercase mb-2">RPC_ERROR</h2>
        <p className="text-red-500/60 text-[10px] font-bold uppercase tracking-widest mb-4">
          RETRYING... // NODE_CONNECTION_LOST
        </p>
        <div className="p-4 bg-black/40 border border-red-500/20 rounded-lg max-w-md mx-auto">
           <p className="text-[10px] text-red-500 font-mono break-all opacity-80 uppercase">
             {error?.message || "Internal_Provider_Failure"}
           </p>
        </div>
      </div>
    )
  }

  return null
}
