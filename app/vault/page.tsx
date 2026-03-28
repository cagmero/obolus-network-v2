"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { TerminalLoader } from "@/components/terminal-loader"

/**
 * Redirecting the legacy /vault path to the new /vaults list.
 */
export default function VaultRedirectPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/vaults')
  }, [router])

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] font-mono gap-4 opacity-40">
      <TerminalLoader />
      <span className="text-[10px] font-black uppercase tracking-[0.3em]">
        REDIRECTING_TO_VAULTS_LIST...
      </span>
    </div>
  )
}
