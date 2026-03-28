"use client"

import '@rainbow-me/rainbowkit/styles.css'
import {
  getDefaultConfig,
  RainbowKitProvider,
  darkTheme,
} from '@rainbow-me/rainbowkit'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, type ReactNode } from 'react'
import { WagmiProvider } from 'wagmi'
import { bsc, bscTestnet } from 'wagmi/chains'
import { ThemeProvider } from './theme-provider'

const config = getDefaultConfig({
  appName: 'Obolus Network',
  projectId: '1745eedb32cb0f103490b50b14761c85',
  chains: [bsc, bscTestnet],
  ssr: true, // If your dApp uses server side rendering (SSR)
})

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider 
          theme={darkTheme({
            accentColor: '#9fd843',
            accentColorForeground: 'black',
            borderRadius: 'large',
            fontStack: 'system',
            overlayBlur: 'small',
          })}
        >
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
            {children}
          </ThemeProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
