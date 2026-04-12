'use client'
import { useState } from 'react'
import { X, Save } from 'lucide-react'
import {
  CATEGORIAS_RECEITA, CATEGORIAS_DESPESA,
  type Lancamento, type LancamentoTipo, type LancamentoStatus,
  type LancamentoCategoria, type Periodicidade,
} from '@/hooks/useFinanceiroPessoal'

const TIPO_LABEL: Record<LancamentoTipo, string> = {
  receita: 'Receita',
  despesa: 'Despesa',
  fatura:  'Fatura',
}

interface ModalLancamentoProps {
  editando: Lancamento | null
  filtroMes: string
  onSalvar: (dados: Omit<Lancamento, 'id' | 'criadoEm' | 'atualizadoEm'>) => void
  onAtualizar: (id: string, dados: Partial<Lancamento>) => void
  onFechar: () => void
}

export default function ModalLancamento({ editando, filtroMes, onSalvar, onAtualizar, onFechar }: ModalLancamentoProps) {
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
        <div className="flex items-center justify-between p-5 border-b border-zinc-800">
          <h2 className="text-xl font-black text-white">
            {editando ? 'Editar Lançamento' : 'Novo Lançamento'}
          </h2>
          <button onClick={onFechar} className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700">
            <X className="w-5 h-5 text-zinc-400" />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-4">
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

          <div>
            <label className="text-xs font-bold text-zinc-500 mb-1 block">DESCRIÇÃO</label>
            <input
              value={descricao}
              onChange={e => setDescricao(e.target.value)}
              placeholder="Ex: Aluguel, Plano de saúde..."
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white text-base focus:outline-none focus:border-indigo-500"
            />
          </div>

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
