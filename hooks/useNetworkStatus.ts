// hooks/useNetworkStatus.ts
'use client'

import { useState, useEffect } from 'react'

export function useNetworkStatus() {
  const [isSlow, setIsSlow] = useState(false)
  const [connection, setConnection] = useState<any>(null)

  useEffect(() => {
    if ('connection' in navigator) {
      const conn = (navigator as any).connection
      setConnection(conn)
      
      const updateStatus = () => {
        // 3G ou mais lento = conexão lenta
        setIsSlow(conn.effectiveType === '2g' || conn.effectiveType === '3g')
      }
      
      updateStatus()
      conn.addEventListener('change', updateStatus)
      return () => conn.removeEventListener('change', updateStatus)
    }
  }, [])

  return { isSlow, connectionType: connection?.effectiveType }
}