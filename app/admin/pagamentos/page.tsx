'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, Clock, Search, Filter } from 'lucide-react'

interface Pagamento {
  id: string
  tipo: 'curriculo' | 'vaga'
  valor: number
  status: 'pendente' | 'aprovado' | 'rejeitado'
  dataCriacao: string
  dados: {
    nome?: string
    email?: string
    titulo?: string
  }
}

export default function PagamentosAdminPage() {
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([])
  const [filtro, setFiltro] = useState<'todos' | 'pendente' | 'aprovado' | 'rejeitado'>('todos')
  const [busca, setBusca] = useState('')

  useEffect(() => {
    carregarPagamentos()
    verificarRemocaoAutomatica()
  }, [])

  const carregarPagamentos = () => {
    // Carregar pagamentos do localStorage
    const pagamentosSalvos = localStorage.getItem('pagamentos_pendentes')
    if (pagamentosSalvos) {
      setPagamentos(JSON.parse(pagamentosSalvos))
    }
  }

  const verificarRemocaoAutomatica = () => {
    const pagamentosSalvos = localStorage.getItem('pagamentos_pendentes')
    if (pagamentosSalvos) {
      const pagamentos = JSON.parse(pagamentosSalvos)
      const agora = new Date()
      const atualizados = pagamentos.filter((p: Pagamento) => {
        const dataCriacao = new Date(p.dataCriacao)
        const horasDecorridas = (agora.getTime() - dataCriacao.getTime()) / (1000 * 60 * 60)
        // Remove pagamentos pendentes após 24h
        return !(p.status === 'pendente' && horasDecorridas > 24)
      })
      localStorage.setItem('pagamentos_pendentes', JSON.stringify(atualizados))
      setPagamentos(atualizados)
    }
  }

  const handleAprovar = (id: string) => {
    const atualizados = pagamentos.map(p => 
      p.id === id ? { ...p, status: 'aprovado' as const } : p
    )
    setPagamentos(atualizados)
    localStorage.setItem('pagamentos_pendentes', JSON.stringify(atualizados))
  }

  const handleRejeitar = (id: string) => {
    const atualizados = pagamentos.map(p => 
      p.id === id ? { ...p, status: 'rejeitado' as const } : p
    )
    setPagamentos(atualizados)
    localStorage.setItem('pagamentos_pendentes', JSON.stringify(atualizados))
  }

  const pagamentosFiltrados = pagamentos.filter(p => {
    if (filtro !== 'todos' && p.status !== filtro) return false
    if (busca) {
      const termo = busca.toLowerCase()
      return (
        p.dados.nome?.toLowerCase().includes(termo) ||
        p.dados.email?.toLowerCase().includes(termo) ||
        p.dados.titulo?.toLowerCase().includes(termo)
      )
    }
    return true
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aprovado': return 'text-green-400 bg-green-500/20'
      case 'rejeitado': return 'text-red-400 bg-red-500/20'
      default: return 'text-yellow-400 bg-yellow-500/20'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'aprovado': return <CheckCircle className="w-4 h-4" />
      case 'rejeitado': return <XCircle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 text-white pb-20">
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-black mb-6">Gerenciar Pagamentos</h1>

        {/* Filtros */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
              <input
                type="text"
                placeholder="Buscar por nome, email ou título..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-zinc-400 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="flex gap-2">
              {(['todos', 'pendente', 'aprovado', 'rejeitado'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFiltro(f)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filtro === f
                      ? 'bg-emerald-500 text-white'
                      : 'bg-white/10 text-zinc-300 hover:bg-white/20'
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Lista de Pagamentos */}
        <div className="space-y-4">
          {pagamentosFiltrados.length === 0 ? (
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 text-center">
              <p className="text-zinc-400">Nenhum pagamento encontrado</p>
            </div>
          ) : (
            pagamentosFiltrados.map((pagamento) => (
              <div
                key={pagamento.id}
                className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(pagamento.status)}`}>
                        {getStatusIcon(pagamento.status)}
                        {pagamento.status.charAt(0).toUpperCase() + pagamento.status.slice(1)}
                      </span>
                      <span className="text-xs text-zinc-400">
                        {pagamento.tipo === 'curriculo' ? 'Currículo' : 'Vaga'}
                      </span>
                    </div>
                    <h3 className="font-bold text-lg">
                      {pagamento.dados.nome || pagamento.dados.titulo}
                    </h3>
                    {pagamento.dados.email && (
                      <p className="text-sm text-zinc-400">{pagamento.dados.email}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-emerald-400">
                      R$ {pagamento.valor.toFixed(2)}
                    </p>
                    <p className="text-xs text-zinc-400">
                      {new Date(pagamento.dataCriacao).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>

                {pagamento.status === 'pendente' && (
                  <div className="flex gap-3 mt-4 pt-4 border-t border-white/10">
                    <button
                      onClick={() => handleAprovar(pagamento.id)}
                      className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Aprovar
                    </button>
                    <button
                      onClick={() => handleRejeitar(pagamento.id)}
                      className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                      <XCircle className="w-5 h-5" />
                      Rejeitar
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
