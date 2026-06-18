'use client'

import { useMultiCidade } from '@/hooks/useMultiCidade'
import { GestaoUsuariosCidade } from '@/components/admin/GestaoUsuariosCidade'
import { useState } from 'react'
import Link from 'next/link'
import { Users, ArrowLeft } from 'lucide-react'

export default function GestaoUsuariosCidadePage() {
  const multiCidadeData = useMultiCidade()
  const [cidadeSelecionada, setCidadeSelecionada] = useState('Valente')

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
            <Users className="w-6 h-6 text-blue-500" />
            <div>
              <h1 className="text-xl font-bold">Gestão de Usuários por Cidade</h1>
              <p className="text-zinc-300 text-sm">Admin Master</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">Gerencie usuários de cada cidade do sistema</h2>
          <p className="text-zinc-300">Selecione uma cidade para ver e gerenciar os usuários</p>
        </div>
        
        <div className="mb-4">
            <select
              value={cidadeSelecionada}
              onChange={(e) => setCidadeSelecionada(e.target.value)}
              className="px-4 py-2 bg-zinc-800 border border-zinc-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500"
            >
            {multiCidadeData.cidades.map(cidade => (
              <option key={cidade.id} value={cidade.nome}>
                {cidade.nome} {cidade.ativo ? '(Ativo)' : '(Inativo)'}
              </option>
            ))}
          </select>
        </div>

        <GestaoUsuariosCidade cidadeSelecionada={cidadeSelecionada} />
      </div>
    </div>
  )
}
