'use client'
import { useState } from 'react'
import { Edit3, Trash2 } from 'lucide-react'
import { type Cartao, type BandeiraCartao } from '@/hooks/useFinanceiroPessoal'

const BANDEIRAS: { value: BandeiraCartao; label: string; emoji: string }[] = [
  { value: 'visa',       label: 'Visa',       emoji: '💳' },
  { value: 'mastercard', label: 'Mastercard', emoji: '🔴' },
  { value: 'elo',        label: 'Elo',        emoji: '🟡' },
  { value: 'amex',       label: 'Amex',       emoji: '🔵' },
  { value: 'hipercard',  label: 'Hipercard',  emoji: '🔶' },
  { value: 'outro',      label: 'Outro',      emoji: '💳' },
]

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

interface CartaoCardProps {
  c: Cartao
  onEditar: () => void
  onRemover: () => void
}

export default function CartaoCard({ c, onEditar, onRemover }: CartaoCardProps) {
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
