'use client'

import { useState } from 'react'
import { Search, Filter, Download, Calendar, ArrowUpRight, ArrowDownRight, CheckCircle, XCircle, Clock } from 'lucide-react'

interface Transacao {
  id: string
  de: string
  para: string
  valor: number
  data: string
  status: 'confirmada' | 'pendente' | 'cancelada'
  tipo: 'transferencia' | 'pagamento' | 'compensacao'
  cidade: string
}

export default function TransacoesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('todas')
  const [transacoes, setTransacoes] = useState<Transacao[]>([
    { id: '1', de: 'João Silva', para: 'Padaria do Zé', valor: 25.50, data: '10/04/2026 14:30', status: 'confirmada', tipo: 'pagamento', cidade: 'Coité Conecta' },
    { id: '2', de: 'Maria Santos', para: 'Academia Fitness', valor: 89.90, data: '10/04/2026 11:20', status: 'confirmada', tipo: 'pagamento', cidade: 'São Paulo' },
    { id: '3', de: 'Supermercado Valente', para: 'Carlos Mecânico', valor: 150.00, data: '09/04/2026 18:45', status: 'pendente', tipo: 'transferencia', cidade: 'Rio de Janeiro' },
    { id: '4', de: 'Padaria do Zé', para: 'João Silva', valor: 12.30, data: '09/04/2026 09:15', status: 'confirmada', tipo: 'pagamento', cidade: 'Coité Conecta' },
    { id: '5', de: 'Admin Master', para: 'Sistema', valor: 5000.00, data: '08/04/2026 00:00', status: 'confirmada', tipo: 'compensacao', cidade: 'Todas' },
  ])

  const totalConfirmadas = transacoes.filter(t => t.status === 'confirmada').reduce((sum, t) => sum + t.valor, 0)
  const totalPendentes = transacoes.filter(t => t.status === 'pendente').reduce((sum, t) => sum + t.valor, 0)

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'confirmada': return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'pendente': return <Clock className="w-4 h-4 text-yellow-500" />
      case 'cancelada': return <XCircle className="w-4 h-4 text-red-500" />
      default: return null
    }
  }

  const getTipoBadge = (tipo: string) => {
    switch(tipo) {
      case 'pagamento': return <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs">Pagamento</span>
      case 'transferencia': return <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">Transferência</span>
      case 'compensacao': return <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs">Compensação</span>
      default: return null
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Transações</h1>
          <p className="text-gray-500 text-base mt-1">Histórico completo de movimentações</p>
        </div>
        <button className="bg-green-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-green-700 transition">
          <Download className="w-5 h-5" />
          Exportar Relatório
        </button>
      </div>

      {/* Cards resumo */}
      <div className="grid grid-cols-2 gap-5 mb-6">
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl p-5">
          <p className="text-sm opacity-90">Total Confirmado</p>
          <p className="text-3xl font-bold mt-2">R$ {totalConfirmadas.toLocaleString()}</p>
        </div>
        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl p-5">
          <p className="text-sm opacity-90">Total Pendente</p>
          <p className="text-3xl font-bold mt-2">R$ {totalPendentes.toLocaleString()}</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por usuário..."
                className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm"
              />
            </div>
          </div>
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="px-4 py-2 border rounded-lg text-sm"
          >
            <option value="todas">Todos os status</option>
            <option value="confirmada">Confirmadas</option>
            <option value="pendente">Pendentes</option>
            <option value="cancelada">Canceladas</option>
          </select>
          <button className="px-4 py-2 border rounded-lg text-sm flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Período
          </button>
        </div>
      </div>

      {/* Tabela de transações */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 text-left text-sm font-semibold">De</th>
                <th className="p-4 text-left text-sm font-semibold">Para</th>
                <th className="p-4 text-right text-sm font-semibold">Valor</th>
                <th className="p-4 text-left text-sm font-semibold">Data</th>
                <th className="p-4 text-center text-sm font-semibold">Tipo</th>
                <th className="p-4 text-center text-sm font-semibold">Status</th>
                <th className="p-4 text-center text-sm font-semibold">Cidade</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {transacoes.map(transacao => (
                <tr key={transacao.id} className="hover:bg-gray-50">
                  <td className="p-4 font-medium">{transacao.de}</td>
                  <td className="p-4 text-gray-600">{transacao.para}</td>
                  <td className="p-4 text-right font-bold text-green-600">R$ {transacao.valor.toFixed(2)}</td>
                  <td className="p-4 text-sm text-gray-500">{transacao.data}</td>
                  <td className="p-4 text-center">{getTipoBadge(transacao.tipo)}</td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      {getStatusIcon(transacao.status)}
                      <span className="text-sm capitalize">{transacao.status}</span>
                    </div>
                  </td>
                  <td className="p-4 text-center text-sm text-gray-500">{transacao.cidade}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}