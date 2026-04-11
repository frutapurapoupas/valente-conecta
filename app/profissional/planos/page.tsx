'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft, CheckCircle2, Zap, Crown, Star,
  Lock, Loader2, ShieldCheck,
} from 'lucide-react'

interface Plano {
  id: string
  nome: string
  preco: string
  precoNum: number
  descricao: string
  cor: string
  icone: React.ReactNode
  destaque: boolean
  beneficios: string[]
}

const PLANOS: Plano[] = [
  {
    id: 'gratuito',
    nome: 'Grátis',
    preco: 'R$ 0',
    precoNum: 0,
    descricao: 'Para começar a mostrar seu trabalho',
    cor: 'border-zinc-700',
    icone: <Star className="w-5 h-5 text-zinc-400" />,
    destaque: false,
    beneficios: [
      'Perfil público básico',
      'Até 3 serviços no catálogo',
      'Foto por serviço',
      'Preços visíveis apenas para quem pagar desbloqueio',
      'Sem contatos visíveis',
    ],
  },
  {
    id: 'basico',
    nome: 'Básico',
    preco: 'R$ 29,90/mês',
    precoNum: 29.9,
    descricao: 'Ideal para profissionais autônomos',
    cor: 'border-violet-500/40',
    icone: <Zap className="w-5 h-5 text-violet-400" />,
    destaque: true,
    beneficios: [
      'Tudo do plano Grátis',
      'Até 20 serviços/produtos no catálogo',
      'Preços visíveis para todos',
      'Telefone e e-mail visíveis',
      'Badge "Verificado ✓" no perfil',
      'Prioridade na busca',
    ],
  },
  {
    id: 'premium',
    nome: 'Premium',
    preco: 'R$ 59,90/mês',
    precoNum: 59.9,
    descricao: 'Para profissionais que querem crescer',
    cor: 'border-yellow-500/40',
    icone: <Crown className="w-5 h-5 text-yellow-400" />,
    destaque: false,
    beneficios: [
      'Tudo do plano Básico',
      'Catálogo ilimitado',
      'Posição de destaque na busca',
      'Relatórios de visitas ao perfil',
      'Suporte prioritário',
      'Link personalizado do perfil',
    ],
  },
]

// Plano ativo do profissional logado (em produção viria do contexto de auth)
const PLANO_ATUAL = 'gratuito'

export default function PlanosPage() {
  const [assinando, setAssinando] = useState<string | null>(null)
  const [assinado, setAssinado] = useState<string | null>(null)

  async function handleAssinar(planoId: string) {
    if (planoId === 'gratuito') return
    setAssinando(planoId)
    // TODO: integrar gateway de pagamento
    await new Promise(r => setTimeout(r, 1500))
    setAssinando(null)
    setAssinado(planoId)
  }

  const planoAtivo = assinado ?? PLANO_ATUAL

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans pb-24">

      {/* HEADER */}
      <header className="sticky top-0 z-30 bg-zinc-950/95 backdrop-blur border-b border-zinc-900 px-4 py-3 flex items-center gap-3">
        <Link
          href="/profissional/meu-catalogo"
          className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 transition-all flex-shrink-0"
        >
          <ArrowLeft className="w-4 h-4 text-zinc-400" />
        </Link>
        <div>
          <h1 className="text-lg font-black text-white leading-none">Planos</h1>
          <p className="text-sm text-zinc-500">Escolha o plano ideal para você</p>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pt-6 space-y-4">

        {/* Plano atual */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <div>
            <p className="text-base font-black text-white leading-none">
              Plano atual: <span className="text-emerald-400 capitalize">{planoAtivo}</span>
            </p>
            <p className="text-sm text-zinc-500 mt-0.5">
              {planoAtivo === 'gratuito'
                ? 'Faça upgrade para liberar contatos e crescer mais'
                : 'Seu plano está ativo e funcionando'}
            </p>
          </div>
        </div>

        {/* Cards de plano */}
        {PLANOS.map(plano => {
          const ativo = planoAtivo === plano.id
          const carregando = assinando === plano.id
          const concluido = assinado === plano.id

          return (
            <div
              key={plano.id}
              className={`bg-zinc-900 border-2 rounded-2xl overflow-hidden transition-all ${
                plano.destaque ? plano.cor + ' shadow-lg shadow-violet-500/10' : plano.cor
              } ${ativo ? 'ring-2 ring-emerald-500/40' : ''}`}
            >
              {plano.destaque && (
                <div className="bg-violet-600 text-white text-sm font-black uppercase text-center py-1.5 tracking-widest">
                  Mais popular
                </div>
              )}

              <div className="p-5 space-y-4">
                {/* Nome + preço */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center flex-shrink-0">
                      {plano.icone}
                    </div>
                    <div>
                      <p className="text-lg font-black text-white leading-none">{plano.nome}</p>
                      <p className="text-sm text-zinc-500 mt-0.5">{plano.descricao}</p>
                    </div>
                  </div>
                  <p className="text-xl font-black text-white flex-shrink-0 text-right leading-tight">{plano.preco}</p>
                </div>

                {/* Benefícios */}
                <ul className="space-y-2">
                  {plano.beneficios.map((b, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className={`w-4 h-4 flex-shrink-0 mt-0.5 ${plano.destaque ? 'text-violet-400' : plano.id === 'premium' ? 'text-yellow-400' : 'text-zinc-500'}`} />
                      <span className="text-base text-zinc-300">{b}</span>
                    </li>
                  ))}
                </ul>

                {/* Botão */}
                {ativo ? (
                  <div className="flex items-center justify-center gap-2 bg-emerald-500/15 text-emerald-400 py-3 rounded-xl font-black uppercase text-base">
                    <CheckCircle2 className="w-4 h-4" /> Plano atual
                  </div>
                ) : concluido ? (
                  <div className="flex items-center justify-center gap-2 bg-emerald-500/15 text-emerald-400 py-3 rounded-xl font-black uppercase text-base">
                    <CheckCircle2 className="w-4 h-4" /> Assinado!
                  </div>
                ) : plano.id === 'gratuito' ? (
                  <div className="flex items-center justify-center gap-2 bg-zinc-800 text-zinc-600 py-3 rounded-xl font-black uppercase text-base cursor-default">
                    <Lock className="w-4 h-4" /> Plano gratuito
                  </div>
                ) : (
                  <button
                    onClick={() => handleAssinar(plano.id)}
                    disabled={!!assinando}
                    className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-black uppercase text-base transition-all disabled:opacity-50 ${
                      plano.destaque
                        ? 'bg-violet-600 hover:bg-violet-500 text-white'
                        : 'bg-yellow-500 hover:bg-yellow-400 text-black'
                    }`}
                  >
                    {carregando
                      ? <><Loader2 className="w-4 h-4 animate-spin" /> Processando...</>
                      : <><Zap className="w-4 h-4" /> Assinar {plano.nome}</>
                    }
                  </button>
                )}
              </div>
            </div>
          )
        })}

        <p className="text-center text-sm text-zinc-600 pb-4">
          Pagamento seguro. Cancele quando quiser.
        </p>
      </main>
    </div>
  )
}
