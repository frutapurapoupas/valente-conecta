'use client'

import { useState } from 'react'
import { Search, Wallet, Users, Building2, TrendingUp, TrendingDown, Eye, Send, Plus, Filter, ArrowUpRight, ArrowDownRight } from 'lucide-react'

interface Carteira {
  id: string
  nome: string
  tipo: 'usuario' | 'empresa'
  cidade: string
  saldo: number
  transacoesMes: number
  ultimaTransacao: string
  status: 'ativo' | 'inativo'
}

export default function CarteirasPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filtroCidade, setFiltroCidade] = useState('todas')
  const [showTransferModal, setShowTransferModal] = useState(false)
  const [carteiraSelecionada, setCarteiraSelecionada] = useState<Carteira | null>(null)

  const [carteiras, setCarteiras] = useState<Carteira[]>([
    { id: '1', nome: 'João Silva', tipo: 'usuario', cidade: 'Coité Conecta', saldo: 125.50, transacoesMes: 12, ultimaTransacao: '10/04/2026', status: 'ativo' },
    { id: '2', nome: 'Padaria do Zé', tipo: 'empresa', cidade: 'Coité Conecta', saldo: 2340.00, transacoesMes: 89, ultimaTransacao: '10/04/2026', status: 'ativo' },
    { id: '3', nome: 'Maria Santos', tipo: 'usuario', cidade: 'São Paulo', saldo: 45.30, transacoesMes: 5, ultimaTransacao: '09/04/2026', status: 'ativo' },
    { id: '4', nome: 'Supermercado Valente', tipo: 'empresa', cidade: 'São Paulo', saldo: 5670.00, transacoesMes: 156, ultimaTransacao: '10/04/2026', status: 'ativo' },
    { id: '5', nome: 'Academia Fitness', tipo: 'empresa', cidade: 'Rio de Janeiro', saldo: 890.00, transacoesMes: 45, ultimaTransacao: '08/04/2026', status: 'inativo' },
  ])

  const totalSaldo = carteiras.reduce((sum, c) => sum + c.saldo, 0)
  const saldoUsuarios = carteiras.filter(c => c.tipo === 'usuario').reduce((sum, c) => sum + c.saldo, 0)
  const saldoEmpresas = carteiras.filter(c => c.tipo === 'empresa').reduce((sum, c) => sum + c.saldo, 0)

  const carteirasFiltradas = carteiras.filter(c => {
    if (searchTerm && !c.nome.toLowerCase().includes(searchTerm.toLowerCase())) return false
    if (filtroCidade !== 'todas' && c.cidade !== filtroCidade) return false
    return true
  })

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Carteiras Conecta</h1>
          <p className="text-gray-500 text-base mt-1">Consulta de saldos e movimentações</p>
        </div>
        <button className="bg-blue-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-blue-700 transition">
          <Plus className="w-5 h-5" />
          Nova Carteira
        </button>
      </div>

      {/* Cards resumo */}
      <div className="grid grid-cols-3 gap-5 mb-6">
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl p-5">
          <p className="text-sm opacity-90">Saldo Total em Circulação</p>
          <p className="text-3xl font-bold mt-2">R$ {totalSaldo.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <p className="text-sm text-gray-500">Saldo Usuários</p>
          <p className="text-2xl font-bold text-blue-600">R$ {saldoUsuarios.toLocaleString()}</p>
          <p className="text-xs text-green-500 mt-1">+8% este mês</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <p className="text-sm text-gray-500">Saldo Empresas</p>
          <p className="text-2xl font-bold text-green-600">R$ {saldoEmpresas.toLocaleString()}</p>
          <p className="text-xs text-green-500 mt-1">+15% este mês</p>
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
                placeholder="Buscar por nome..."
                className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm"
              />
            </div>
          </div>
          <select
            value={filtroCidade}
            onChange={(e) => setFiltroCidade(e.target.value)}
            className="px-4 py-2 border rounded-lg text-sm"
          >
            <option value="todas">Todas as cidades</option>
            <option value="Coité Conecta">Coité Conecta</option>
            <option value="São Paulo">São Paulo</option>
            <option value="Rio de Janeiro">Rio de Janeiro</option>
          </select>
        </div>
      </div>

      {/* Tabela de carteiras */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 text-left text-sm font-semibold">Usuário/Empresa</th>
                <th className="p-4 text-left text-sm font-semibold">Tipo</th>
                <th className="p-4 text-left text-sm font-semibold">Cidade</th>
                <th className="p-4 text-right text-sm font-semibold">Saldo</th>
                <th className="p-4 text-center text-sm font-semibold">Transações/Mês</th>
                <th className="p-4 text-center text-sm font-semibold">Status</th>
                <th className="p-4 text-center text-sm font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {carteirasFiltradas.map(carteira => (
                <tr key={carteira.id} className="hover:bg-gray-50">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        {carteira.tipo === 'usuario' ? <Users className="w-4 h-4" /> : <Building2 className="w-4 h-4" />}
                      </div>
                      <span className="font-medium">{carteira.nome}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${carteira.tipo === 'usuario' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                      {carteira.tipo === 'usuario' ? 'Usuário' : 'Empresa'}
                    </span>
                  </td>
                  <td className="p-4 text-sm">{carteira.cidade}</td>
                  <td className="p-4 text-right">
                    <span className="font-bold text-green-600">R$ {carteira.saldo.toFixed(2)}</span>
                  </td>
                  <td className="p-4 text-center text-sm">{carteira.transacoesMes}</td>
                  <td className="p-4 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${carteira.status === 'ativo' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {carteira.status === 'ativo' ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex gap-2 justify-center">
                      <button className="p-1 text-blue-500 hover:bg-blue-50 rounded" title="Ver extrato">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-green-500 hover:bg-green-50 rounded" title="Transferir">
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}