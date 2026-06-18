'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronLeft, Car, User, Check, X, AlertTriangle, Clock, Search } from 'lucide-react'

interface Motorista {
  id: string
  nomeCompleto: string
  rg: string
  cpf: string
  fotoRosto: string
  endereco: string
  localizador: string
  pix: string
  fotoCnh: string
  termoAceito: boolean
  veiculo: {
    tipo: string
    marca: string
    cor: string
    placa: string
    foto: string
  }
  valorKm: number
  aprovado: boolean
  dataCadastro: string
  pendencias: string[]
}

interface Pagamento {
  id: string
  motoristaId: string
  motoristaNome: string
  valor: number
  data: string
  comprovante: string
  confirmado: boolean
  dataConfirmacao?: string
}

export default function GerenciarTransportesPage() {
  const [motoristas, setMotoristas] = useState<Motorista[]>([])
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([])
  const [filtro, setFiltro] = useState<'todos' | 'pendentes' | 'aprovados'>('todos')
  const [busca, setBusca] = useState('')

  useEffect(() => {
    carregarDados()
  }, [])

  const carregarDados = () => {
    const motoristasSalvos = localStorage.getItem('motoristas_transportes')
    if (motoristasSalvos) {
      setMotoristas(JSON.parse(motoristasSalvos))
    }

    const pagamentosSalvos = localStorage.getItem('pagamentos_transportes')
    if (pagamentosSalvos) {
      setPagamentos(JSON.parse(pagamentosSalvos))
    }
  }

  const aprovarMotorista = (id: string) => {
    const motoristasAtualizados = motoristas.map(m =>
      m.id === id ? { ...m, aprovado: true } : m
    )
    setMotoristas(motoristasAtualizados)
    localStorage.setItem('motoristas_transportes', JSON.stringify(motoristasAtualizados))
  }

  const rejeitarMotorista = (id: string) => {
    const motoristasAtualizados = motoristas.filter(m => m.id !== id)
    setMotoristas(motoristasAtualizados)
    localStorage.setItem('motoristas_transportes', JSON.stringify(motoristasAtualizados))
  }

  const confirmarPagamento = (id: string) => {
    const pagamentosAtualizados = pagamentos.map(p =>
      p.id === id ? { ...p, confirmado: true, dataConfirmacao: new Date().toISOString() } : p
    )
    setPagamentos(pagamentosAtualizados)
    localStorage.setItem('pagamentos_transportes', JSON.stringify(pagamentosAtualizados))
  }

  const motoristasFiltrados = motoristas.filter(m => {
    const matchFiltro = filtro === 'todos' || (filtro === 'pendentes' && !m.aprovado) || (filtro === 'aprovados' && m.aprovado)
    const matchBusca = m.nomeCompleto.toLowerCase().includes(busca.toLowerCase()) || 
                      m.veiculo.placa.toLowerCase().includes(busca.toLowerCase())
    return matchFiltro && matchBusca
  })

  const pagamentosPendentes = pagamentos.filter(p => !p.confirmado)

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-24">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-zinc-900/95 backdrop-blur border-b border-zinc-800 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link href="/admin-master/dashboard" className="p-2 bg-zinc-800 rounded-xl">
            <ChevronLeft className="w-5 h-5 text-zinc-400" />
          </Link>
          <h1 className="text-lg font-black text-white">Gerenciar Transportes</h1>
          <div className="w-10" />
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Resumo */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
            <p className="text-2xl font-black text-white">{motoristas.length}</p>
            <p className="text-xs text-zinc-400">Total Motoristas</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
            <p className="text-2xl font-black text-orange-400">{motoristas.filter(m => !m.aprovado).length}</p>
            <p className="text-xs text-zinc-400">Pendentes</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
            <p className="text-2xl font-black text-emerald-400">{pagamentosPendentes.length}</p>
            <p className="text-xs text-zinc-400">Pagamentos Pendentes</p>
          </div>
        </div>

        {/* Pagamentos Pendentes */}
        {pagamentosPendentes.length > 0 && (
          <div className="bg-gradient-to-br from-orange-600/20 to-red-600/20 border border-orange-500/30 rounded-2xl p-5 space-y-4">
            <h3 className="font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-400" />
              Pagamentos Pendentes
            </h3>
            {pagamentosPendentes.map((pagamento) => (
              <div key={pagamento.id} className="bg-zinc-900 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-white">{pagamento.motoristaNome}</p>
                    <p className="text-sm text-zinc-400">Comissão: R$ {pagamento.valor.toFixed(2)}</p>
                  </div>
                  <button
                    onClick={() => confirmarPagamento(pagamento.id)}
                    className="px-4 py-2 bg-emerald-600 rounded-xl font-bold text-white hover:bg-emerald-700 transition-all flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    Confirmar
                  </button>
                </div>
                <p className="text-xs text-zinc-500">Data: {new Date(pagamento.data).toLocaleString('pt-BR')}</p>
              </div>
            ))}
          </div>
        )}

        {/* Filtros e Busca */}
        <div className="space-y-3">
          <div className="flex gap-2">
            <button
              onClick={() => setFiltro('todos')}
              className={`flex-1 py-2 rounded-xl font-bold transition-all ${
                filtro === 'todos' ? 'bg-zinc-700 text-white' : 'bg-zinc-800 text-zinc-400'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFiltro('pendentes')}
              className={`flex-1 py-2 rounded-xl font-bold transition-all ${
                filtro === 'pendentes' ? 'bg-orange-600 text-white' : 'bg-zinc-800 text-zinc-400'
              }`}
            >
              Pendentes
            </button>
            <button
              onClick={() => setFiltro('aprovados')}
              className={`flex-1 py-2 rounded-xl font-bold transition-all ${
                filtro === 'aprovados' ? 'bg-emerald-600 text-white' : 'bg-zinc-800 text-zinc-400'
              }`}
            >
              Aprovados
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
            <input
              value={busca}
              onChange={e => setBusca(e.target.value)}
              placeholder="Buscar por nome ou placa..."
              className="w-full pl-10 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Lista de Motoristas */}
        <div className="space-y-4">
          {motoristasFiltrados.length === 0 ? (
            <div className="text-center py-12">
              <Car className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
              <p className="text-zinc-500 font-medium">Nenhum motorista encontrado</p>
            </div>
          ) : (
            motoristasFiltrados.map((motorista) => (
              <div
                key={motorista.id}
                className={`bg-zinc-900 border rounded-2xl p-4 space-y-3 ${
                  motorista.aprovado ? 'border-emerald-500/30' : 'border-orange-500/30'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-zinc-500" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white">{motorista.nomeCompleto}</h4>
                      <p className="text-sm text-zinc-400">{motorista.veiculo.marca} {motorista.veiculo.cor} • {motorista.veiculo.placa}</p>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                    motorista.aprovado ? 'bg-emerald-600/20 text-emerald-400' : 'bg-orange-600/20 text-orange-400'
                  }`}>
                    {motorista.aprovado ? 'Aprovado' : 'Pendente'}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-zinc-500">CPF</p>
                    <p className="text-white">{motorista.cpf}</p>
                  </div>
                  <div>
                    <p className="text-zinc-500">PIX</p>
                    <p className="text-white">{motorista.pix}</p>
                  </div>
                  <div>
                    <p className="text-zinc-500">Valor/km</p>
                    <p className="text-emerald-400 font-bold">R$ {motorista.valorKm}</p>
                  </div>
                  <div>
                    <p className="text-zinc-500">Cadastro</p>
                    <p className="text-white">{new Date(motorista.dataCadastro).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>

                {!motorista.aprovado && (
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => aprovarMotorista(motorista.id)}
                      className="flex-1 py-2 bg-emerald-600 rounded-xl font-bold text-white hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      Aprovar
                    </button>
                    <button
                      onClick={() => rejeitarMotorista(motorista.id)}
                      className="flex-1 py-2 bg-red-600 rounded-xl font-bold text-white hover:bg-red-700 transition-all flex items-center justify-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Rejeitar
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  )
}
