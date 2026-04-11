'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft, CheckCircle2, Zap, MapPin,
  Lock, Loader2, ShieldCheck, Users, Phone,
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
  avulsos?: { label: string; valor: string }[]
}

const PLANOS: Plano[] = [
  {
    id: 'gratuito',
    nome: 'Grátis',
    preco: 'R$ 0',
    precoNum: 0,
    descricao: 'Acesso básico à plataforma',
    cor: 'border-zinc-700',
    icone: <Users className="w-5 h-5 text-zinc-400" />,
    destaque: false,
    beneficios: [
      'Consultas inteligentes na cidade base (livre)',
      'Desbloqueio de contatos por uso (valor configurável)',
      'Carteira e indicações',
      'Acesso a ofertas locais',
    ],
    avulsos: [
      { label: 'Desbloquear contato de 1 resultado', valor: 'R$ 1,00 (mín.)' },
    ],
  },
  {
    id: 'cidades',
    nome: 'Multi-Cidade',
    preco: 'R$ 29,90/mês',
    precoNum: 29.9,
    descricao: 'Consultas inteligentes em cidades adicionais',
    cor: 'border-blue-500/40',
    icone: <MapPin className="w-5 h-5 text-blue-400" />,
    destaque: true,
    beneficios: [
      'Tudo do plano Grátis',
      'Consultas inteligentes em qualquer cidade desbloqueada',
      'Histórico de buscas salvo',
      'Prioridade nos resultados',
    ],
    avulsos: [
      { label: 'Desbloquear contato de 1 resultado', valor: 'R$ 1,00 (mín.)' },
    ],
  },
]

const PLANO_ATUAL = 'gratuito'

export default function UsuarioPlanosPage() {
  const [assinando, setAssinando] = useState<string | null>(null)
  const [assinado, setAssinado] = useState<string | null>(null)

  async function handleAssinar(planoId: string) {
    if (planoId === 'gratuito') return
    setAssinando(planoId)
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
          href="/"
          className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 transition-all flex-shrink-0"
        >
          <ArrowLeft className="w-4 h-4 text-zinc-400" />
        </Link>
        <div>
          <h1 className="text-lg font-black text-white leading-none">Planos</h1>
          <p className="text-sm text-zinc-500">Usuário Geral</p>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pt-6 space-y-4">

        {/* Plano atual */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <div>
            <p className="text-base font-black text-white leading-none">
              Plano atual: <span className="text-emerald-400 capitalize">{planoAtivo === 'gratuito' ? 'Grátis' : 'Multi-Cidade'}</span>
            </p>
            <p className="text-sm text-zinc-500 mt-0.5">
              {planoAtivo === 'gratuito'
                ? 'Sua cidade base está liberada gratuitamente'
                : 'Consultas em múltiplas cidades ativas'}
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
                plano.destaque ? plano.cor + ' shadow-lg shadow-blue-500/10' : plano.cor
              } ${ativo ? 'ring-2 ring-emerald-500/40' : ''}`}
            >
              {plano.destaque && (
                <div className="bg-blue-600 text-white text-sm font-black uppercase text-center py-1.5 tracking-widest">
                  Recomendado
                </div>
              )}

              <div className="p-5 space-y-4">
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

                <ul className="space-y-2">
                  {plano.beneficios.map((b, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className={`w-4 h-4 flex-shrink-0 mt-0.5 ${plano.destaque ? 'text-blue-400' : 'text-zinc-500'}`} />
                      <span className="text-base text-zinc-300">{b}</span>
                    </li>
                  ))}
                </ul>

                {/* Cobranças avulsas */}
                {plano.avulsos && (
                  <div className="bg-zinc-800 rounded-xl p-3 space-y-1.5">
                    <p className="text-xs font-black text-zinc-500 uppercase tracking-widest">Cobrança por uso</p>
                    {plano.avulsos.map((a, i) => (
                      <div key={i} className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" />
                          <span className="text-sm text-zinc-400">{a.label}</span>
                        </div>
                        <span className="text-sm font-black text-white">{a.valor}</span>
                      </div>
                    ))}
                  </div>
                )}

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
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-black uppercase text-base transition-all disabled:opacity-50 bg-blue-600 hover:bg-blue-500 text-white"
                  >
                    {carregando
                      ? <><Loader2 className="w-4 h-4 animate-spin" /> Processando...</>
                      : <><Zap className="w-4 h-4" /> Assinar Multi-Cidade</>
                    }
                  </button>
                )}
              </div>
            </div>
          )
        })}

      </main>
    </div>
  )
}
