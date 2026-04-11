'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useCatalogoProfissional } from '@/hooks/useCatalogoProfissional'
import { ESPECIALIDADES_ICON } from '@/hooks/useAdminProfissionais'
import {
  ArrowLeft, Star, MapPin, Phone, Mail, Lock, Unlock,
  Package, Wrench, Loader2,
} from 'lucide-react'

function fmtPreco(v: number | null) {
  if (v == null) return null
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

// Valor de desbloqueio (idealmente viria de /api/config, mas por ora é constante editável)
const VALOR_DESBLOQUEIO_PADRAO = 'R$ 5,90'

export default function CatalogoPublicoProfissionalPage({
  params,
}: {
  params: { id: string }
}) {
  const { id } = params
  const [desbloqueado, setDesbloqueado] = useState(false)
  const [pagando, setPagando] = useState(false)

  const {
    profissional, itens, loading,
    filtroTipo, setFiltroTipo,
    stats,
  } = useCatalogoProfissional(id)

  if (loading) return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <Loader2 className="w-6 h-6 text-zinc-500 animate-spin" />
    </div>
  )

  const prof = profissional!
  const contatoVisivel = prof.tem_plano || desbloqueado
  const espIcon = ESPECIALIDADES_ICON[prof.especialidade ?? ''] ?? '🛠️'

  async function handleDesbloquear() {
    setPagando(true)
    // TODO: integrar gateway de pagamento
    await new Promise(r => setTimeout(r, 1200))
    setDesbloqueado(true)
    setPagando(false)
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans pb-24">

      {/* HEADER */}
      <header className="sticky top-0 z-30 bg-zinc-950/95 backdrop-blur border-b border-zinc-900 px-4 py-3 flex items-center gap-3">
        <Link href="/profissional" className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 transition-all flex-shrink-0">
          <ArrowLeft className="w-4 h-4 text-zinc-400" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-black text-white truncate leading-none">{prof.nome}</h1>
          <p className="text-sm text-zinc-500 capitalize">{prof.especialidade}</p>
        </div>
        {prof.tem_plano && (
          <span className="flex-shrink-0 text-sm font-black uppercase px-3 py-1.5 rounded-full bg-violet-600/20 border border-violet-500/20 text-violet-300">
            Verificado ✓
          </span>
        )}
      </header>

      <main className="max-w-2xl mx-auto px-4 pt-5 space-y-5">

        {/* CARD PROFISSIONAL */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex gap-4 items-start">
          {/* Avatar */}
          <div className="w-20 h-20 flex-shrink-0 rounded-2xl bg-violet-600/15 border border-violet-500/20 flex items-center justify-center text-4xl overflow-hidden">
            {prof.foto_url
              ? <img src={prof.foto_url} alt={prof.nome} className="w-full h-full object-cover" />
              : espIcon
            }
          </div>

          <div className="flex-1 min-w-0 space-y-1.5">
            <div>
              <p className="font-black text-2xl text-white leading-tight">{prof.nome}</p>
              <p className="text-base text-zinc-400 capitalize">{prof.especialidade}</p>
            </div>

            <div className="flex flex-wrap gap-3 text-sm text-zinc-500">
              {prof.cidade && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {prof.cidade}
                </span>
              )}
              {prof.avaliacao && (
                <span className="flex items-center gap-1 text-yellow-400">
                  <Star className="w-3 h-3" /> {prof.avaliacao}
                </span>
              )}
              {prof.total_servicos != null && prof.total_servicos > 0 && (
                <span className="text-zinc-600">{prof.total_servicos} serviços realizados</span>
              )}
            </div>

            {/* Contatos */}
            {contatoVisivel ? (
              <div className="flex flex-col gap-1 pt-1">
                {prof.telefone && (
                  <a
                    href={`tel:${prof.telefone}`}
                    className="flex items-center gap-2 text-base text-emerald-400 font-bold hover:text-emerald-300 transition-colors"
                  >
                    <Phone className="w-4 h-4" /> {prof.telefone}
                  </a>
                )}
                {prof.email && (
                  <a
                    href={`mailto:${prof.email}`}
                    className="flex items-center gap-2 text-base text-violet-400 hover:text-violet-300 transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5" /> {prof.email}
                  </a>
                )}
              </div>
            ) : (
              <button
                onClick={handleDesbloquear}
                disabled={pagando}
                className="mt-1 flex items-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-60 text-white px-4 py-3 rounded-xl text-base font-black uppercase transition-all w-full justify-center"
              >
                {pagando
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <Lock className="w-4 h-4" />
                }
                {pagando ? 'Processando...' : `Ver contatos — ${VALOR_DESBLOQUEIO_PADRAO}`}
              </button>
            )}
          </div>
        </div>

        {/* FILTRO TIPO */}
        {itens.length > 0 && (
          <div className="flex gap-2">
            {(['todos', 'servico', 'produto'] as const).map(t => (
              <button
                key={t}
                onClick={() => setFiltroTipo(t)}
                className={`px-4 py-2 rounded-full text-sm font-black uppercase transition-all ${
                  filtroTipo === t
                    ? 'bg-violet-600 text-white'
                    : 'bg-zinc-800 text-zinc-500 hover:bg-zinc-700'
                }`}
              >
                {t === 'todos'
                  ? `Todos (${stats.total})`
                  : t === 'servico'
                  ? `Serviços (${stats.servicos})`
                  : `Produtos (${stats.produtos})`
                }
              </button>
            ))}
          </div>
        )}

        {/* GRID DE ITENS */}
        {itens.length === 0 ? (
          <div className="text-center py-12 text-zinc-600 text-sm">
            Nenhum serviço ou produto cadastrado ainda
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {itens.filter(i => i.ativo).map(item => {
              const precoFormatado = fmtPreco(item.preco)
              const precoVisivel = prof.tem_plano || desbloqueado

              return (
                <div
                  key={item.id}
                  className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col"
                >
                  {/* Foto */}
                  <div className="w-full aspect-video bg-zinc-800 flex items-center justify-center text-3xl flex-shrink-0">
                    {item.foto_url
                      ? <img src={item.foto_url} alt={item.nome} className="w-full h-full object-cover" />
                      : <span>{item.tipo === 'servico' ? '🛠️' : '📦'}</span>
                    }
                  </div>

                  {/* Info */}
                  <div className="p-3 flex-1 flex flex-col gap-1">
                    <div className="flex items-center gap-1.5">
                      {item.tipo === 'servico'
                        ? <Wrench className="w-3 h-3 text-violet-400 flex-shrink-0" />
                        : <Package className="w-3 h-3 text-indigo-400 flex-shrink-0" />
                      }
                      <p className="font-black text-base text-white truncate">{item.nome}</p>
                    </div>

                    {item.descricao && (
                      <p className="text-sm text-zinc-500 line-clamp-2">{item.descricao}</p>
                    )}

                    <div className="mt-auto pt-1">
                      {precoFormatado == null ? null : precoVisivel ? (
                        <p className="text-lg font-black text-emerald-400">{precoFormatado}</p>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <Lock className="w-3.5 h-3.5 text-amber-500" />
                          <p className="text-sm text-amber-500 font-bold">Desbloqueie para ver preço</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* CTA desbloqueio bottom */}
        {!contatoVisivel && itens.length > 0 && (
          <div className="bg-gradient-to-r from-violet-900/40 to-indigo-900/40 border border-violet-500/20 rounded-2xl p-5 text-center space-y-3">
            <Lock className="w-6 h-6 text-amber-400 mx-auto" />
            <p className="font-black text-lg text-white">Quer contratar {prof.nome}?</p>
            <p className="text-base text-zinc-400">
              Desbloqueie os dados de contato e preços por apenas <strong className="text-white">{VALOR_DESBLOQUEIO_PADRAO}</strong>.
            </p>
            <button
              onClick={handleDesbloquear}
              disabled={pagando}
              className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-60 text-white py-3.5 rounded-xl font-black uppercase text-base flex items-center justify-center gap-2 transition-all"
            >
              {pagando
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Processando...</>
                : <><Unlock className="w-4 h-4" /> Desbloquear por {VALOR_DESBLOQUEIO_PADRAO}</>
              }
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
