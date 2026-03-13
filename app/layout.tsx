import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { AppHeader } from "@/components/header"
import { AppFooter } from "@/components/footer"
import { Providers } from "@/components/providers"
import { Suspense } from "react"
import Head from "next/head"

export const metadata: Metadata = {
  title: "Obolus Protocol - Decentralized BNPL",
  description: "Buy now, pay later with cryptocurrency. Secure EVM-based DeFi lending platform with real-world credit limits.",
  keywords: "crypto paylater, buy now pay later crypto, obolus protocol, avalanche defi, cryptocurrency lending, decentralized finance, ccip",
  authors: [{ name: "Obolus Team" }],
  creator: "Obolus",
  publisher: "Obolus",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://obolus.center",
    title: "Obolus - Revolutionary Crypto PayLater Platform",
    description: "Experience the future of crypto payments with Obolus. Instant BNPL solutions on Avalanche.",
    siteName: "Obolus",
  },
  twitter: {
    card: "summary_large_image",
    title: "Obolus - Crypto PayLater Revolution",
    description: "Buy now, pay later with cryptocurrency.",
  },
  alternates: {
    canonical: "https://obolus.network",
  },
  category: "Finance",
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
}

export const dynamic = 'force-dynamic'


export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body className={`font-mono ${GeistSans.variable} ${GeistMono.variable} antialiased min-h-dvh bg-background`}>
        <Suspense fallback={<div>Loading...</div>}>
          <Providers>
            <div className="mx-auto w-full flex flex-col min-h-screen px-4 md:px-8 lg:px-12">
              <AppHeader />
              <main className="pb-24 flex-grow">{children}</main>
              <AppFooter />
            </div>
          </Providers>
        </Suspense>
        <Analytics />
      </body>
    </html>
  )
}


