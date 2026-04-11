'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft, MapPin, Phone, Mail, Globe, Clock,
  Building2, Package, Lock, Loader2, Star,
  CheckCircle2, ShoppingBag, Instagram, MessageCircle,
} from 'lucide-react'

// ─── Tipos ──────────────────────────────────────────────────────────────────
interface Produto {
  id: string
  nome: string
  preco: number | null
  descricao?: string
  foto_url?: string
  em_promocao?: boolean
  preco_original?: number | null
}

interface Empresa {
  id: string
  nome_fantasia: string
  categoria: string
  cidade: string
  endereco?: string
  telefone?: string
  whatsapp?: string
  email?: string
  instagram?: string
  site?: string
  foto_url?: string
  aberto_agora: boolean
  tem_plano: boolean
  avaliacao?: number
  total_vendas?: number
  horario_resumo?: string
}

// ─── Mock (substituir por fetch real) ──────────────────────────────────────
const EMPRESA_MOCK: Empresa = {
  id: '1',
  nome_fantasia: 'Mercadinho São José',
  categoria: 'Mercado / Mercearia',
  cidade: 'Valente, BA',
  endereco: 'Rua das Flores, 123 – Centro',
  telefone: '(75) 9 8888-0001',
  whatsapp: '5575988880001',
  email: 'contato@mercarinhosaojose.com',
  instagram: '@mercadinhosaojose',
  site: '',
  foto_url: '',
  aberto_agora: true,
  tem_plano: true,
  avaliacao: 4.8,
  total_vendas: 1230,
  horario_resumo: 'Seg–Sáb 7h–20h · Dom 8h–13h',
}

const PRODUTOS_MOCK: Produto[] = [
  { id: '1', nome: 'Arroz 5kg', preco: 22.9, foto_url: '', em_promocao: false },
  { id: '2', nome: 'Feijão Carioca 1kg', preco: 7.5, foto_url: '', em_promocao: true, preco_original: 9.9 },
  { id: '3', nome: 'Óleo de Soja 900ml', preco: 6.8, foto_url: '' },
  { id: '4', nome: 'Açúcar Cristal 1kg', preco: 4.5, foto_url: '' },
  { id: '5', nome: 'Macarrão Espaguete', preco: 3.9, foto_url: '' },
  { id: '6', nome: 'Leite Integral 1L', preco: 5.2, foto_url: '', em_promocao: true, preco_original: 6.0 },
]

const VALOR_DESBLOQUEIO = 'R$ 5,90'

function fmtPreco(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

// ─── Página ─────────────────────────────────────────────────────────────────
export default function EmpresaPublicaPage({
  params,
}: {
  params: { id: string }
}) {
  const [desbloqueado, setDesbloqueado] = useState(false)
  const [pagando, setPagando] = useState(false)
  const [filtro, setFiltro] = useState<'todos' | 'promocao'>('todos')

  // TODO: substituir por fetch real usando params.id
  const empresa = EMPRESA_MOCK
  const produtos = PRODUTOS_MOCK

  const contatoVisivel = empresa.tem_plano || desbloqueado
  const produtosFiltrados = filtro === 'promocao'
    ? produtos.filter(p => p.em_promocao)
    : produtos

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
        <Link
          href="/explorar"
          className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 transition-all flex-shrink-0"
        >
          <ArrowLeft className="w-4 h-4 text-zinc-400" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-black text-white truncate leading-none">{empresa.nome_fantasia}</h1>
          <p className="text-sm text-zinc-500">{empresa.categoria}</p>
        </div>
        {empresa.tem_plano && (
          <span className="flex-shrink-0 text-sm font-black uppercase px-3 py-1.5 rounded-full bg-blue-600/20 border border-blue-500/20 text-blue-300">
            Verificado ✓
          </span>
        )}
      </header>

      <main className="max-w-2xl mx-auto px-4 pt-5 space-y-5">

        {/* CARD EMPRESA */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
          {/* Logo + nome */}
          <div className="flex gap-4 items-start">
            <div className="w-20 h-20 flex-shrink-0 rounded-2xl bg-blue-600/15 border border-blue-500/20 flex items-center justify-center text-4xl overflow-hidden">
              {empresa.foto_url
                ? <img src={empresa.foto_url} alt={empresa.nome_fantasia} className="w-full h-full object-cover" />
                : <Building2 className="w-9 h-9 text-blue-400" />
              }
            </div>

            <div className="flex-1 min-w-0 space-y-1.5">
              <div>
                <p className="font-black text-2xl text-white leading-tight">{empresa.nome_fantasia}</p>
                <p className="text-base text-zinc-400">{empresa.categoria}</p>
              </div>

              <div className="flex flex-wrap gap-3 text-sm text-zinc-500">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {empresa.cidade}
                </span>
                {empresa.avaliacao && (
                  <span className="flex items-center gap-1 text-yellow-400">
                    <Star className="w-3 h-3 fill-current" /> {empresa.avaliacao}
                  </span>
                )}
                {empresa.total_vendas != null && empresa.total_vendas > 0 && (
                  <span className="text-zinc-600">
                    <ShoppingBag className="w-3 h-3 inline mr-1" />
                    {empresa.total_vendas.toLocaleString('pt-BR')} vendas
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Status aberto */}
          <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl ${
            empresa.aberto_agora
              ? 'bg-emerald-500/10 border border-emerald-500/20'
              : 'bg-zinc-800 border border-zinc-700'
          }`}>
            <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
              empresa.aberto_agora ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-600'
            }`} />
            <span className={`text-base font-black uppercase ${
              empresa.aberto_agora ? 'text-emerald-400' : 'text-zinc-500'
            }`}>
              {empresa.aberto_agora ? 'Aberto Agora' : 'Fechado'}
            </span>
            {empresa.horario_resumo && (
              <span className="text-sm text-zinc-500 ml-auto flex items-center gap-1">
                <Clock className="w-3 h-3" /> {empresa.horario_resumo}
              </span>
            )}
          </div>

          {/* Endereço */}
          {empresa.endereco && (
            <div className="flex items-center gap-2 text-sm text-zinc-500">
              <MapPin className="w-4 h-4 flex-shrink-0 text-zinc-600" />
              <span>{empresa.endereco}</span>
            </div>
          )}

          {/* Contatos */}
          {contatoVisivel ? (
            <div className="flex flex-col gap-2 pt-1 border-t border-zinc-800">
              {empresa.whatsapp && (
                <a
                  href={`https://wa.me/${empresa.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-base text-emerald-400 font-bold hover:text-emerald-300 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" /> WhatsApp
                </a>
              )}
              {empresa.telefone && (
                <a
                  href={`tel:${empresa.telefone}`}
                  className="flex items-center gap-2 text-base text-blue-400 font-bold hover:text-blue-300 transition-colors"
                >
                  <Phone className="w-4 h-4" /> {empresa.telefone}
                </a>
              )}
              {empresa.email && (
                <a
                  href={`mailto:${empresa.email}`}
                  className="flex items-center gap-2 text-base text-zinc-400 hover:text-zinc-300 transition-colors"
                >
                  <Mail className="w-3.5 h-3.5" /> {empresa.email}
                </a>
              )}
              {empresa.instagram && (
                <a
                  href={`https://instagram.com/${empresa.instagram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-base text-pink-400 hover:text-pink-300 transition-colors"
                >
                  <Instagram className="w-4 h-4" /> {empresa.instagram}
                </a>
              )}
              {empresa.site && (
                <a
                  href={empresa.site}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-base text-zinc-400 hover:text-zinc-300 transition-colors"
                >
                  <Globe className="w-4 h-4" /> Site
                </a>
              )}
            </div>
          ) : (
            <button
              onClick={handleDesbloquear}
              disabled={pagando}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white px-4 py-3 rounded-xl text-base font-black uppercase transition-all"
            >
              {pagando
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <Lock className="w-4 h-4" />
              }
              {pagando ? 'Processando...' : `Ver contatos — ${VALOR_DESBLOQUEIO}`}
            </button>
          )}
        </div>

        {/* PRODUTOS */}
        {produtos.length > 0 && (
          <>
            {/* Filtros */}
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-white flex-1 uppercase italic tracking-tighter">
                Produtos
              </h2>
              {produtos.some(p => p.em_promocao) && (
                <div className="flex gap-2">
                  {(['todos', 'promocao'] as const).map(f => (
                    <button
                      key={f}
                      onClick={() => setFiltro(f)}
                      className={`px-3 py-1.5 rounded-full text-sm font-black uppercase transition-all ${
                        filtro === f
                          ? 'bg-blue-600 text-white'
                          : 'bg-zinc-800 text-zinc-500 hover:bg-zinc-700'
                      }`}
                    >
                      {f === 'todos' ? `Todos (${produtos.length})` : `🔥 Promoção`}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              {produtosFiltrados.map(produto => (
                <div
                  key={produto.id}
                  className={`bg-zinc-900 border rounded-2xl overflow-hidden flex flex-col ${
                    produto.em_promocao ? 'border-red-500/30' : 'border-zinc-800'
                  }`}
                >
                  {/* Foto */}
                  <div className="w-full aspect-video bg-zinc-800 flex items-center justify-center text-3xl flex-shrink-0">
                    {produto.foto_url
                      ? <img src={produto.foto_url} alt={produto.nome} className="w-full h-full object-cover" />
                      : <Package className="w-8 h-8 text-zinc-600" />
                    }
                    {produto.em_promocao && (
                      <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                        Promoção
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-3 flex-1 flex flex-col gap-1">
                    <p className="font-black text-base text-white truncate">{produto.nome}</p>
                    {produto.descricao && (
                      <p className="text-sm text-zinc-500 line-clamp-2">{produto.descricao}</p>
                    )}
                    <div className="mt-auto pt-1">
                      {produto.em_promocao && produto.preco_original && (
                        <p className="text-sm text-zinc-600 line-through">{fmtPreco(produto.preco_original)}</p>
                      )}
                      {produto.preco != null ? (
                        <p className={`text-lg font-black ${produto.em_promocao ? 'text-red-400' : 'text-blue-400'}`}>
                          {fmtPreco(produto.preco)}
                        </p>
                      ) : (
                        <p className="text-sm text-zinc-600 italic">Consulte</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* CTA CONTATO */}
        {!contatoVisivel && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 text-center space-y-3">
            <Building2 className="w-10 h-10 text-blue-400 mx-auto" />
            <div>
              <p className="text-lg font-black text-white">{empresa.nome_fantasia}</p>
              <p className="text-base text-zinc-400 mt-1">
                Desbloqueie os contatos para fazer pedidos, tirar dúvidas ou visitar a loja
              </p>
            </div>
            <button
              onClick={handleDesbloquear}
              disabled={pagando}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white px-4 py-3.5 rounded-xl text-base font-black uppercase transition-all"
            >
              {pagando
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <CheckCircle2 className="w-4 h-4" />
              }
              {pagando ? 'Processando...' : `Desbloquear — ${VALOR_DESBLOQUEIO}`}
            </button>
          </div>
        )}

      </main>
    </div>
  )
}
