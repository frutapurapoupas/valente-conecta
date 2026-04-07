'use client'

import { useEffect } from 'react'

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const hasRequested = localStorage.getItem('push_requested')
    if (!hasRequested) {
      const timer = setTimeout(() => {
        const confirmar = confirm('🔔 Receber notificações do Valente Conecta?')
        if (confirmar) {
          Notification.requestPermission()
        }
        localStorage.setItem('push_requested', 'true')
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [])

  return <>{children}</>
}