"use client"

import type React from "react"
import { ConnectWalletButton } from "@/components/wallet/connect-wallet-button"
import { usePrivy } from "@privy-io/react-auth"

export function ConnectGate({ children }: { children: React.ReactNode }) {
  const { authenticated, ready } = usePrivy()

  if (ready && !authenticated) {
    return (
      <div className="min-h-[70dvh] flex flex-col items-center justify-center text-center">
        <div className="rounded-3xl bg-card/40 border border-border/40 backdrop-blur-xl p-6 w-full max-w-sm">
          <h1 className="text-xl font-semibold">Connect Wallet</h1>
          <p className="text-sm text-foreground/70 mt-2">
            Pay later with Obolus. Securely connect your wallet to view your limit and start checkout.
          </p>
          <div className="mt-4 w-full">
            <ConnectWalletButton />
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}


