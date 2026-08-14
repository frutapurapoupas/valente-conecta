// app/admin-master/cozinha-chef/components/DashboardUI.tsx
// ⚠️ DESIGN PURO - SEM LÓGICA!

// Usar caminhos relativos ou imports seguros
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Header } from '@/components/ui/Header'

interface DashboardUIProps {
  stats: {
    receitas: number
    estoque: number
  }
  loading: boolean
  onVerReceitas: () => void
  onVerEstoque: () => void
}

export function DashboardUI({
  stats,
  loading,
  onVerReceitas,
  onVerEstoque
}: DashboardUIProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header manual (sem depender do componente) */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">🍽️ Dashboard da Cozinha</h1>
        <p className="text-gray-500">Gerencie suas receitas e estoque</p>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
          <h3 className="text-gray-500 text-sm">📋 Receitas</h3>
          <p className="text-3xl font-bold text-blue-600">{stats.receitas}</p>
          <p className="text-sm text-gray-500 mt-1">Cadastradas</p>
          <button
            className="mt-3 w-full bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 transition"
            onClick={onVerReceitas}
          >
            Ver todas
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
          <h3 className="text-gray-500 text-sm">📦 Estoque</h3>
          <p className="text-3xl font-bold text-green-600">{stats.estoque}</p>
          <p className="text-sm text-gray-500 mt-1">Itens cadastrados</p>
          <button
            className="mt-3 w-full bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700 transition"
            onClick={onVerEstoque}
          >
            Ver estoque
          </button>
        </div>
      </div>
    </div>
  )
}