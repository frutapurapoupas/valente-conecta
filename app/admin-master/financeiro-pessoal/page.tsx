'use client'
import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft, Plus, TrendingUp, TrendingDown, Wallet, AlertCircle, Clock,
  ChevronLeft, ChevronRight, CheckCircle2, Trash2, Edit3, RefreshCw,
  CreditCard, RotateCcw, X, Save, DollarSign, Bell, Star, Zap,
} from 'lucide-react'
import {
  useFinanceiroPessoal,
  CATEGORIAS_RECEITA, CATEGORIAS_DESPESA,
  type Lancamento, type LancamentoTipo, type LancamentoStatus,
  type LancamentoCategoria, type Periodicidade,
  type Cartao, type BandeiraCartao, type AlertaCartao,
} from '@/hooks/useFinanceiroPessoal'

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

// ─── Modal de lançamento ───────────────────────────────────────────────────────

interface ModalProps {
  editando: Lancamento | null
  filtroMes: string
  onSalvar: (dados: Omit<Lancamento, 'id' | 'criadoEm' | 'atualizadoEm'>) => void
  onAtualizar: (id: string, dados: Partial<Lancamento>) => void
  onFechar: () => void
}

function ModalLancamento({ editando, filtroMes, onSalvar, onAtualizar, onFechar }: ModalProps) {
  const [tipo, setTipo] = useState<LancamentoTipo>(editando?.tipo ?? 'despesa')
  const [descricao, setDescricao] = useState(editando?.descricao ?? '')
  const [valor, setValor] = useState(editando ? String(editando.valor) : '')
  const [categoria, setCategoria] = useState<LancamentoCategoria>(editando?.categoria ?? 'outros_despesa')
  const [vencimento, setVencimento] = useState(editando?.vencimento ?? filtroMes + '-10')
  const [status, setStatus] = useState<LancamentoStatus>(editando?.status ?? 'pendente')
  const [recorrente, setRecorrente] = useState(editando?.recorrente ?? false)
  const [periodos, setPeriodos] = useState(editando?.periodos ?? 1)
  const [periodicidade, setPeriodicidade] = useState<Periodicidade>(editando?.periodicidade ?? 'mensal')
  const [observacoes, setObservacoes] = useState(editando?.observacoes ?? '')

  const categorias = tipo === 'receita' ? CATEGORIAS_RECEITA : CATEGORIAS_DESPESA

  function salvar() {
    const v = parseFloat(valor.replace(',', '.'))
    if (!descricao.trim() || isNaN(v) || v <= 0) return

    if (editando) {
      onAtualizar(editando.id, { tipo, descricao, valor: v, categoria, vencimento, status, observacoes })
    } else {
      onSalvar({ tipo, descricao, valor: v, categoria, vencimento, status, recorrente, periodos, periodicidade, observacoes })
    }
    onFechar()
  }

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/95 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-t-3xl sm:rounded-2xl w-full max-w-md max-h-[92vh] overflow-y-auto">
        {/* header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-800">
          <h2 className="text-xl font-black text-white">
            {editando ? 'Editar Lançamento' : 'Novo Lançamento'}
          </h2>
          <button onClick={onFechar} className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700">
            <X className="w-5 h-5 text-zinc-400" />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-4">
          {/* tipo */}
          <div className="grid grid-cols-3 gap-2">
            {(['receita', 'despesa', 'fatura'] as LancamentoTipo[]).map(t => (
              <button
                key={t}
                onClick={() => {
                  setTipo(t)
                  setCategoria(t === 'receita' ? 'outros_receita' : 'outros_despesa')
                }}
                className={`py-2 rounded-xl font-bold text-sm capitalize transition-all border ${
                  tipo === t
                    ? t === 'receita'
                      ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                      : t === 'fatura'
                      ? 'bg-violet-500/20 border-violet-500/50 text-violet-300'
                      : 'bg-red-500/20 border-red-500/50 text-red-300'
                    : 'bg-zinc-800 border-zinc-700 text-zinc-400'
                }`}
              >
                {TIPO_LABEL[t]}
              </button>
            ))}
          </div>

          {/* descricao */}
          <div>
            <label className="text-xs font-bold text-zinc-500 mb-1 block">DESCRIÇÃO</label>
            <input
              value={descricao}
              onChange={e => setDescricao(e.target.value)}
              placeholder="Ex: Aluguel, Plano de saúde..."
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white text-base focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* valor + vencimento */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-zinc-500 mb-1 block">VALOR (R$)</label>
              <input
                type="number"
                inputMode="decimal"
                value={valor}
                onChange={e => setValor(e.target.value)}
                placeholder="0,00"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white text-base focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-zinc-500 mb-1 block">VENCIMENTO</label>
              <input
                type="date"
                value={vencimento}
                onChange={e => setVencimento(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white text-base focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* categoria */}
          <div>
            <label className="text-xs font-bold text-zinc-500 mb-1 block">CATEGORIA</label>
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
              {categorias.map(c => (
                <button
                  key={c.value}
                  onClick={() => setCategoria(c.value)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold border transition-all text-left ${
                    categoria === c.value
                      ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300'
                      : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-600'
                  }`}
                >
                  <span>{c.emoji}</span>
                  <span className="truncate">{c.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* status */}
          <div>
            <label className="text-xs font-bold text-zinc-500 mb-1 block">STATUS</label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value as LancamentoStatus)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white text-base focus:outline-none focus:border-indigo-500"
            >
              <option value="pendente">Pendente</option>
              <option value="pago">Pago</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>

          {/* recorrência — só em novo */}
          {!editando && (
            <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-white text-sm">Lançamento recorrente</p>
                  <p className="text-xs text-zinc-500">Repete automaticamente</p>
                </div>
                <button
                  onClick={() => setRecorrente(!recorrente)}
                  className={`w-12 h-6 rounded-full transition-all relative ${recorrente ? 'bg-indigo-500' : 'bg-zinc-700'}`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${recorrente ? 'left-6' : 'left-0.5'}`} />
                </button>
              </div>

              {recorrente && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-zinc-500 mb-1 block">REPETIR POR</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={1}
                        max={60}
                        value={periodos}
                        onChange={e => setPeriodos(Number(e.target.value))}
                        className="w-full bg-zinc-900 border border-zinc-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none"
                      />
                      <span className="text-zinc-500 text-xs whitespace-nowrap">períodos</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-zinc-500 mb-1 block">PERIODICIDADE</label>
                    <select
                      value={periodicidade}
                      onChange={e => setPeriodicidade(e.target.value as Periodicidade)}
                      className="w-full bg-zinc-900 border border-zinc-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none"
                    >
                      <option value="semanal">Semanal</option>
                      <option value="quinzenal">Quinzenal</option>
                      <option value="mensal">Mensal</option>
                      <option value="anual">Anual</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* observações */}
          <div>
            <label className="text-xs font-bold text-zinc-500 mb-1 block">OBSERVAÇÕES (opcional)</label>
            <textarea
              value={observacoes}
              onChange={e => setObservacoes(e.target.value)}
              rows={2}
              placeholder="Detalhes, nº da conta, etc."
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          <button
            onClick={salvar}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-base rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <Save className="w-5 h-5" />
            {editando ? 'Salvar alterações' : 'Adicionar lançamento'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Linha de lançamento ────────────────────────────────────────────────────────

interface LinhaProps {
  l: Lancamento
  onPago: () => void
  onEditar: () => void
  onRemover: () => void
  onRemoverGrupo: () => void
}

function LinhaLancamento({ l, onPago, onEditar, onRemover, onRemoverGrupo }: LinhaProps) {
  const [expandido, setExpandido] = useState(false)
  const cat = [...CATEGORIAS_RECEITA, ...CATEGORIAS_DESPESA].find(c => c.value === l.categoria)
  const s = STATUS_LABEL[l.status]

  return (
    <div
      className={`bg-zinc-900 border rounded-2xl overflow-hidden transition-all ${
        l.status === 'atrasado' ? 'border-red-500/30' :
        l.status === 'pago'     ? 'border-zinc-800' :
        'border-zinc-800 hover:border-zinc-700'
      }`}
    >
      <button onClick={() => setExpandido(!expandido)} className="w-full p-4 flex items-center gap-3 text-left">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
          l.tipo === 'receita' ? 'bg-emerald-500/15' : l.tipo === 'fatura' ? 'bg-violet-500/15' : 'bg-red-500/15'
        }`}>
          <span className="text-lg">{cat?.emoji ?? '📌'}</span>
        </div>

        <div className="flex-1 min-w-0">
          <p className={`font-bold text-sm truncate ${l.status === 'pago' ? 'text-zinc-500' : 'text-white'}`}>
            {l.descricao}
            {l.recorrente && <RefreshCw className="w-3 h-3 inline ml-1 text-zinc-500" />}
          </p>
          <p className="text-xs text-zinc-500">{cat?.label} · {l.vencimento}</p>
        </div>

        <div className="text-right flex-shrink-0">
          <p className={`font-black text-base ${
            l.tipo === 'receita' ? 'text-emerald-400' :
            l.tipo === 'fatura'  ? 'text-violet-400' :
            l.status === 'pago'  ? 'text-zinc-600'   : 'text-red-400'
          }`}>
            {l.tipo === 'receita' ? '+' : '-'}{fmt(l.valor)}
          </p>
          <span className={`text-xs px-2 py-0.5 rounded-full border font-bold ${s.cls}`}>{s.label}</span>
        </div>
      </button>

      {expandido && (
        <div className="border-t border-zinc-800 p-4 flex flex-col gap-3">
          {l.observacoes && (
            <p className="text-sm text-zinc-400 italic">{l.observacoes}</p>
          )}
          {l.recorrente && l.grupoRecorrencia && (
            <p className="text-xs text-indigo-400">
              <RefreshCw className="w-3 h-3 inline mr-1" />
              Recorrente · {l.periodicidade} · grupo vinculado
            </p>
          )}
          <div className="flex gap-2 flex-wrap">
            {l.status !== 'pago' && l.status !== 'cancelado' && (
              <button onClick={onPago} className="flex items-center gap-1.5 px-3 py-2 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 rounded-xl text-sm font-bold hover:bg-emerald-500/25 transition-all">
                <CheckCircle2 className="w-4 h-4" /> Marcar pago
              </button>
            )}
            <button onClick={onEditar} className="flex items-center gap-1.5 px-3 py-2 bg-zinc-800 border border-zinc-700 text-zinc-300 rounded-xl text-sm font-bold hover:border-zinc-600 transition-all">
              <Edit3 className="w-4 h-4" /> Editar
            </button>
            <button onClick={onRemover} className="flex items-center gap-1.5 px-3 py-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm font-bold hover:bg-red-500/20 transition-all">
              <Trash2 className="w-4 h-4" /> Remover
            </button>
            {l.grupoRecorrencia && (
              <button onClick={onRemoverGrupo} className="flex items-center gap-1.5 px-3 py-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm font-bold hover:bg-red-500/20 transition-all">
                <RotateCcw className="w-4 h-4" /> Remover série
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

            <button onClick={onRemover} className="flex items-center gap-1.5 px-3 py-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm font-bold hover:bg-red-500/20 transition-all">
              <Trash2 className="w-4 h-4" /> Remover
            </button>
            {l.grupoRecorrencia && (
              <button onClick={onRemoverGrupo} className="flex items-center gap-1.5 px-3 py-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm font-bold hover:bg-red-500/20 transition-all">
                <RotateCcw className="w-4 h-4" /> Remover série
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Modal de Cartão ──────────────────────────────────────────────────────────

const BANDEIRAS: { value: BandeiraCartao; label: string; emoji: string }[] = [
  { value: 'visa',       label: 'Visa',       emoji: '💳' },
  { value: 'mastercard', label: 'Mastercard', emoji: '🔴' },
  { value: 'elo',        label: 'Elo',        emoji: '🟡' },
  { value: 'amex',       label: 'Amex',       emoji: '🔵' },
  { value: 'hipercard',  label: 'Hipercard',  emoji: '🔶' },
  { value: 'outro',      label: 'Outro',      emoji: '💳' },
]

const CORES_CARTAO = [
  { value: 'from-indigo-800 to-indigo-600',  label: 'Índigo' },
  { value: 'from-violet-800 to-purple-600',  label: 'Roxo' },
  { value: 'from-zinc-800 to-zinc-600',      label: 'Cinza' },
  { value: 'from-emerald-800 to-green-600',  label: 'Verde' },
  { value: 'from-rose-800 to-red-600',       label: 'Vermelho' },
  { value: 'from-amber-700 to-yellow-500',   label: 'Dourado' },
]

interface ModalCartaoProps {
  editando: Cartao | null
  onSalvar: (dados: Omit<Cartao, 'id' | 'melhorDiaCompra' | 'criadoEm' | 'atualizadoEm'>) => void
  onAtualizar: (id: string, dados: Partial<Omit<Cartao, 'id' | 'criadoEm'>>) => void
  onFechar: () => void
}

function ModalCartao({ editando, onSalvar, onAtualizar, onFechar }: ModalCartaoProps) {
  const [apelido, setApelido]           = useState(editando?.apelido ?? '')
  const [bandeira, setBandeira]         = useState<BandeiraCartao>(editando?.bandeira ?? 'visa')
  const [ultimos4, setUltimos4]         = useState(editando?.ultimos4 ?? '')
  const [limite, setLimite]             = useState(editando ? String(editando.limite) : '')
  const [diaVencimento, setDiaVenc]     = useState(editando ? String(editando.diaVencimento) : '')
  const [cor, setCor]                   = useState(editando?.cor ?? CORES_CARTAO[0].value)

  const melhorDia = (() => {
    const d = parseInt(diaVencimento)
    if (isNaN(d)) return '—'
    return d > 10 ? d - 10 : d + 20
  })()

  function salvar() {
    const lim = parseFloat(limite.replace(',', '.'))
    const dia = parseInt(diaVencimento)
    if (!apelido.trim() || isNaN(lim) || isNaN(dia) || dia < 1 || dia > 31) return
    const dados = { apelido, bandeira, ultimos4, limite: lim, diaVencimento: dia, cor }
    if (editando) onAtualizar(editando.id, dados)
    else onSalvar(dados)
    onFechar()
  }

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/95 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-t-3xl sm:rounded-2xl w-full max-w-md max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-zinc-800">
          <h2 className="text-xl font-black text-white">{editando ? 'Editar Cartão' : 'Novo Cartão'}</h2>
          <button onClick={onFechar} className="p-2 rounded-xl bg-zinc-800"><X className="w-5 h-5 text-zinc-400" /></button>
        </div>

        <div className="p-5 flex flex-col gap-4">
          {/* preview */}
          <div className={`bg-gradient-to-br ${cor} rounded-2xl p-5 flex flex-col gap-3 h-36 relative overflow-hidden`}>
            <div className="flex items-center justify-between">
              <p className="font-black text-white text-lg">{apelido || 'Apelido do cartão'}</p>
              <span className="text-2xl">{BANDEIRAS.find(b => b.value === bandeira)?.emoji}</span>
            </div>
            <p className="text-white/60 text-sm font-mono tracking-widest">•••• •••• •••• {ultimos4 || '????'}</p>
            <div className="flex gap-4 text-xs text-white/60 font-bold">
              <span>Vence dia {diaVencimento || '—'}</span>
              <span>·</span>
              <span>Melhor compra dia {melhorDia}</span>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-500 mb-1 block">APELIDO</label>
            <input value={apelido} onChange={e => setApelido(e.target.value)} placeholder="Ex: Nubank principal"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white text-base focus:outline-none focus:border-indigo-500" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-zinc-500 mb-1 block">ÚLTIMOS 4 DÍGITOS</label>
              <input value={ultimos4} onChange={e => setUltimos4(e.target.value.slice(0, 4))} placeholder="0000" maxLength={4}
                inputMode="numeric"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white text-base font-mono focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="text-xs font-bold text-zinc-500 mb-1 block">LIMITE (R$)</label>
              <input type="number" value={limite} onChange={e => setLimite(e.target.value)} placeholder="0,00"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white text-base focus:outline-none focus:border-indigo-500" />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-500 mb-1 block">DIA DE VENCIMENTO DA FATURA</label>
            <input type="number" min={1} max={31} value={diaVencimento} onChange={e => setDiaVenc(e.target.value)} placeholder="Ex: 10"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white text-base focus:outline-none focus:border-indigo-500" />
            {diaVencimento && (
              <p className="text-xs text-indigo-400 mt-1 font-bold">
                ✨ Melhor dia para comprar: dia {melhorDia}
              </p>
            )}
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-500 mb-2 block">BANDEIRA</label>
            <div className="grid grid-cols-3 gap-2">
              {BANDEIRAS.map(b => (
                <button key={b.value} onClick={() => setBandeira(b.value)}
                  className={`py-2 rounded-xl font-bold text-sm border transition-all flex items-center justify-center gap-1.5 ${bandeira === b.value ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300' : 'bg-zinc-800 border-zinc-700 text-zinc-400'}`}>
                  <span>{b.emoji}</span> {b.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-500 mb-2 block">COR DO CARTÃO</label>
            <div className="flex gap-2 flex-wrap">
              {CORES_CARTAO.map(c => (
                <button key={c.value} onClick={() => setCor(c.value)}
                  className={`w-10 h-10 rounded-xl bg-gradient-to-br ${c.value} border-2 transition-all ${cor === c.value ? 'border-white scale-110' : 'border-transparent'}`} title={c.label} />
              ))}
            </div>
          </div>

          <button onClick={salvar}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-base rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95">
            <Save className="w-5 h-5" />
            {editando ? 'Salvar alterações' : 'Adicionar cartão'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Card visual de cartão ────────────────────────────────────────────────────

function CartaoCard({ c, onEditar, onRemover }: { c: Cartao; onEditar: () => void; onRemover: () => void }) {
  const [expandido, setExpandido] = useState(false)
  const hoje = new Date().getDate()
  const bnd = BANDEIRAS.find(b => b.value === c.bandeira)

  return (
    <div className="flex flex-col rounded-2xl overflow-hidden">
      <button onClick={() => setExpandido(!expandido)}
        className={`bg-gradient-to-br ${c.cor} p-5 flex flex-col gap-3 h-36 relative text-left`}>
        <div className="flex items-center justify-between">
          <p className="font-black text-white text-lg">{c.apelido}</p>
          <span className="text-2xl">{bnd?.emoji}</span>
        </div>
        <p className="text-white/60 text-sm font-mono tracking-widest">•••• •••• •••• {c.ultimos4}</p>
        <div className="flex gap-4 text-xs font-bold">
          <span className={`px-2 py-0.5 rounded-full ${hoje === c.melhorDiaCompra ? 'bg-emerald-500 text-white' : 'text-white/60'}`}>
            {hoje === c.melhorDiaCompra ? '⭐ Melhor dia hoje!' : `Melhor compra: dia ${c.melhorDiaCompra}`}
          </span>
          <span className="text-white/60">Vence: dia {c.diaVencimento}</span>
        </div>
      </button>

      {expandido && (
        <div className="bg-zinc-900 border border-t-0 border-zinc-700 rounded-b-2xl p-4 flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-zinc-800 rounded-xl p-3">
              <p className="text-zinc-500 text-xs font-bold">LIMITE</p>
              <p className="text-white font-black">{fmt(c.limite)}</p>
            </div>
            <div className="bg-zinc-800 rounded-xl p-3">
              <p className="text-zinc-500 text-xs font-bold">BANDEIRA</p>
              <p className="text-white font-black">{bnd?.label}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={onEditar} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-zinc-800 border border-zinc-700 text-zinc-300 rounded-xl text-sm font-bold hover:border-zinc-600">
              <Edit3 className="w-4 h-4" /> Editar
            </button>
            <button onClick={onRemover} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm font-bold hover:bg-red-500/20">
              <Trash2 className="w-4 h-4" /> Remover
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Alerta de cartão ─────────────────────────────────────────────────────────

function BannerAlerta({ alerta }: { alerta: AlertaCartao }) {
  const cls = {
    info:    'bg-indigo-500/15 border-indigo-500/30 text-indigo-300',
    aviso:   'bg-amber-500/15 border-amber-500/30 text-amber-300',
    critico: 'bg-red-500/15 border-red-500/30 text-red-300',
  }[alerta.urgencia]

  const icon = {
    melhor_dia:      <Star className="w-4 h-4 flex-shrink-0" />,
    fatura_proxima:  <Clock className="w-4 h-4 flex-shrink-0" />,
    fatura_hoje:     <Zap className="w-4 h-4 flex-shrink-0" />,
    fatura_atrasada: <AlertCircle className="w-4 h-4 flex-shrink-0" />,
  }[alerta.tipo]

  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-bold ${cls}`}>
      {icon}
      <span>{alerta.mensagem}</span>
    </div>
  )
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function FinanceiroPessoal() {
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
          {alertasCartoes.map((a, i) => <BannerAlerta key={i} alerta={a} />)}
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

            {/* filtros */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
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
