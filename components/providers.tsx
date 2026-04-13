"use client"

import { PrivyProvider } from '@privy-io/react-auth'
import { WagmiProvider } from '@privy-io/wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, useEffect, type ReactNode } from 'react'
import { ThemeProvider } from './theme-provider'
import { config } from '@/lib/wagmi'
import { Toaster } from "@/components/ui/sonner"

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <PrivyProvider
      appId="cmnxrfag1001j0dl2xynzgd6n"
      config={{
        appearance: {
          theme: 'dark',
          accentColor: '#9fd843',
          showWalletLoginFirst: true,
        },
        loginMethods: ['email', 'wallet', 'google', 'twitter', 'apple', 'discord'],
        solanaClusters: [
          {
            name: 'devnet',
            rpcUrl: 'https://api.devnet.solana.com',
          },
        ],
      }}
    >
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
            {children}
            <Toaster position="top-right" richColors closeButton />
          </ThemeProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </PrivyProvider>
  )
}
