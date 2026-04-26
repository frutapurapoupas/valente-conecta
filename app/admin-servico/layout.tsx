'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

export default function AdminServicoLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { user, isServicoAgendamento, loading } = useAuth()

  useEffect(() => {
    if (!loading && !isServicoAgendamento) {
      router.push('/')
    }
  }, [isServicoAgendamento, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-900 text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    )
  }

  if (!isServicoAgendamento) {
    return null
  }

  return <>{children}</>
}
