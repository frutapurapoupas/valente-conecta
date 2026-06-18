'use client'

import { useMultiCidade } from '@/hooks/useMultiCidade'
import { RelatorioComparativoCidades } from '@/components/admin/RelatorioComparativoCidades'
import { BarChart3, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function RelatorioComparativoCidadesPage() {
  const multiCidadeData = useMultiCidade()
  const cidades = multiCidadeData.cidades.filter(c => c.ativo).map(c => c.nome)

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-zinc-900/95 backdrop-blur border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Link
              href="/admin-master/dashboard"
              className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
              title="Voltar para Dashboard"
            >
              <ArrowLeft className="w-5 h-5 text-zinc-400" />
            </Link>
            <BarChart3 className="w-6 h-6 text-yellow-500" />
            <div>
              <h1 className="text-xl font-bold">Relatórios Comparativos</h1>
              <p className="text-zinc-300 text-sm">Admin Master</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">Análise Comparativa entre Cidades</h2>
          <p className="text-zinc-300">Compare métricas de desempenho entre as cidades do sistema</p>
        </div>

        <RelatorioComparativoCidades cidades={cidades} />
      </div>
    </div>
  )
}
