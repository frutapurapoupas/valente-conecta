'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  TrendingUp, TrendingDown, Users, Building2, DollarSign, 
  ArrowRightLeft, Calendar, Activity, Shield, Wallet, 
  PieChart, BarChart3, Clock, Zap, ArrowUpRight, ArrowDownRight
} from 'lucide-react'

export default function MoedaConectaPage() {
  const [stats, setStats] = useState({
    totalMoedas: 125000,
    usuariosAtivos: 890,
    transacoesHoje: 45,
    transacoesMes: 1250,
    volumeTotal: 89500,
    volumeMes: 15420,
    cidadesAtivas: 3,
    taxaConversao: 98.5
  })

  const [transacoesRecentes, setTransacoesRecentes] = useState([
    { id: 1, de: 'João Silva', para: 'Padaria do Zé', valor: 25.50, data: '10/04/2026 14:30', status: 'confirmada' },
    { id: 2, de: 'Maria Santos', para: 'Academia Fitness', valor: 89.90, data: '10/04/2026 11:20', status: 'confirmada' },
    { id: 3, de: 'Supermercado Valente', para: 'Carlos Mecânico', valor: 150.00, data: '09/04/2026 18:45', status: 'pendente' },
    { id: 4, de: 'Padaria do Zé', para: 'João Silva', valor: 12.30, data: '09/04/2026 09:15', status: 'confirmada' },
  ])

  const [saldoPorCidade, setSaldoPorCidade] = useState([
    { cidade: 'Coité Conecta', saldo: 45600, percentual: 45 },
    { cidade: 'São Paulo', saldo: 32000, percentual: 32 },
    { cidade: 'Rio de Janeiro', saldo: 23000, percentual: 23 },
  ])

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Moeda Conecta</h1>
          <p className="text-gray-500 text-base mt-1">Sistema de criptomoeda descentralizado</p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/moeda-conecta/compensacao">
            <button className="px-5 py-2.5 bg-purple-600 text-white rounded-xl flex items-center gap-2 hover:bg-purple-700 transition">
              <Calendar className="w-5 h-5" />
              Compensação Mensal
            </button>
          </Link>
        </div>
      </div>

      {/* Cards principais */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-2xl font-bold text-blue-600">{stats.totalMoedas.toLocaleString()}</span>
          </div>
          <p className="text-gray-600">Total de Moedas</p>
          <p className="text-xs text-green-500 flex items-center gap-1 mt-1">
            <TrendingUp className="w-3 h-3" /> +5.2% este mês
          </p>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-2xl font-bold text-green-600">{stats.usuariosAtivos}</span>
          </div>
          <p className="text-gray-600">Usuários Ativos</p>
          <p className="text-xs text-green-500 flex items-center gap-1 mt-1">
            <TrendingUp className="w-3 h-3" /> +12 este mês
          </p>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <ArrowRightLeft className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-2xl font-bold text-purple-600">{stats.transacoesMes}</span>
          </div>
          <p className="text-gray-600">Transações no Mês</p>
          <p className="text-xs text-green-500 flex items-center gap-1 mt-1">
            <TrendingUp className="w-3 h-3" /> +18% vs mês anterior
          </p>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <Activity className="w-6 h-6 text-orange-600" />
            </div>
            <span className="text-2xl font-bold text-orange-600">{stats.taxaConversao}%</span>
          </div>
          <p className="text-gray-600">Taxa de Conversão</p>
          <p className="text-xs text-green-500 flex items-center gap-1 mt-1">
            <TrendingUp className="w-3 h-3" /> +2.3% este mês
          </p>
        </div>
      </div>

      {/* Gráficos 2 colunas */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Transações recentes */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="text-lg font-bold mb-4">Transações Recentes</h2>
          <div className="space-y-3">
            {transacoesRecentes.map(trans => (
              <div key={trans.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <ArrowRightLeft className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">{trans.de} → {trans.para}</p>
                    <p className="text-xs text-gray-500">{trans.data}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">R$ {trans.valor.toFixed(2)}</p>
                  <p className={`text-xs ${trans.status === 'confirmada' ? 'text-green-500' : 'text-yellow-500'}`}>
                    {trans.status === 'confirmada' ? '✓ Confirmada' : '⏳ Pendente'}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <Link href="/admin/moeda-conecta/transacoes">
            <button className="w-full mt-4 py-2 text-blue-600 text-sm hover:bg-blue-50 rounded-lg transition">
              Ver todas as transações →
            </button>
          </Link>
        </div>

        {/* Saldo por cidade */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="text-lg font-bold mb-4">Saldo por Cidade</h2>
          <div className="space-y-4">
            {saldoPorCidade.map(cidade => (
              <div key={cidade.cidade}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{cidade.cidade}</span>
                  <span>R$ {cidade.saldo.toLocaleString()} ({cidade.percentual}%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-full h-2"
                    style={{ width: `${cidade.percentual}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-4 border-t">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Próxima compensação</span>
              <span className="font-medium">30/04/2026</span>
            </div>
            <div className="flex justify-between text-sm mt-2">
              <span className="text-gray-500">Valor estimado</span>
              <span className="font-medium text-green-600">R$ 12.450,00</span>
            </div>
          </div>
        </div>
      </div>

      {/* Ações rápidas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link href="/admin/moeda-conecta/carteiras">
          <div className="bg-white rounded-xl p-4 text-center hover:shadow-md transition cursor-pointer">
            <Wallet className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <p className="font-medium">Carteiras</p>
            <p className="text-xs text-gray-500">Consultar saldos</p>
          </div>
        </Link>
        <Link href="/admin/moeda-conecta/transacoes">
          <div className="bg-white rounded-xl p-4 text-center hover:shadow-md transition cursor-pointer">
            <ArrowRightLeft className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <p className="font-medium">Transações</p>
            <p className="text-xs text-gray-500">Histórico completo</p>
          </div>
        </Link>
        <Link href="/admin/moeda-conecta/compensacao">
          <div className="bg-white rounded-xl p-4 text-center hover:shadow-md transition cursor-pointer">
            <Calendar className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <p className="font-medium">Compensação</p>
            <p className="text-xs text-gray-500">Entre cidades</p>
          </div>
        </Link>
        <Link href="/admin/moeda-conecta/regras">
          <div className="bg-white rounded-xl p-4 text-center hover:shadow-md transition cursor-pointer">
            <Shield className="w-8 h-8 text-orange-500 mx-auto mb-2" />
            <p className="font-medium">Regras</p>
            <p className="text-xs text-gray-500">Configurações</p>
          </div>
        </Link>
      </div>
    </div>
  )
}