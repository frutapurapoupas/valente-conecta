'use client'

import { useEffect, useState } from 'react'

interface CountdownTimerProps {
  startTime: number | null
  duration: number
  onComplete?: () => void
}

export function CountdownTimer({ startTime, duration, onComplete }: CountdownTimerProps) {
  const [remaining, setRemaining] = useState(0)

  useEffect(() => {
    if (!startTime) return

    const updateRemaining = () => {
      const elapsed = Date.now() - startTime
      const remaining = Math.max(0, duration - elapsed)
      setRemaining(remaining)

      if (remaining === 0 && onComplete) {
        onComplete()
      }
    }

    updateRemaining()
    const interval = setInterval(updateRemaining, 100) // Update every 100ms for smooth countdown

    return () => clearInterval(interval)
  }, [startTime, duration, onComplete])

  if (!startTime || remaining === 0) return null

  const seconds = Math.ceil(remaining / 1000)
  const progress = 1 - (remaining / duration)

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-16 h-16">
        <svg className="transform -rotate-90 w-16 h-16">
          <circle
            cx="32"
            cy="32"
            r="28"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
            className="text-zinc-700"
          />
          <circle
            cx="32"
            cy="32"
            r="28"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
            strokeDasharray={`${2 * Math.PI * 28}`}
            strokeDashoffset={`${2 * Math.PI * 28 * (1 - progress)}`}
            className="text-yellow-500 transition-all duration-100"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-yellow-500 font-bold text-lg">{seconds}</span>
        </div>
      </div>
      <p className="text-yellow-400 text-xs font-medium">
        Escaneando... {seconds}s
      </p>
    </div>
  )
}
