"use client"

import { usePrivy, useWallets } from '@privy-io/react-auth'
import { Button } from "@/components/ui/button"
import { AlertTriangle, ShieldCheck, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"

export function ConnectWalletButton({ className }: { className?: string }) {
  const { login, logout, authenticated, user, ready } = usePrivy()
  const { wallets } = useWallets()

  // Get the most relevant address (EVM or Solana)
  const wallet = wallets[0]
  const address = wallet?.address || user?.wallet?.address
  const displayName = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "USER"

  if (!ready) {
    return (
      <div className={cn(className, 'opacity-0 pointer-events-none')}>
        <Button disabled className="h-10 min-w-[140px]">LOADING...</Button>
      </div>
    )
  }

  if (!authenticated) {
    return (
      <Button
        onClick={login}
        className={cn(
          "bg-primary hover:bg-primary/90 text-black rounded-xl font-mono font-black relative z-50 px-6 py-2 h-10 min-w-[140px] uppercase tracking-widest text-[10px]",
          className
        )}
      >
        CONNECT_WALLET
      </Button>
    )
  }

  return (
    <div className={cn("flex gap-3", className)}>
      <Button
        variant="secondary"
        className="hidden sm:flex items-center gap-2 rounded-xl border border-white/5 bg-white/5 text-[9px] font-black py-2 h-10 uppercase tracking-widest"
      >
        <div className="size-2 rounded-full bg-primary animate-pulse" />
        {wallet?.chainType?.toUpperCase() || "CONNECTED"}
      </Button>

      <Button
        onClick={() => logout()}
        className="bg-primary/5 hover:bg-primary/10 text-primary border border-primary/20 rounded-xl font-mono font-black text-[10px] py-2 h-10 px-4 uppercase tracking-widest flex items-center gap-2 group"
      >
        <ShieldCheck className="size-3 group-hover:hidden" />
        <LogOut className="size-3 hidden group-hover:block" />
        {displayName}
      </Button>
    </div>
  )
}
