// components/ui/Preloader.tsx
'use client'

import { useEffect } from 'react'
import { useNetworkStatus } from '@/hooks/useNetworkStatus'

export function Preloader() {
  const { isSlow } = useNetworkStatus()

  useEffect(() => {
    if (isSlow) {
      // Carregar versão leve
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = '/lightweight.css'
      document.head.appendChild(link)
    }
  }, [isSlow])

  return null
}