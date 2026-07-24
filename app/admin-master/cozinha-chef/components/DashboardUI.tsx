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
    compras: number
    pedidos: number
  }
  atividades: Array<{
    id: string
    descricao: string
    data: string
    status: 'concluido' | 'pendente' | 'alerta'
  }>
  loading: boolean
  onVerReceitas: () => void
  onVerEstoque: () => void
  onVerCompras: () => void
  onVerPedidos: () => void
}

export function DashboardUI({
  stats,
  atividades,
  loading,
  onVerReceitas,
  onVerEstoque,
  onVerCompras,
  onVerPedidos
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
        <p className="text-gray-500">Gerencie suas receitas, estoque, compras e pedidos</p>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
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
          <p className="text-sm text-gray-500 mt-1">Itens disponíveis</p>
          <button 
            className="mt-3 w-full bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700 transition"
            onClick={onVerEstoque}
          >
            Ver estoque
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
          <h3 className="text-gray-500 text-sm">🛒 Compras</h3>
          <p className="text-3xl font-bold text-yellow-600">{stats.compras}</p>
          <p className="text-sm text-gray-500 mt-1">Pendentes</p>
          <button 
            className="mt-3 w-full bg-yellow-600 text-white px-4 py-2 rounded text-sm hover:bg-yellow-700 transition"
            onClick={onVerCompras}
          >
            Ver compras
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
          <h3 className="text-gray-500 text-sm">📋 Pedidos</h3>
          <p className="text-3xl font-bold text-purple-600">{stats.pedidos}</p>
          <p className="text-sm text-gray-500 mt-1">Em andamento</p>
          <button 
            className="mt-3 w-full bg-purple-600 text-white px-4 py-2 rounded text-sm hover:bg-purple-700 transition"
            onClick={onVerPedidos}
          >
            Ver pedidos
          </button>
        </div>
      </div>

      {/* Atividades Recentes */}
      <div className="mt-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">📋 Atividades Recentes</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Atividade</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Data</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {atividades.map((a) => (
                  <tr key={a.id}>
                    <td className="px-6 py-4">{a.descricao}</td>
                    <td className="px-6 py-4">{a.data}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        a.status === 'concluido' ? 'bg-green-100 text-green-800' :
                        a.status === 'pendente' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {a.status === 'concluido' ? '✅ Concluído' :
                         a.status === 'pendente' ? '🔄 Pendente' : '⚠️ Alerta'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}