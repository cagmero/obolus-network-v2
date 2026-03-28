"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface TerminalLoaderProps {
  messages?: string[]
  delay?: number
}

const DEFAULT_MESSAGES = [
  "CONNECTING_TO_BSC...",
  "READING_VAULT_STATE...",
  "DECRYPTING_POSITIONS...",
  "READY"
]

export function TerminalLoader({ 
  messages = DEFAULT_MESSAGES, 
  delay = 800 
}: TerminalLoaderProps) {
  const [index, setIndex] = useState(0)
  const [text, setText] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % messages.length)
    }, delay)

    return () => clearInterval(timer)
  }, [messages.length, delay])

  return (
    <div className="flex flex-col items-center justify-center p-12 min-h-[300px] font-mono text-primary">
      <div className="relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="text-xs font-bold tracking-[0.3em] uppercase flex items-center gap-3"
          >
            <div className="w-2 h-4 bg-primary animate-pulse" />
            <span>{messages[index]}</span>
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="mt-8 grid grid-cols-4 gap-2 w-48">
        {[0, 1, 2, 3].map((i) => (
          <motion.div
            key={i}
            animate={{ 
              opacity: index >= i ? [0.2, 1, 0.2] : 0.1,
              scale: index === i ? [1, 1.1, 1] : 1
            }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="h-1 bg-primary rounded-full"
          />
        ))}
      </div>
    </div>
  )
}
