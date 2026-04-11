'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft, MapPin, Phone, Navigation, Star,
  MessageCircle, Search, Filter, Clock,
  ChevronDown, Package, Loader2, Lock,
} from 'lucide-react'

// ─── Tipos ──────────────────────────────────────────────────────────────────
interface Ambulante {
  id: string
  nome: string
  produto: string
  categoria: string
  bairro: string
  cidade: string
  telefone?: string
  whatsapp?: string
  horario?: string
  disponivel_agora: boolean
  avaliacao?: number
  descricao?: string
  foto_url?: string
  emoji: string
}

// ─── Mock (substituir por fetch real) ──────────────────────────────────────
const AMBULANTES: Ambulante[] = [
  {
    id: '1',
    nome: 'João do Acarajé',
    produto: 'Acarajé e Abará',
    categoria: 'Comida',
    bairro: 'Centro',
    cidade: 'Valente, BA',
    whatsapp: '5575988880010',
    horario: 'Sáb–Dom 14h–20h',
    disponivel_agora: true,
    avaliacao: 4.9,
    descricao: 'O melhor acarajé da região! Feito na hora com dendê puro.',
    emoji: '🍤',
  },
  {
    id: '2',
    nome: 'Maria da Tapioca',
    produto: 'Tapioca e Cuscuz',
    categoria: 'Comida',
    bairro: 'Feira',
    cidade: 'Valente, BA',
    whatsapp: '5575988880011',
    horario: 'Seg–Sáb 6h–11h',
    disponivel_agora: true,
    avaliacao: 4.7,
    descricao: 'Tapioca artesanal de todos os tipos. Café da manhã completo!',
    emoji: '🥞',
  },
  {
    id: '3',
    nome: 'Pedro da Fruta',
    produto: 'Frutas e Verduras',
    categoria: 'Hortifruti',
    bairro: 'Centro',
    cidade: 'Valente, BA',
    telefone: '(75) 9 8888-0012',
    whatsapp: '5575988880012',
    horario: 'Ter, Qui, Sáb 7h–12h',
    disponivel_agora: false,
    avaliacao: 4.5,
    descricao: 'Frutas e verduras frescas direto do produtor. Entregas no bairro.',
    emoji: '🍎',
  },
  {
    id: '4',
    nome: 'Ana do Artesanato',
    produto: 'Artesanato e Renda',
    categoria: 'Artesanato',
    bairro: 'Centro',
    cidade: 'Valente, BA',
    whatsapp: '5575988880013',
    horario: 'Sex–Dom 9h–17h',
    disponivel_agora: false,
    avaliacao: 4.8,
    descricao: 'Peças de artesanato em renda, bordado e cerâmica. Encomendas aceitas.',
    emoji: '🧶',
  },
  {
    id: '5',
    nome: 'Carlos do Sorvete',
    produto: 'Sorvete artesanal',
    categoria: 'Comida',
    bairro: 'Praça',
    cidade: 'Valente, BA',
    whatsapp: '5575988880014',
    horario: 'Diariamente 13h–19h',
    disponivel_agora: true,
    avaliacao: 4.6,
    descricao: 'Mais de 20 sabores de sorvete artesanal. Feitos com frutas da região.',
    emoji: '🍦',
  },
]

const CATEGORIAS = ['Todos', 'Comida', 'Hortifruti', 'Artesanato', 'Bebidas', 'Outros']

// ─── Página ─────────────────────────────────────────────────────────────────
export default function AmbulantesPag() {
  const [busca, setBusca] = useState('')
  const [categoria, setCategoria] = useState('Todos')
  const [apenasDisponiveis, setApenasDisponiveis] = useState(false)
  const [desbloqueados, setDesbloqueados] = useState<string[]>([])
  const [desbloqueando, setDesbloqueando] = useState<string | null>(null)
  const [contatandoId, setContatandoId] = useState<string | null>(null)

  const filtrados = AMBULANTES.filter(a => {
    const matchBusca = busca.trim().length < 2
      || a.nome.toLowerCase().includes(busca.toLowerCase())
      || a.produto.toLowerCase().includes(busca.toLowerCase())
      || a.bairro.toLowerCase().includes(busca.toLowerCase())
    const matchCategoria = categoria === 'Todos' || a.categoria === categoria
    const matchDisponivel = !apenasDisponiveis || a.disponivel_agora
    return matchBusca && matchCategoria && matchDisponivel
  })

  const disponiveis = AMBULANTES.filter(a => a.disponivel_agora).length

  async function handleDesbloquear(id: string) {
    setDesbloqueando(id)
    // TODO: integrar gateway de pagamento R$1,00
    await new Promise(r => setTimeout(r, 1000))
    setDesbloqueando(null)
    setDesbloqueados(prev => [...prev, id])
  }

  async function handleContato(id: string) {
    setContatandoId(id)
    await new Promise(r => setTimeout(r, 600))
    setContatandoId(null)
    const ambulante = AMBULANTES.find(a => a.id === id)
    if (ambulante?.whatsapp) {
      window.open(`https://wa.me/${ambulante.whatsapp}`, '_blank')
    }
  }

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
        <div className="flex-1">
          <h1 className="text-xl font-black text-white leading-none">Ambulantes</h1>
          <p className="text-sm text-zinc-500">Vendedores e feirantes de Valente</p>
        </div>
        <span className="text-sm font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
          {disponiveis} disponíveis
        </span>
      </header>

      <main className="max-w-2xl mx-auto px-4 pt-5 space-y-4">

        {/* Busca */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por nome, produto ou bairro..."
            value={busca}
            onChange={e => setBusca(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 p-4 pl-12 rounded-2xl text-base text-white outline-none focus:border-amber-500/50 focus:bg-zinc-800 transition-all placeholder:text-zinc-600"
          />
        </div>

        {/* Filtros */}
        <div className="flex gap-2 items-center">
          <div className="flex gap-2 overflow-x-auto flex-1 pb-0.5 no-scrollbar">
            {CATEGORIAS.map(cat => (
              <button
                key={cat}
                onClick={() => setCategoria(cat)}
                className={`px-4 py-2 rounded-full text-sm font-black uppercase whitespace-nowrap transition-all flex-shrink-0 ${
                  categoria === cat
                    ? 'bg-amber-500 text-black'
                    : 'bg-zinc-800 text-zinc-500 border border-zinc-700 hover:bg-zinc-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <button
            onClick={() => setApenasDisponiveis(v => !v)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-black uppercase transition-all border ${
              apenasDisponiveis
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                : 'bg-zinc-800 text-zinc-500 border-zinc-700'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            {apenasDisponiveis ? 'Disponíveis' : 'Todos'}
          </button>
        </div>

        {/* Resultado */}
        {filtrados.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <Package className="w-12 h-12 text-zinc-700 mx-auto" />
            <p className="text-zinc-500 font-black uppercase text-base">Nenhum resultado</p>
            <p className="text-sm text-zinc-600">Tente mudar os filtros de busca</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtrados.map(ambulante => (
              <div
                key={ambulante.id}
                className={`bg-zinc-900 border rounded-2xl p-5 space-y-3 transition-all ${
                  ambulante.disponivel_agora ? 'border-amber-500/20' : 'border-zinc-800'
                }`}
              >
                {/* Cabeçalho do card */}
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 flex-shrink-0 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-3xl overflow-hidden">
                    {ambulante.foto_url
                      ? <img src={ambulante.foto_url} alt={ambulante.nome} className="w-full h-full object-cover" />
                      : ambulante.emoji
                    }
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-black text-lg text-white leading-tight">{ambulante.nome}</p>
                        <p className="text-base text-amber-400 font-bold">{ambulante.produto}</p>
                      </div>
                      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full flex-shrink-0 ${
                        ambulante.disponivel_agora
                          ? 'bg-emerald-500/10 border border-emerald-500/20'
                          : 'bg-zinc-800 border border-zinc-700'
                      }`}>
                        <span className={`w-2 h-2 rounded-full ${
                          ambulante.disponivel_agora ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-600'
                        }`} />
                        <span className={`text-xs font-black uppercase ${
                          ambulante.disponivel_agora ? 'text-emerald-400' : 'text-zinc-500'
                        }`}>
                          {ambulante.disponivel_agora ? 'Agora' : 'Ausente'}
                        </span>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="flex flex-wrap gap-3 mt-1.5 text-sm text-zinc-500">
                      {desbloqueados.includes(ambulante.id) ? (
                        <span className="flex items-center gap-1 text-zinc-400">
                          <MapPin className="w-3 h-3 text-amber-400" /> {ambulante.bairro} · {ambulante.cidade}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 select-none">
                          <MapPin className="w-3 h-3" />
                          <span className="blur-sm text-zinc-400 pointer-events-none">████████████</span>
                        </span>
                      )}
                      {ambulante.avaliacao && (
                        <span className="flex items-center gap-1 text-yellow-400">
                          <Star className="w-3 h-3 fill-current" /> {ambulante.avaliacao}
                        </span>
                      )}
                      {ambulante.horario && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {ambulante.horario}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Descrição */}
                {ambulante.descricao && (
                  <p className="text-base text-zinc-400 leading-snug">{ambulante.descricao}</p>
                )}

                {/* Botão contato / paywall */}
                {desbloqueados.includes(ambulante.id) ? (
                  <button
                    onClick={() => handleContato(ambulante.id)}
                    disabled={contatandoId === ambulante.id}
                    className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-black py-3 rounded-xl text-base font-black uppercase transition-all"
                  >
                    {contatandoId === ambulante.id
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : <MessageCircle className="w-4 h-4" />
                    }
                    {contatandoId === ambulante.id ? 'Abrindo...' : 'Chamar no WhatsApp'}
                  </button>
                ) : (
                  <div className="space-y-2">
                    {/* Contato borrado */}
                    <div className="flex items-center gap-2 p-3 bg-zinc-800 rounded-xl border border-zinc-700">
                      <Phone className="w-4 h-4 text-zinc-600 flex-shrink-0" />
                      <span className="blur-sm text-zinc-400 text-sm select-none pointer-events-none flex-1">
                        (75) 9 ████-████
                      </span>
                      <Lock className="w-3.5 h-3.5 text-zinc-600 flex-shrink-0" />
                    </div>
                    <button
                      onClick={() => handleDesbloquear(ambulante.id)}
                      disabled={desbloqueando === ambulante.id}
                      className="w-full flex items-center justify-center gap-2 bg-zinc-800 hover:bg-amber-500/20 border border-amber-500/40 hover:border-amber-500/70 disabled:opacity-60 text-amber-400 py-3 rounded-xl text-base font-black uppercase transition-all"
                    >
                      {desbloqueando === ambulante.id
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : <Lock className="w-4 h-4" />
                      }
                      {desbloqueando === ambulante.id ? 'Processando...' : 'Desbloquear Contato · R$ 1,00'}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Seja um ambulante */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 text-center space-y-3 mt-2">
          <p className="text-lg font-black text-white">Você é ambulante?</p>
          <p className="text-base text-zinc-400">
            Cadastre-se gratuitamente e apareça aqui para toda a cidade encontrar você.
          </p>
          <Link
            href="/profissional/catalogo"
            className="block w-full py-3 bg-amber-500 hover:bg-amber-400 text-black rounded-xl font-black uppercase text-base transition-all"
          >
            Cadastrar meu negócio
          </Link>
        </div>

      </main>
    </div>
  )
}
