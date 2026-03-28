"use client"

import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Button } from "@/components/ui/button"
import { AlertTriangle, ShieldCheck } from "lucide-react"
import { cn } from "@/lib/utils"

export function ConnectWalletButton({ className }: { className?: string }) {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        mounted,
      }) => {
        const ready = mounted
        const connected = ready && account && chain

        return (
          <div
            className={className}
            {...(!ready && {
              'aria-hidden': true,
              'className': cn(className, 'opacity-0 pointer-events-none user-select-none'),
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <Button
                    onClick={openConnectModal}
                    className="bg-primary hover:bg-primary/90 text-black rounded-xl font-mono font-black relative z-50 px-6 py-2 h-10 min-w-[140px] uppercase tracking-widest text-[10px]"
                  >
                    CONNECT_WALLET
                  </Button>
                )
              }

              if (chain.unsupported) {
                return (
                  <Button
                    onClick={openChainModal}
                    variant="destructive"
                    className="rounded-xl font-mono font-black relative z-50 px-4 py-2 h-10 flex items-center gap-2 uppercase tracking-widest text-[9px] animate-pulse"
                  >
                    <AlertTriangle className="size-4" />
                    WRONG_NETWORK // SWITCH_TO_BSC
                  </Button>
                )
              }

              return (
                <div className="flex gap-3">
                  <Button
                    onClick={openChainModal}
                    variant="secondary"
                    className="hidden sm:flex items-center gap-2 rounded-xl border border-white/5 bg-white/5 text-[9px] font-black py-2 h-10 uppercase tracking-widest"
                  >
                    <div className="size-2 rounded-full bg-primary animate-pulse" />
                    {chain.name?.replace(" ", "_").toUpperCase()}
                  </Button>

                  <Button
                    onClick={openAccountModal}
                    className="bg-primary/5 hover:bg-primary/10 text-primary border border-primary/20 rounded-xl font-mono font-black text-[10px] py-2 h-10 px-4 uppercase tracking-widest flex items-center gap-2"
                  >
                    <ShieldCheck className="size-3" />
                    {account.displayName}
                  </Button>
                </div>
              )
            })()}
          </div>
        )
      }}
    </ConnectButton.Custom>
  )
}
