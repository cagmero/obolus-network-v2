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
  title: "Obolus — Private Equity Vault on BNB Chain",
  description: "Deposit tokenized US stocks on BNB Chain with encrypted positions via Zama fhEVM. Nobody sees what you hold.",
  keywords: "Ondo, Zama, fhEVM, BNB Chain, RWA, Equity, Vault, Privacy",
  authors: [{ name: "Obolus Team" }],
  creator: "Obolus",
  publisher: "Obolus",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://obolus.network",
    title: "Obolus — Your Portfolio. Invisible.",
    description: "Experience the first privacy-preserving RWA vault on BNB Chain. Secure and confidential US equity exposure.",
    siteName: "Obolus",
    images: ["/og-image.png"]
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


