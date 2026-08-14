// app/admin-master/cozinha-chef/containers/DashboardContainer.tsx
// ⚠️ LÓGICA PURA - SEM DESIGN!

"use client";

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardUI } from '../components/DashboardUI'

export function DashboardContainer() {
  const router = useRouter()
  const [stats, setStats] = useState({ receitas: 0, estoque: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/cozinha/receitas', { cache: 'no-store' }).then((r) => r.json()),
      fetch('/api/cozinha/estoque', { cache: 'no-store' }).then((r) => r.json()),
    ])
      .then(([receitasRes, estoqueRes]) => {
        setStats({
          receitas: receitasRes?.success ? receitasRes.data.length : 0,
          estoque: estoqueRes?.success ? estoqueRes.data.length : 0,
        })
      })
      .finally(() => setLoading(false))
  }, [])

  const handleVerReceitas = () => router.push('/admin-master/cozinha-chef/receitas')
  const handleVerEstoque = () => router.push('/admin-master/cozinha-chef/estoque')

  return (
    <DashboardUI
      stats={stats}
      loading={loading}
      onVerReceitas={handleVerReceitas}
      onVerEstoque={handleVerEstoque}
    />
  )
}