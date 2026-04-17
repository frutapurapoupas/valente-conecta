'use client'
import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft, Plus, TrendingUp, TrendingDown, Wallet, AlertCircle, Clock,
  ChevronLeft, ChevronRight, DollarSign, Bell, Star, Printer, CreditCard, RefreshCw, X,
} from 'lucide-react'
import {
  useFinanceiroPessoal,
  CATEGORIAS_RECEITA, CATEGORIAS_DESPESA,
  type Lancamento, type LancamentoTipo, type LancamentoStatus,
  type Cartao,
} from '@/hooks/useFinanceiroPessoal'
import ModalLancamento from './financeiro-pessoal/ModalLancamento'
import LinhaLancamento from './financeiro-pessoal/LinhaLancamento'
import ModalCartao from './financeiro-pessoal/ModalCartao'
import CartaoCard from './financeiro-pessoal/CartaoCard'
import BannerAlerta from './financeiro-pessoal/BannerAlerta'
import ModalImpressao from './financeiro-pessoal/ModalImpressao'

// ─── helpers ──────────────────────────────────────────────────────────────────

const fmt = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

function mesLabel(mes: string) {
  const [ano, m] = mes.split('-')
  const nomes = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']
  return `${nomes[Number(m) - 1]} ${ano}`
}

function navMes(mes: string, delta: number) {
  const [ano, m] = mes.split('-').map(Number)
  const d = new Date(ano, m - 1 + delta, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

const STATUS_LABEL: Record<LancamentoStatus, { label: string; cls: string }> = {
  pendente:  { label: 'Pendente',  cls: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
  pago:      { label: 'Pago',      cls: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
  atrasado:  { label: 'Atrasado',  cls: 'bg-red-500/20 text-red-300 border-red-500/30' },
  cancelado: { label: 'Cancelado', cls: 'bg-zinc-700/40 text-zinc-500 border-zinc-700' },
}

const TIPO_LABEL: Record<LancamentoTipo, string> = {
  receita: 'Receita',
  despesa: 'Despesa',
  fatura:  'Fatura',
}

// ─── Tela principal ───────────────────────────────────────────────────────────

export default function FinanceiroPessoalScreen() {
  const {
    lancamentos, resumo,
    filtroMes, setFiltroMes,
    filtroTipo, setFiltroTipo,
    filtroStatus, setFiltroStatus,
    showModal, editando,
    abrirNovo, abrirEdicao, fecharModal,
    adicionarLancamento, atualizarLancamento,
    removerLancamento, removerGrupoRecorrencia,
    marcarPago, adicionarProlabore,
    cartoes, adicionarCartao, atualizarCartao, removerCartao,
    alertasCartoes,
  } = useFinanceiroPessoal()

  const [aba, setAba] = useState<'lancamentos' | 'cartoes'>('lancamentos')
  const [showProlabore, setShowProlabore] = useState(false)
  const [valorProlabore, setValorProlabore] = useState('')
  const [showModalCartao, setShowModalCartao] = useState(false)
  const [editandoCartao, setEditandoCartao] = useState<Cartao | null>(null)
  const [showImpressao, setShowImpressao] = useState(false)

  function confirmarProlabore() {
    const v = parseFloat(valorProlabore.replace(',', '.'))
    if (!isNaN(v) && v > 0) {
      adicionarProlabore(v)
      setShowProlabore(false)
      setValorProlabore('')
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-28">

      {/* header */}
      <header className="sticky top-0 z-30 bg-zinc-950/95 backdrop-blur border-b border-zinc-900 px-4 py-4 flex items-center gap-3">
        <Link href="/admin-master/dashboard" className="p-2 bg-zinc-900 border border-zinc-800 rounded-xl">
          <ArrowLeft className="w-5 h-5 text-zinc-400" />
        </Link>
        <div className="flex-1">
          <h1 className="text-lg font-black text-white">Finanças Pessoais</h1>
          <p className="text-xs text-zinc-500">Controle particular · Admin Master</p>
        </div>
        <button
          onClick={() => setShowProlabore(true)}
          className="flex items-center gap-2 px-3 py-2 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 rounded-xl text-sm font-bold hover:bg-emerald-500/20"
        >
          <DollarSign className="w-4 h-4" /> Pró-labore
        </button>
      </header>

      {/* alertas de cartão — sempre visíveis no topo */}
      {alertasCartoes.length > 0 && (
        <div className="px-4 pt-4 max-w-2xl mx-auto flex flex-col gap-2">
          {alertasCartoes.map((a, i) => <BannerAlerta key={i} urgencia={a.urgencia} tipo={a.tipo} mensagem={a.mensagem} />)}
        </div>
      )}

      {/* tabs */}
      <div className="px-4 pt-4 max-w-2xl mx-auto">
        <div className="grid grid-cols-2 gap-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-1">
          <button
            onClick={() => setAba('lancamentos')}
            className={`py-2.5 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2 ${aba === 'lancamentos' ? 'bg-indigo-600 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            <Wallet className="w-4 h-4" /> Lançamentos
          </button>
          <button
            onClick={() => setAba('cartoes')}
            className={`py-2.5 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2 relative ${aba === 'cartoes' ? 'bg-indigo-600 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            <CreditCard className="w-4 h-4" /> Cartões
            {alertasCartoes.length > 0 && (
              <span className="absolute top-1.5 right-3 w-2 h-2 bg-red-500 rounded-full" />
            )}
          </button>
        </div>
      </div>

      <div className="px-4 py-5 max-w-2xl mx-auto flex flex-col gap-5">

        {aba === 'lancamentos' && (
          <>
            {/* navegação de mês */}
            <div className="flex items-center justify-between">
              <button onClick={() => setFiltroMes(navMes(filtroMes, -1))} className="p-2 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-zinc-600">
                <ChevronLeft className="w-5 h-5 text-zinc-400" />
              </button>
              <p className="font-black text-xl text-white">{mesLabel(filtroMes)}</p>
              <button onClick={() => setFiltroMes(navMes(filtroMes, 1))} className="p-2 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-zinc-600">
                <ChevronRight className="w-5 h-5 text-zinc-400" />
              </button>
            </div>

            {/* resumo cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className={`col-span-2 rounded-2xl p-4 border flex items-center gap-4 ${
                resumo.saldoMes >= 0 ? 'bg-emerald-500/10 border-emerald-500/25' : 'bg-red-500/10 border-red-500/25'
              }`}>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${resumo.saldoMes >= 0 ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>
                  <Wallet className={`w-6 h-6 ${resumo.saldoMes >= 0 ? 'text-emerald-400' : 'text-red-400'}`} />
                </div>
                <div>
                  <p className="text-xs font-bold text-zinc-500 uppercase">Saldo do mês</p>
                  <p className={`text-2xl font-black ${resumo.saldoMes >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{fmt(resumo.saldoMes)}</p>
                </div>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
                <TrendingUp className="w-5 h-5 text-emerald-400 mb-2" />
                <p className="text-xs text-zinc-500 font-bold">RECEITAS</p>
                <p className="text-xl font-black text-emerald-400">{fmt(resumo.totalReceitas)}</p>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
                <TrendingDown className="w-5 h-5 text-red-400 mb-2" />
                <p className="text-xs text-zinc-500 font-bold">DESPESAS</p>
                <p className="text-xl font-black text-red-400">{fmt(resumo.totalDespesas)}</p>
              </div>
              <div className="bg-zinc-900 border border-amber-500/20 rounded-2xl p-4">
                <Clock className="w-5 h-5 text-amber-400 mb-2" />
                <p className="text-xs text-zinc-500 font-bold">A VENCER</p>
                <p className="text-xl font-black text-amber-400">{fmt(resumo.aVencer)}</p>
              </div>
              <div className="bg-zinc-900 border border-red-500/20 rounded-2xl p-4">
                <AlertCircle className="w-5 h-5 text-red-400 mb-2" />
                <p className="text-xs text-zinc-500 font-bold">ATRASADOS</p>
                <p className="text-xl font-black text-red-400">{fmt(resumo.atrasados)}</p>
              </div>
            </div>

            {/* filtros + botão imprimir */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              <button
                onClick={() => setShowImpressao(true)}
                className="flex items-center gap-1.5 px-3 py-2 bg-zinc-900 border border-zinc-700 text-zinc-300 rounded-xl text-sm font-bold hover:border-zinc-500 flex-shrink-0 transition-all"
              >
                <Printer className="w-4 h-4" /> Imprimir
              </button>
              <div className="w-px bg-zinc-800 flex-shrink-0 self-stretch" />
              {(['todos', 'receita', 'despesa', 'fatura'] as const).map(t => (
                <button key={t} onClick={() => setFiltroTipo(t)} 
                  className={`px-4 py-2 rounded-xl font-bold text-sm whitespace-nowrap border transition-all ${filtroTipo === t ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300' : 'bg-zinc-900 border-zinc-800 text-zinc-400'}`}>
                  {t === 'todos' ? 'Todos' : TIPO_LABEL[t]}
                </button>
              ))}
              <div className="w-px bg-zinc-800 flex-shrink-0 self-stretch" />
              {(['todos', 'pendente', 'atrasado', 'pago', 'cancelado'] as const).map(s => (
                <button key={s} onClick={() => setFiltroStatus(s)}
                  className={`px-4 py-2 rounded-xl font-bold text-sm whitespace-nowrap border transition-all ${filtroStatus === s ? 'bg-zinc-700 border-zinc-600 text-white' : 'bg-zinc-900 border-zinc-800 text-zinc-400'}`}>
                  {s === 'todos' ? 'Todos status' : s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>

            {/* lista */}
            {lancamentos.length === 0 ? (
              <div className="text-center py-16">
                <CreditCard className="w-12 h-12 text-zinc-800 mx-auto mb-4" />
                <p className="text-zinc-600 font-bold">Nenhum lançamento neste período</p>
                <p className="text-zinc-700 text-sm mt-1">Toque em + para adicionar</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {lancamentos
                  .sort((a, b) => a.vencimento.localeCompare(b.vencimento))
                  .map(l => (
                    <LinhaLancamento key={l.id} l={l}
                      onPago={() => marcarPago(l.id)}
                      onEditar={() => abrirEdicao(l)}
                      onRemover={() => removerLancamento(l.id)}
                      onRemoverGrupo={() => l.grupoRecorrencia && removerGrupoRecorrencia(l.grupoRecorrencia)}
                    />
                  ))}
              </div>
            )}
          </>
        )}

        {aba === 'cartoes' && (
          <>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-black text-xl text-white">Meus Cartões</h2>
                <p className="text-xs text-zinc-500">Alertas automáticos de vencimento e melhor dia</p>
              </div>
              <button
                onClick={() => { setEditandoCartao(null); setShowModalCartao(true) }}
                className="flex items-center gap-2 px-3 py-2 bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 rounded-xl text-sm font-bold hover:bg-indigo-500/20"
              >
                <Plus className="w-4 h-4" /> Novo
              </button>
            </div>

            {cartoes.length === 0 ? (
              <div className="text-center py-16">
                <CreditCard className="w-12 h-12 text-zinc-800 mx-auto mb-4" />
                <p className="text-zinc-600 font-bold">Nenhum cartão cadastrado</p>
                <p className="text-zinc-700 text-sm mt-1">Cadastre para receber alertas de vencimento</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {cartoes.map(c => (
                  <CartaoCard key={c.id} c={c}
                    onEditar={() => { setEditandoCartao(c); setShowModalCartao(true) }}
                    onRemover={() => removerCartao(c.id)}
                  />
                ))}
              </div>
            )}

            {/* legenda */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col gap-2">
              <p className="text-xs font-black text-zinc-500 uppercase">Como funciona</p>
              <div className="flex items-start gap-2 text-sm text-zinc-400">
                <Bell className="w-4 h-4 text-indigo-400 mt-0.5 flex-shrink-0" />
                <span>Alertas aparecem automaticamente no topo da tela conforme o vencimento se aproxima</span>
              </div>
              <div className="flex items-start gap-2 text-sm text-zinc-400">
                <Star className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                <span>O melhor dia de compra é calculado como 10 dias antes do vencimento — maximizando seu prazo de pagamento</span>
              </div>
              <div className="flex items-start gap-2 text-sm text-zinc-400">
                <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                <span>Alertas críticos (vermelho) aparecem quando faltam 2 dias ou menos para o vencimento</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* FAB — só na aba lançamentos */}
      {aba === 'lancamentos' && (
        <button
          onClick={abrirNovo}
          className="fixed bottom-6 right-6 w-16 h-16 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl shadow-xl flex items-center justify-center transition-all active:scale-95 z-40"
        >
          <Plus className="w-8 h-8" />
        </button>
      )}

      {/* modal pró-labore */}
      {showProlabore && (
        <div className="fixed inset-0 z-50 bg-zinc-950/90 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 w-full max-w-sm flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-white">Lançar Pró-labore</h3>
              <button onClick={() => setShowProlabore(false)} className="p-2 bg-zinc-800 rounded-xl">
                <X className="w-4 h-4 text-zinc-400" />
              </button>
            </div>
            <p className="text-sm text-zinc-400">Mês de referência: <span className="text-white font-bold">{mesLabel(filtroMes)}</span></p>
            <input type="number" inputMode="decimal" placeholder="Valor em R$" value={valorProlabore}
              onChange={e => setValorProlabore(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white text-xl font-black focus:outline-none focus:border-emerald-500" />
            <button onClick={confirmarProlabore}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95">
              <DollarSign className="w-5 h-5" /> Adicionar receita
            </button>
          </div>
        </div>
      )}

      {/* modal impressão */}
      {showImpressao && (
        <ModalImpressao
          lancamentos={lancamentos}
          filtroMes={filtroMes}
          filtroTipo={filtroTipo}
          filtroStatus={filtroStatus}
          onFechar={() => setShowImpressao(false)}
        />
      )}

      {/* modal lançamento */}
      {showModal && (
        <ModalLancamento editando={editando} filtroMes={filtroMes}
          onSalvar={adicionarLancamento} onAtualizar={atualizarLancamento} onFechar={fecharModal} />
      )}

      {/* modal cartão */}
      {showModalCartao && (
        <ModalCartao
          editando={editandoCartao}
          onSalvar={adicionarCartao}
          onAtualizar={atualizarCartao}
          onFechar={() => { setShowModalCartao(false); setEditandoCartao(null) }}
        />
      )}
    </div>
  )
}

