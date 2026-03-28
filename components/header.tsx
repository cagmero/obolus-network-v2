"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { useAccount } from "wagmi"
import { SidebarDrawer } from "./sidebar-drawer"
import { cn } from "@/lib/utils"
import { ConnectWalletButton } from "@/components/wallet/connect-wallet-button"

const NAV = [
  { href: "/vaults", label: "Vaults" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/markets", label: "Markets" },
  { href: "/privacy", label: "Privacy" },
  { href: "/transactions", label: "Transactions" },
  { href: "/faucet", label: "FAUCET", isSpecial: true },
]

/**
 * Inner header content that uses wagmi hooks.
 * Only rendered after mount to avoid WagmiProviderNotFoundError.
 */
function HeaderContent({ pathname }: { pathname: string }) {
  const [open, setOpen] = useState(false)
  
  return (
    <>
      {/* Left: menu icon + logo */}
      <div className="flex items-center gap-2">
        <SidebarDrawer open={open} onOpenChange={setOpen} />
        <Link href="/" className="flex items-center gap-2">
          <Image 
            src="/logo.png" 
            alt="Obolus Logo" 
            width={100} 
            height={32} 
            className="h-8 w-auto object-contain" 
            priority
          />
        </Link>
      </div>

      {/* Center: nav, centered horizontally */}
      <nav className="hidden sm:flex items-center justify-center gap-2">
        {NAV.map((n) => (
          <Link
            key={n.href}
            href={n.href}
            className={cn(
              "rounded-xl px-3 py-1 text-sm transition-colors font-bold",
              pathname === n.href
                ? "bg-primary text-primary-foreground"
                : (n as any).isSpecial 
                  ? "text-amber-500 hover:bg-amber-500/10 border border-amber-500/20"
                  : "text-foreground/80 hover:text-foreground hover:bg-primary/15",
            )}
          >
            {n.label}
          </Link>
        ))}
      </nav>

      {/* Right: wallet actions */}
      <div className="flex items-center justify-end gap-3 min-w-[140px]">
        <ConnectWalletButton />
      </div>
    </>
  )
}

export function AppHeader() {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <header className="sticky top-0 z-40 w-full pt-3 pb-2 ">
      <div
        className="grid grid-cols-[auto_1fr_auto] items-center rounded-none sm:rounded-2xl bg-primary/10 border-x-0 sm:border-x border-y border-primary/20 backdrop-blur-xl px-4 py-3 min-h-[60px] relative z-50"
        role="navigation"
        aria-label="Main"
      >
        {mounted ? (
          <HeaderContent pathname={pathname} />
        ) : (
          <div className="flex items-center gap-2">
             {/* Static shell while hydration finishes */}
             <div className="w-8 h-8 rounded-lg bg-white/5 animate-pulse" />
             <div className="w-24 h-6 bg-white/5 rounded animate-pulse" />
          </div>
        )}
      </div>
    </header>
  )
}
