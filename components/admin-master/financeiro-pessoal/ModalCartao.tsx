'use client'
import { useState } from 'react'
import { X, Save } from 'lucide-react'
import {
  type Cartao, type BandeiraCartao,
} from '@/hooks/useFinanceiroPessoal'

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

export default function ModalCartao({ editando, onSalvar, onAtualizar, onFechar }: ModalCartaoProps) {
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
