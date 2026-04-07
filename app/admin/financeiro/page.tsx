'use client'

import { useState } from 'react'
import { DollarSign, TrendingUp, TrendingDown, Users, Calendar, Download, Search, Filter, CreditCard, Banknote, QrCode } from 'lucide-react'

interface Transacao {
  id: string
  usuario: string
  tipo: 'pix' | 'cartao' | 'boleto'
  valor: number
  status: 'pago' | 'pendente' | 'cancelado'
  data: string
  plano: string
}

export default function AdminFinanceiro() {
  const [transacoes, setTransacoes] = useState<Transacao[]>([
    { id: '1', usuario: 'Padaria do Zé', tipo: 'pix', valor: 49.90, status: 'pago', data: '01/04/2026', plano: 'Básico' },
    { id: '2', usuario: 'Maria Personal', tipo: 'cartao', valor: 99.90, status: 'pago', data: '28/03/2026', plano: 'Premium' },
    { id: '3', usuario: 'Supermercado Valente', tipo: 'pix', valor: 49.90, status: 'pendente', data: '25/03/2026', plano: 'Básico' },
    { id: '4', usuario: 'Carlos Mecânico', tipo: 'boleto', valor: 49.90, status: 'cancelado', data: '20/03/2026', plano: 'Básico' },
  ])

  const totalReceitas = transacoes.filter(t => t.status === 'pago').reduce((sum, t) => sum + t.valor, 0)
  const totalPendente = transacoes.filter(t => t.status === 'pendente').reduce((sum, t) => sum + t.valor, 0)

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Financeiro</h1>
          <p className="text-gray-500">Gerencie receitas e transações</p>
        </div>
        <button className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-600">
          <Download className="w-5 h-5" />
          Exportar Relatório
        </button>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-8 h-8 text-green-500" />
            <span className="text-2xl font-bold text-green-600">R$ {totalReceitas.toLocaleString()}</span>
          </div>
          <p className="text-sm text-gray-600">Receita Total</p>
          <p className="text-xs text-green-500 flex items-center gap-1 mt-1"><TrendingUp className="w-3 h-3" /> +23% este mês</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-8 h-8 text-yellow-500" />
            <span className="text-2xl font-bold text-yellow-600">R$ {totalPendente.toLocaleString()}</span>
          </div>
          <p className="text-sm text-gray-600">Pendente de Recebimento</p>
          <p className="text-xs text-gray-500">{transacoes.filter(t => t.status === 'pendente').length} transações</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-8 h-8 text-blue-500" />
            <span className="text-2xl font-bold">{transacoes.length}</span>
          </div>
          <p className="text-sm text-gray-600">Total de Transações</p>
          <p className="text-xs text-gray-500">Este mês</p>
        </div>
      </div>

      {/* Tabela de Transações */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="font-bold">Histórico de Transações</h2>
          <div className="flex gap-2">
            <button className="p-2 hover:bg-gray-100 rounded-lg"><Filter className="w-4 h-4" /></button>
            <button className="p-2 hover:bg-gray-100 rounded-lg"><Download className="w-4 h-4" /></button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr><th className="p-4 text-left text-sm">Data</th><th className="p-4 text-left text-sm">Usuário</th><th className="p-4 text-left text-sm">Plano</th><th className="p-4 text-left text-sm">Valor</th><th className="p-4 text-left text-sm">Método</th><th className="p-4 text-left text-sm">Status</th></tr>
            </thead>
            <tbody>
              {transacoes.map(t => (
                <tr key={t.id} className="border-b hover:bg-gray-50">
                  <td className="p-4 text-sm">{t.data}</td>
                  <td className="p-4 font-medium">{t.usuario}</td>
                  <td className="p-4 text-sm">{t.plano}</td>
                  <td className="p-4 font-bold text-green-600">R$ {t.valor.toFixed(2)}</td>
                  <td className="p-4">{t.tipo === 'pix' ? '📱 PIX' : t.tipo === 'cartao' ? '💳 Cartão' : '📄 Boleto'}</td>
                  <td className="p-4">{t.status === 'pago' ? '✅ Pago' : t.status === 'pendente' ? '⏳ Pendente' : '❌ Cancelado'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}