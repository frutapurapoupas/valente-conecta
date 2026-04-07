'use client'

import { useState } from 'react'
import { 
  TrendingUp, TrendingDown, Users, Building2, Package, DollarSign, 
  ShoppingCart, Award, Calendar, Clock, Eye, Zap, Download, Filter,
  ArrowUpRight, ArrowDownRight
} from 'lucide-react'

export default function AdminDashboard() {
  const [estatisticas] = useState({
    totalUsuarios: 1250,
    totalEmpresas: 87,
    totalProdutos: 3420,
    totalVendas: 892,
    faturamentoMes: 15420.50,
    faturamentoTotal: 89450.75,
    ofertasAtivas: 45,
    buscasRealizadas: 12580
  })

  const [vendasPorDia] = useState([
    { dia: 'Segunda', valor: 1250 },
    { dia: 'Terça', valor: 1890 },
    { dia: 'Quarta', valor: 2100 },
    { dia: 'Quinta', valor: 1780 },
    { dia: 'Sexta', valor: 2560 },
    { dia: 'Sábado', valor: 3240 },
    { dia: 'Domingo', valor: 890 },
  ])

  const [planosAtivos] = useState([
    { nome: 'Grátis', usuarios: 890, cor: 'bg-gray-500', percentual: 71 },
    { nome: 'Básico', usuarios: 250, cor: 'bg-blue-500', percentual: 20 },
    { nome: 'Premium', usuarios: 110, cor: 'bg-purple-500', percentual: 9 },
  ])

  const maxVenda = Math.max(...vendasPorDia.map(v => v.valor))

  return (
    <div>
      {/* Header 4x MAIOR */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-10 mb-16">
        <div>
          <h1 className="text-8xl font-bold">Dashboard</h1>
          <p className="text-gray-500 text-3xl mt-4">Visão geral do sistema Valente Conecta</p>
        </div>
        <div className="flex gap-6">
          <button className="px-12 py-6 bg-white border-2 rounded-xl text-2xl flex items-center gap-5 hover:bg-gray-50 transition shadow-md">
            <Filter className="w-10 h-10" />
            Filtrar
          </button>
          <button className="px-12 py-6 bg-blue-600 text-white rounded-xl text-2xl flex items-center gap-5 hover:bg-blue-700 transition shadow-md">
            <Download className="w-10 h-10" />
            Exportar Relatório
          </button>
        </div>
      </div>

      {/* Cards - 4x MAIORES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-16">
        <div className="bg-white rounded-2xl p-12 shadow-xl hover:shadow-2xl transition border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div className="w-32 h-32 bg-blue-100 rounded-2xl flex items-center justify-center">
              <Users className="w-20 h-20 text-blue-600" />
            </div>
            <div className="flex items-center gap-3 text-green-600 bg-green-50 px-5 py-3 rounded-full">
              <ArrowUpRight className="w-8 h-8" />
              <span className="text-2xl font-semibold">+12%</span>
            </div>
          </div>
          <p className="text-8xl font-bold text-gray-800">{estatisticas.totalUsuarios.toLocaleString()}</p>
          <p className="text-gray-500 text-2xl mt-4">Usuários Totais</p>
          <p className="text-xl text-gray-400 mt-5">+124 este mês</p>
        </div>

        <div className="bg-white rounded-2xl p-12 shadow-xl hover:shadow-2xl transition border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div className="w-32 h-32 bg-purple-100 rounded-2xl flex items-center justify-center">
              <Building2 className="w-20 h-20 text-purple-600" />
            </div>
            <div className="flex items-center gap-3 text-green-600 bg-green-50 px-5 py-3 rounded-full">
              <ArrowUpRight className="w-8 h-8" />
              <span className="text-2xl font-semibold">+8%</span>
            </div>
          </div>
          <p className="text-8xl font-bold text-gray-800">{estatisticas.totalEmpresas}</p>
          <p className="text-gray-500 text-2xl mt-4">Empresas/Profissionais</p>
          <p className="text-xl text-gray-400 mt-5">+8 este mês</p>
        </div>

        <div className="bg-white rounded-2xl p-12 shadow-xl hover:shadow-2xl transition border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div className="w-32 h-32 bg-orange-100 rounded-2xl flex items-center justify-center">
              <Package className="w-20 h-20 text-orange-600" />
            </div>
            <div className="flex items-center gap-3 text-green-600 bg-green-50 px-5 py-3 rounded-full">
              <ArrowUpRight className="w-8 h-8" />
              <span className="text-2xl font-semibold">+7%</span>
            </div>
          </div>
          <p className="text-8xl font-bold text-gray-800">{estatisticas.totalProdutos.toLocaleString()}</p>
          <p className="text-gray-500 text-2xl mt-4">Produtos no Catálogo</p>
          <p className="text-xl text-gray-400 mt-5">+234 este mês</p>
        </div>

        <div className="bg-white rounded-2xl p-12 shadow-xl hover:shadow-2xl transition border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div className="w-32 h-32 bg-green-100 rounded-2xl flex items-center justify-center">
              <DollarSign className="w-20 h-20 text-green-600" />
            </div>
            <div className="flex items-center gap-3 text-green-600 bg-green-50 px-5 py-3 rounded-full">
              <ArrowUpRight className="w-8 h-8" />
              <span className="text-2xl font-semibold">+18%</span>
            </div>
          </div>
          <p className="text-8xl font-bold text-green-600">R$ {estatisticas.faturamentoMes.toLocaleString()}</p>
          <p className="text-gray-500 text-2xl mt-4">Faturamento do Mês</p>
          <p className="text-xl text-gray-400 mt-5">vs R$ 13.070 mês anterior</p>
        </div>
      </div>

      {/* Gráficos - 2 colunas MAIORES */}
      <div className="grid lg:grid-cols-2 gap-10 mb-16">
        {/* Gráfico de Vendas */}
        <div className="bg-white rounded-2xl shadow-xl p-12 border border-gray-100">
          <div className="flex justify-between items-center mb-12 flex-wrap gap-6">
            <h2 className="text-4xl font-bold">Vendas da Semana</h2>
            <select className="text-2xl border-2 rounded-xl px-6 py-4 bg-white">
              <option>Últimos 7 dias</option>
              <option>Últimos 30 dias</option>
              <option>Últimos 90 dias</option>
            </select>
          </div>
          <div className="flex items-end gap-6 h-[600px]">
            {vendasPorDia.map((venda, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center">
                <div 
                  className="w-full bg-gradient-to-t from-blue-500 to-purple-500 rounded-t-2xl transition-all hover:opacity-80 cursor-pointer group relative"
                  style={{ height: `${(venda.valor / maxVenda) * 100}%`, minHeight: '60px' }}
                >
                  <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xl px-5 py-3 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                    R$ {venda.valor}
                  </div>
                </div>
                <p className="text-2xl text-gray-500 mt-8 font-medium">{venda.dia}</p>
                <p className="text-xl text-gray-400">R$ {venda.valor}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Distribuição de Planos */}
        <div className="bg-white rounded-2xl shadow-xl p-12 border border-gray-100">
          <h2 className="text-4xl font-bold mb-10">Distribuição de Planos</h2>
          <div className="space-y-10">
            {planosAtivos.map(plano => (
              <div key={plano.nome}>
                <div className="flex justify-between text-2xl mb-5">
                  <span className="font-semibold">{plano.nome}</span>
                  <div className="flex gap-10">
                    <span>{plano.usuarios} usuários</span>
                    <span className="text-gray-500">{plano.percentual}%</span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-8">
                  <div 
                    className={`${plano.cor} rounded-full h-8 transition-all`}
                    style={{ width: `${plano.percentual}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-12 pt-10 border-t">
            <div className="grid grid-cols-2 gap-10">
              <div className="bg-blue-50 rounded-xl p-10">
                <p className="text-2xl text-gray-600">Ticket Médio</p>
                <p className="text-5xl font-bold text-blue-600">R$ 47,50</p>
                <p className="text-xl text-green-600 mt-4">+5% vs mês anterior</p>
              </div>
              <div className="bg-green-50 rounded-xl p-10">
                <p className="text-2xl text-gray-600">Taxa Conversão</p>
                <p className="text-5xl font-bold text-green-600">23.5%</p>
                <p className="text-xl text-green-600 mt-4">+2.3% vs mês anterior</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Atividades Recentes e Ações Rápidas - 4x MAIORES */}
      <div className="grid lg:grid-cols-2 gap-10">
        {/* Atividades Recentes */}
        <div className="bg-white rounded-2xl shadow-xl p-12 border border-gray-100">
          <h2 className="text-4xl font-bold mb-10">Atividades Recentes</h2>
          <div className="space-y-8">
            <div className="flex items-start gap-8 pb-8 border-b">
              <div className="w-28 h-28 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Users className="w-16 h-16 text-green-600" />
              </div>
              <div>
                <p className="text-3xl font-semibold">Novo usuário cadastrado</p>
                <p className="text-2xl text-gray-500">João Silva - há 5 minutos</p>
              </div>
            </div>
            <div className="flex items-start gap-8 pb-8 border-b">
              <div className="w-28 h-28 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Building2 className="w-16 h-16 text-purple-600" />
              </div>
              <div>
                <p className="text-3xl font-semibold">Nova empresa registrada</p>
                <p className="text-2xl text-gray-500">Padaria do Zé - há 1 hora</p>
              </div>
            </div>
            <div className="flex items-start gap-8 pb-8 border-b">
              <div className="w-28 h-28 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Package className="w-16 h-16 text-orange-600" />
              </div>
              <div>
                <p className="text-3xl font-semibold">Produto aguardando aprovação</p>
                <p className="text-2xl text-gray-500">Arroz Integral - 5 produtos pendentes</p>
              </div>
            </div>
            <div className="flex items-start gap-8">
              <div className="w-28 h-28 bg-yellow-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Award className="w-16 h-16 text-yellow-600" />
              </div>
              <div>
                <p className="text-3xl font-semibold">Plano atualizado para Premium</p>
                <p className="text-2xl text-gray-500">Academia Fitness - há 2 horas</p>
              </div>
            </div>
          </div>
        </div>

        {/* Ações Rápidas */}
        <div className="bg-white rounded-2xl shadow-xl p-12 border border-gray-100">
          <h2 className="text-4xl font-bold mb-10">Ações Rápidas</h2>
          <div className="grid grid-cols-2 gap-8">
            <button className="bg-blue-50 p-10 rounded-xl text-center hover:bg-blue-100 transition group">
              <Eye className="w-20 h-20 text-blue-600 mx-auto mb-6 group-hover:scale-110 transition" />
              <p className="text-2xl font-semibold">Verificar Aprovações</p>
              <p className="text-xl text-gray-500 mt-4">5 pendentes</p>
            </button>
            <button className="bg-green-50 p-10 rounded-xl text-center hover:bg-green-100 transition group">
              <Zap className="w-20 h-20 text-green-600 mx-auto mb-6 group-hover:scale-110 transition" />
              <p className="text-2xl font-semibold">Relatórios</p>
              <p className="text-xl text-gray-500 mt-4">Exportar dados</p>
            </button>
            <button className="bg-purple-50 p-10 rounded-xl text-center hover:bg-purple-100 transition group">
              <Award className="w-20 h-20 text-purple-600 mx-auto mb-6 group-hover:scale-110 transition" />
              <p className="text-2xl font-semibold">Planos</p>
              <p className="text-xl text-gray-500 mt-4">Gerenciar assinaturas</p>
            </button>
            <button className="bg-orange-50 p-10 rounded-xl text-center hover:bg-orange-100 transition group">
              <Calendar className="w-20 h-20 text-orange-600 mx-auto mb-6 group-hover:scale-110 transition" />
              <p className="text-2xl font-semibold">Agenda</p>
              <p className="text-xl text-gray-500 mt-4">Próximos vencimentos</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}