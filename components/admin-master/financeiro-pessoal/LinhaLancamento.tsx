'use client'
import { useState } from 'react'
import { RefreshCw, CheckCircle2, Trash2, Edit3, RotateCcw } from 'lucide-react'
import {
  CATEGORIAS_RECEITA, CATEGORIAS_DESPESA,
  type Lancamento, type LancamentoStatus,
} from '@/hooks/useFinanceiroPessoal'

const STATUS_LABEL: Record<LancamentoStatus, { label: string; cls: string }> = {
  pendente:  { label: 'Pendente',  cls: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
  pago:      { label: 'Pago',      cls: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
  atrasado:  { label: 'Atrasado',  cls: 'bg-red-500/20 text-red-300 border-red-500/30' },
  cancelado: { label: 'Cancelado', cls: 'bg-zinc-700/40 text-zinc-500 border-zinc-700' },
}

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

interface LinhaLancamentoProps {
  l: Lancamento
  onPago: () => void
  onEditar: () => void
  onRemover: () => void
  onRemoverGrupo: () => void
}

export default function LinhaLancamento({ l, onPago, onEditar, onRemover, onRemoverGrupo }: LinhaLancamentoProps) {
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
                <RotateCcw className="w-4 h-4" /> Remover serie
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
