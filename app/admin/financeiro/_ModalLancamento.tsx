'use client'
import { useState, useEffect } from 'react'
import { X, Plus } from 'lucide-react'
import type {
  Lancamento, VisaoCaixa, TipoLancamento,
  CategoriaLancamento, StatusLancamento,
} from '@/hooks/useControleCaixa'
import {
  CIDADES, CATEGORIAS_RECEITA, CATEGORIAS_DESPESA, CATEGORIA_LABEL,
} from '@/hooks/useControleCaixa'

interface Props {
  visaoAtual:  VisaoCaixa
  onSalvar: (l: Omit<Lancamento, 'id'>) => void
  onFechar: () => void
}

const INICIAL = {
  visoes:           ['DREX'] as VisaoCaixa[],  // sobrescrito no useState
  tipo:             'DESPESA' as TipoLancamento,
  categoria:        'OPERACIONAL' as CategoriaLancamento,
  numeroDocumento:   '',
  descricao:        '',
  valor:            '',
  data:             new Date().toISOString().slice(0, 10),
  vencimento:       5,
  status:           'PENDENTE' as StatusLancamento,
  recorrencia:      1,
  cidade:           '',
  plano:            '',
  observacao:       '',
}

export default function ModalLancamento({ visaoAtual, onSalvar, onFechar }: Props) {
  const [form, setForm] = useState(() => ({ ...INICIAL, visoes: [visaoAtual] as VisaoCaixa[] }))

  const set = (k: keyof typeof INICIAL, v: unknown) =>
    setForm(prev => ({ ...prev, [k]: v }))

  // Reset categoria when tipo changes
  useEffect(() => {
    set('categoria', form.tipo === 'RECEITA' ? 'ASSINATURA' : 'OPERACIONAL')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.tipo])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const categorias = form.tipo === 'RECEITA' ? CATEGORIAS_RECEITA : CATEGORIAS_DESPESA

  function handleSalvar() {
    if (!form.descricao.trim() || !form.valor) return
    onSalvar({
      visoes:            form.visoes,
      tipo:              form.tipo,
      categoria:         form.categoria,
      numeroDocumento:   form.numeroDocumento.trim()   || undefined,
      descricao:         form.descricao.trim(),
      valor:             parseFloat(String(form.valor).replace(',', '.')),
      data:              form.data,
      vencimento:        Number(form.vencimento),
      status:            form.status,
      recorrencia:       form.recorrencia,
      cidade:            form.cidade     || undefined,
      plano:             form.plano      || undefined,
      observacao:        form.observacao || undefined,
    })
  }

  const inputCls = 'w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-[28px] text-white placeholder:text-zinc-600 focus:border-violet-500 outline-none transition'
  const labelCls = 'block text-[20px] font-black uppercase tracking-wider text-zinc-500 mb-1'

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="flex min-h-full items-start justify-center p-4 py-8">
      <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Plus className="w-4 h-4 text-violet-400" />
            <h2 className="font-black text-[28px] text-white uppercase tracking-wide">Novo Lançamento</h2>
          </div>
          <button onClick={onFechar} className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-white transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          {/* Visão + Tipo */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Visão</label>
              <div className="flex gap-2">
                {(['DREX','SISTEMA'] as VisaoCaixa[]).map(v => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => set('visoes', [v])}
                    className={`flex-1 py-2 rounded-xl text-2xl font-black uppercase transition border ${
                      form.visoes[0] === v
                        ? v === 'DREX'
                          ? 'bg-violet-600/30 border-violet-500 text-violet-300'
                          : 'bg-cyan-600/30 border-cyan-500 text-cyan-300'
                        : 'bg-zinc-800 border-zinc-700 text-zinc-600 hover:border-zinc-600'
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className={labelCls}>Tipo</label>
              <div className="flex gap-2">
                <button type="button" onClick={() => set('tipo','RECEITA')}
                  className={`flex-1 py-2 rounded-xl text-2xl font-black uppercase transition border ${
                    form.tipo === 'RECEITA' ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300' : 'bg-zinc-800 border-zinc-700 text-zinc-600 hover:border-zinc-600'
                  }`}>Receita</button>
                <button type="button" onClick={() => set('tipo','DESPESA')}
                  className={`flex-1 py-2 rounded-xl text-2xl font-black uppercase transition border ${
                    form.tipo === 'DESPESA' ? 'bg-red-600/20 border-red-500 text-red-300' : 'bg-zinc-800 border-zinc-700 text-zinc-600 hover:border-zinc-600'
                  }`}>Despesa</button>
              </div>
            </div>
          </div>

          {/* Categoria */}
          <div>
            <label className={labelCls}>Categoria</label>
            <select value={form.categoria} onChange={e => set('categoria', e.target.value as CategoriaLancamento)}
              className={inputCls}>
              {categorias.map(c => (
                <option key={c} value={c}>{CATEGORIA_LABEL[c]}</option>
              ))}
            </select>
          </div>

          {/* Descrição */}
          <div>
            <label className={labelCls}>Descrição</label>
            <input placeholder="Ex: Assinaturas Ouro — Uberlândia" value={form.descricao}
              onChange={e => set('descricao', e.target.value)}
              className={inputCls} />
          </div>

          {/* Valor + Nº Documento */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Valor (R$)</label>
              <input type="number" step="0.01" min="0" placeholder="0,00" value={form.valor}
                onChange={e => set('valor', e.target.value)}
                className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Nº Documento</label>
              <input placeholder="NF, boleto, contrato…" value={form.numeroDocumento}
                onChange={e => set('numeroDocumento', e.target.value)}
                className={inputCls} />
            </div>
          </div>

          {/* Dia Vencimento inline */}
          <div>
            <label className={labelCls}>Dia de Vencimento</label>
            <input type="number" min="1" max="31" value={form.vencimento}
              onChange={e => set('vencimento', e.target.value)}
              className={inputCls} />
          </div>

          {/* Data + Recorrência */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Data</label>
              <input type="date" value={form.data}
                onChange={e => set('data', e.target.value)}
                className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Recorrência (qtd.)</label>
              <div className="relative">
                <input
                  type="number" min="0" placeholder="0"
                  value={form.recorrencia}
                  onChange={e => set('recorrencia', Math.max(0, Number(e.target.value)))}
                  className={inputCls + ' pr-24'}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-2xl text-zinc-500 pointer-events-none select-none">
                  {form.recorrencia === 0 ? '∞ contínua' : form.recorrencia === 1 ? '1× única' : `${form.recorrencia}× parcelas`}
                </span>
              </div>
            </div>
          </div>

          {/* Status + Cidade */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Status</label>
              <select value={form.status} onChange={e => set('status', e.target.value as StatusLancamento)}
                className={inputCls}>
                <option value="PENDENTE">Pendente</option>
                <option value="PAGO">Pago / Recebido</option>
                <option value="ATRASADO">Atrasado</option>
                <option value="CANCELADO">Cancelado</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Cidade (opcional)</label>
              <select value={form.cidade} onChange={e => set('cidade', e.target.value)}
                className={inputCls}>
                <option value="">Geral / Todas</option>
                {CIDADES.slice(1).map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Plano (optional) */}
          {form.categoria === 'ASSINATURA' && (
            <div>
              <label className={labelCls}>Plano</label>
              <select value={form.plano} onChange={e => set('plano', e.target.value)}
                className={inputCls}>
                <option value="">Selecionar…</option>
                <option value="Ouro">Ouro</option>
                <option value="Prata">Prata</option>
                <option value="Bronze">Bronze</option>
              </select>
            </div>
          )}

          {/* Observação */}
          <div>
            <label className={labelCls}>Observação (opcional)</label>
            <textarea rows={2} placeholder="Notas internas…" value={form.observacao}
              onChange={e => set('observacao', e.target.value)}
              className={inputCls + ' resize-none'} />
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 pb-5 pt-2 flex gap-3 border-t border-zinc-800">
          <button onClick={onFechar}
            className="flex-1 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 text-[28px] font-bold transition">
            Cancelar
          </button>
          <button onClick={handleSalvar}
            disabled={!form.descricao.trim() || !form.valor}
            className="flex-1 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white text-[28px] font-black uppercase transition">
            Salvar Lançamento
          </button>
        </div>
      </div>
      </div>
    </div>
  )
}
