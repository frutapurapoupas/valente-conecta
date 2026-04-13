'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Search, Wallet, QrCode, Bell, Menu, X, Zap, Dumbbell,
  ShoppingBag, Gift, Lock, MapPin, Phone, Mail, Navigation,
  ChevronRight, TrendingDown,
  Building2, Loader2, AlertTriangle, Crown, User, Store, Bike,
} from 'lucide-react'
import type { TipoUsuario } from '@/hooks/useHomePage'
import { useHomePage } from '@/hooks/useHomePage'

export default function HomePage() {


  const {
    isMenuOpen, setIsMenuOpen,
    showSearchModal, setShowSearchModal,
    showUnlockModal, setShowUnlockModal,
    unlockTarget,
    loadingUnlock,
    unlockPrice,
    searchTerm, setSearchTerm,
    searchResults,
    welcomeSearchesLeft,
    handleSearch,
    handleUnlockContact,
    confirmUnlockPayment,
    balance,
    notifications,
    recentActivity,
    generateQRCode,
    tipoUsuario, showOnboarding, confirmarTipoUsuario,
  } = useHomePage()

  // splash antes do onboarding
  const [splashFase, setSplashFase] = useState<'logo' | 'pergunta' | 'saindo' | 'pronto'>(
    () => (typeof window !== 'undefined' && localStorage.getItem('tipoUsuario') ? 'pronto' : 'logo')
  )

  useEffect(() => {
    if (splashFase === 'pronto') return
    const t1 = setTimeout(() => setSplashFase('pergunta'), 2500)   // logo por 2.5s
    const t2 = setTimeout(() => setSplashFase('saindo'),  5000)   // pergunta por 2.5s
    const t3 = setTimeout(() => setSplashFase('pronto'),  6000)   // fade out 1s
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      {/* SPLASH SCREEN slow motion */}
      {splashFase !== 'pronto' && (
        <div className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-br from-indigo-900 via-indigo-800 to-zinc-950 transition-all duration-1000 ${splashFase === 'saindo' ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'}`}
             style={{transitionProperty:'opacity,transform', transitionTimingFunction:'cubic-bezier(.4,2,.2,1)'}}>
          <div className="flex flex-col items-center gap-6 animate-slowfadein">
            <div className="w-24 h-24 rounded-3xl bg-yellow-400 flex items-center justify-center shadow-2xl scale-100 animate-slowpop">
              <Zap className="w-16 h-16 text-black" />
            </div>
            <h1 className="text-3xl font-black text-white drop-shadow-lg animate-slowfadein">Valente Conecta</h1>
            <p className="text-lg text-indigo-200 font-bold animate-slowfadein">Bem-vindo! Conectando oportunidades...</p>
          </div>
        </div>
      )}
      <div className="min-h-screen bg-zinc-950 text-white pb-24">

      {/* HEADER */}
            {/* Animations for splash */}
            <style jsx global>{`
              @keyframes slowfadein {
                0% { opacity: 0; transform: scale(0.95); }
                100% { opacity: 1; transform: scale(1); }
              }
              @keyframes slowpop {
                0% { transform: scale(0.7) rotate(-10deg); opacity: 0; }
                60% { transform: scale(1.1) rotate(3deg); opacity: 1; }
                100% { transform: scale(1) rotate(0deg); opacity: 1; }
              }
              .animate-slowfadein {
                animation: slowfadein 1.2s cubic-bezier(.4,2,.2,1) both;
              }
              .animate-slowpop {
                animation: slowpop 1.4s cubic-bezier(.4,2,.2,1) both;
              }
            `}</style>
      <header className="sticky top-0 z-30 bg-zinc-950/95 backdrop-blur border-b border-zinc-900 px-4 py-3">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 bg-zinc-900 border border-zinc-800 rounded-xl md:hidden">
            <Menu className="w-5 h-5 text-zinc-400" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-black fill-black" />
            </div>
            <span className="font-black text-lg text-white">Valente Conecta</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-xl flex items-center gap-2">
              <Wallet className="w-4 h-4 text-emerald-400" />
              <span className="font-black text-base text-emerald-400">R$ {balance.toFixed(2)}</span>
            </div>
            <button
              onClick={() => confirmarTipoUsuario(null)}
              className="p-2 bg-zinc-900 border border-zinc-800 rounded-xl"
              title="Trocar perfil"
            >
              <User className="w-5 h-5 text-zinc-400" />
            </button>
            <button className="p-2 bg-zinc-900 border border-zinc-800 rounded-xl relative">
              <Bell className="w-5 h-5 text-zinc-400" />
              {notifications.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* MENU LATERAL */}
      {isMenuOpen && (
        <>
          <div className="fixed inset-0 bg-black/70 z-40" onClick={() => setIsMenuOpen(false)} />
          <div className="fixed left-0 top-0 h-full w-64 bg-zinc-900 border-r border-zinc-800 z-50 p-4 space-y-1">
            <div className="flex justify-between items-center mb-5">
              <span className="font-black text-white">Menu</span>
              <button onClick={() => setIsMenuOpen(false)} className="p-2 hover:bg-zinc-800 rounded-xl">
                <X className="w-5 h-5 text-zinc-400" />
              </button>
            </div>
            {[
              { label: 'Início', href: '/' },
              { label: 'Explorar', href: '/explorar' },
              { label: 'Ofertas', href: '/oferta' },
              { label: 'Ambulantes', href: '/ambulantes' },
              { label: 'Academia', href: '/academia' },
              { label: 'PDV Colaborativo', href: '/pdv/colaborativo' },
              { label: 'Anúncios', href: '/anuncios' },
              { label: 'Carteira', href: '/carteira' },
              { label: 'Indique e Ganhe', href: '/indique' },
              { label: 'Meus Planos', href: '/usuario/planos' },
            ].map(item => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                className="block px-3 py-2.5 text-base text-zinc-300 hover:bg-zinc-800 hover:text-white rounded-xl transition-all font-bold"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </>
      )}

      <main className="max-w-2xl mx-auto px-4 pt-5 space-y-5">

        {/* HERO / BUSCA */}
        <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 rounded-3xl p-6 space-y-4">
          <div>
            <p className="text-blue-200 text-sm font-bold uppercase tracking-widest">Bem-vindo a</p>
            <h1 className="text-3xl font-black text-white leading-tight">Valente Conecta</h1>
            <p className="text-blue-200 text-base mt-1">
              Saldo: <span className="text-white font-black">R$ {balance.toFixed(2)}</span>
            </p>
          </div>

          <button
            onClick={() => setShowSearchModal(true)}
            className="w-full bg-white/15 backdrop-blur-sm border border-white/20 rounded-2xl p-4 flex items-center gap-3 hover:bg-white/25 transition-all text-left"
          >
            <Search className="w-5 h-5 text-white/70 flex-shrink-0" />
            <span className="text-white/70 text-base">O que você procura?</span>
          </button>

          {welcomeSearchesLeft > 0 ? (
            <div className="bg-yellow-400/20 border border-yellow-400/30 rounded-xl px-4 py-2 text-sm text-yellow-200 text-center font-bold">
              🎁 {welcomeSearchesLeft} consulta(s) gratuita(s) de boas-vindas!
            </div>
          ) : (
            <div className="bg-white/10 rounded-xl px-4 py-2 text-sm text-blue-200 text-center">
              🔍 Consultas: R$ 1,00 por contato desbloqueado
            </div>
          )}
        </div>

        {/* INDIQUE E GANHE */}
        <Link href="/carteira?tab=indicar" className="bg-gradient-to-r from-yellow-500 to-amber-500 rounded-2xl p-5 flex items-center gap-4 active:scale-95 transition-all">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
            <Gift className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <p className="font-black text-lg text-white">Indique e Ganhe</p>
            <p className="text-base text-yellow-100">Até R$ 50/mês indicando amigos</p>
          </div>
          <QrCode className="w-5 h-5 text-white/70" />
        </Link>

        {/* ACESSO RÁPIDO — dinâmico por tipo de usuário */}
        {(() => {
          type Card = { href: string; label: string; sub: string; border: string; bg: string; icon: React.ReactNode }
          const CARDS: Record<NonNullable<TipoUsuario>, Card[]> = {
            usuario_geral: [
              { href: '/explorar',       label: 'Explorar',       sub: 'Serviços e lojas',      border: 'border-indigo-500/20', bg: 'bg-indigo-500/15', icon: <Search className="w-5 h-5 text-indigo-400" /> },
              { href: '/oferta',         label: 'Ofertas',        sub: 'Preços reduzidos',       border: 'border-red-500/20',    bg: 'bg-red-500/15',    icon: <TrendingDown className="w-5 h-5 text-red-400" /> },
              { href: '/ambulantes',     label: 'Ambulantes',     sub: 'Feirantes e vendedores', border: 'border-amber-500/20',  bg: 'bg-amber-500/15',  icon: <span className="text-xl">🛵</span> },
              { href: '/academia',       label: 'Academia',       sub: 'A partir de grátis',     border: 'border-purple-500/20', bg: 'bg-purple-500/15', icon: <Dumbbell className="w-5 h-5 text-purple-400" /> },
              { href: '/carteira',       label: 'Carteira',       sub: 'Moeda Conecta',          border: 'border-emerald-500/20',bg: 'bg-emerald-500/15',icon: <Wallet className="w-5 h-5 text-emerald-400" /> },
              { href: '/usuario/planos', label: 'Meus Planos',    sub: 'Grátis · Multi-Cidade',  border: 'border-yellow-500/20', bg: 'bg-yellow-500/15', icon: <Crown className="w-5 h-5 text-yellow-400" /> },
            ],
            lojista: [
              { href: '/pdv/colaborativo',    label: 'PDV Colaborativo', sub: 'Vendas e estoque',       border: 'border-blue-500/20',   bg: 'bg-blue-500/15',   icon: <ShoppingBag className="w-5 h-5 text-blue-400" /> },
              { href: '/profissional/catalogo', label: 'Catálogo',       sub: 'Produtos e horários',    border: 'border-indigo-500/20', bg: 'bg-indigo-500/15', icon: <Store className="w-5 h-5 text-indigo-400" /> },
              { href: '/empresa/planos',       label: 'Planos da Loja',  sub: 'Básico · Premium',       border: 'border-yellow-500/20', bg: 'bg-yellow-500/15', icon: <Crown className="w-5 h-5 text-yellow-400" /> },
              { href: '/carteira',             label: 'Carteira',        sub: 'Moeda Conecta',          border: 'border-emerald-500/20',bg: 'bg-emerald-500/15',icon: <Wallet className="w-5 h-5 text-emerald-400" /> },
              { href: '/oferta',               label: 'Ofertas',         sub: 'Criar promoções',        border: 'border-red-500/20',    bg: 'bg-red-500/15',    icon: <TrendingDown className="w-5 h-5 text-red-400" /> },
              { href: '/anuncios',             label: 'Anúncios',        sub: 'Divulgue sua loja',      border: 'border-violet-500/20', bg: 'bg-violet-500/15', icon: <Zap className="w-5 h-5 text-violet-400" /> },
            ],
            profissional: [
              { href: '/profissional/catalogo', label: 'Meu Perfil',       sub: 'Catálogo e horários',  border: 'border-violet-500/20', bg: 'bg-violet-500/15', icon: <User className="w-5 h-5 text-violet-400" /> },
              { href: '/profissional/planos',   label: 'Planos',           sub: 'Básico · Premium',     border: 'border-yellow-500/20', bg: 'bg-yellow-500/15', icon: <Crown className="w-5 h-5 text-yellow-400" /> },
              { href: '/carteira',              label: 'Carteira',         sub: 'Moeda Conecta',        border: 'border-emerald-500/20',bg: 'bg-emerald-500/15',icon: <Wallet className="w-5 h-5 text-emerald-400" /> },
              { href: '/explorar',              label: 'Explorar',         sub: 'Ver outros serviços',  border: 'border-indigo-500/20', bg: 'bg-indigo-500/15', icon: <Search className="w-5 h-5 text-indigo-400" /> },
              { href: '/anuncios',              label: 'Anúncios',         sub: 'Divulgue seu serviço', border: 'border-violet-500/20', bg: 'bg-violet-500/20', icon: <Zap className="w-5 h-5 text-violet-400" /> },
              { href: '/oferta',                label: 'Ofertas',          sub: 'Criar promoções',      border: 'border-red-500/20',    bg: 'bg-red-500/15',    icon: <TrendingDown className="w-5 h-5 text-red-400" /> },
            ],
            ambulante: [
              { href: '/ambulantes',          label: 'Minha Página',    sub: 'Como aparece para clientes', border: 'border-amber-500/20', bg: 'bg-amber-500/15', icon: <Bike className="w-5 h-5 text-amber-400" /> },
              { href: '/ambulantes/planos',   label: 'Planos',          sub: 'Básico · Premium',           border: 'border-yellow-500/20',bg: 'bg-yellow-500/15',icon: <Crown className="w-5 h-5 text-yellow-400" /> },
              { href: '/carteira',            label: 'Carteira',        sub: 'Moeda Conecta',              border: 'border-emerald-500/20',bg: 'bg-emerald-500/15',icon: <Wallet className="w-5 h-5 text-emerald-400" /> },
              { href: '/explorar',            label: 'Explorar',        sub: 'Ver outros serviços',        border: 'border-indigo-500/20', bg: 'bg-indigo-500/15', icon: <Search className="w-5 h-5 text-indigo-400" /> },
              { href: '/profissional/catalogo',label: 'Meu Catálogo',   sub: 'Produtos e horários',        border: 'border-violet-500/20', bg: 'bg-violet-500/15', icon: <Store className="w-5 h-5 text-violet-400" /> },
              { href: '/anuncios',            label: 'Anúncios',        sub: 'Divulgue sua banca',         border: 'border-violet-500/20', bg: 'bg-violet-500/20', icon: <Zap className="w-5 h-5 text-violet-400" /> },
            ],
          }
          const cards = tipoUsuario ? CARDS[tipoUsuario] : CARDS.usuario_geral
          return (
            <div className="grid grid-cols-2 gap-3">
              {cards.map(c => (
                <Link key={c.href + c.label} href={c.href}>
                  <div className={`bg-zinc-900 border ${c.border} rounded-2xl p-4 flex flex-col gap-3 hover:opacity-80 transition-all active:scale-95`}>
                    <div className={`w-10 h-10 ${c.bg} border ${c.border} rounded-xl flex items-center justify-center`}>
                      {c.icon}
                    </div>
                    <div>
                      <p className="font-black text-base text-white">{c.label}</p>
                      <p className="text-sm text-zinc-500">{c.sub}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )
        })()}

        {/* ATIVIDADE RECENTE */}
        {recentActivity.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-black text-white uppercase italic tracking-tighter">Atividade Recente</h2>
            <div className="space-y-2">
              {recentActivity.map(activity => (
                <div key={activity.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                  <p className="text-base text-zinc-300">{activity.text}</p>
                  <p className="text-sm text-zinc-600 mt-1">{activity.time}</p>
                </div>
              ))}
            </div>
          </div>
        )}


      </main>

      {/* ── MODAL BUSCA ── */}
      {showSearchModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-4 px-4 bg-black/70">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center p-5 border-b border-zinc-800">
              <h2 className="text-xl font-black text-white">Busca Inteligente</h2>
              <button onClick={() => setShowSearchModal(false)} className="p-2 hover:bg-zinc-800 rounded-xl">
                <X className="w-5 h-5 text-zinc-400" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Digite o que você procura..."
                  className="flex-1 px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-base text-white outline-none focus:border-blue-500/50 placeholder:text-zinc-600"
                />
                <button onClick={handleSearch} className="px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black transition-all">
                  Buscar
                </button>
              </div>

              {searchResults.length > 0 && (
                <div className="space-y-3">
                  <p className="text-sm text-zinc-500 font-bold uppercase">{searchResults.length} resultado(s) próximos a você</p>
                  {searchResults.map(result => (
                    <div key={result.id} className="bg-zinc-800 border border-zinc-700 rounded-2xl overflow-hidden">
                      {/* ── Cabeçalho ── */}
                      <div className="p-4 flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-black text-sm">{result.foto}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-black text-base text-white">{result.name}</p>
                            {result.estaAberto
                              ? <span className="text-xs bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">● Aberto</span>
                              : <span className="text-xs bg-red-500/20 text-red-400 font-bold px-2 py-0.5 rounded-full border border-red-500/30">● Fechado</span>
                            }
                          </div>
                          <span className="inline-block text-xs bg-blue-500/20 text-blue-400 font-bold px-2 py-0.5 rounded-full border border-blue-500/20">
                            {result.categoria}
                          </span>
                        </div>
                        {result.locked && <Lock className="w-5 h-5 text-zinc-600 flex-shrink-0" />}
                      </div>

                      {/* ── Info pública: produto + preço + aviso ── */}
                      <div className="px-4 pb-3 space-y-2 border-t border-zinc-700/50 pt-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm text-zinc-300 flex-1 min-w-0 truncate">{result.produto}</span>
                          <span className="text-sm font-black text-blue-300 flex-shrink-0">{result.price}</span>
                        </div>
                        {result.avisoHorario && (
                          <div className="flex items-start gap-2 bg-amber-500/10 border border-amber-500/30 rounded-xl px-3 py-2">
                            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                            <span className="text-xs text-amber-300 font-bold">{result.avisoHorario}</span>
                          </div>
                        )}
                      </div>

                      {/* ── Seção de contato (bloqueada ou liberada) ── */}
                      {result.locked ? (
                        <div className="px-4 pb-4 space-y-2 border-t border-zinc-700 pt-3">
                          <div className="flex flex-col gap-1">
                            <span className="text-sm text-zinc-500 flex items-center gap-1 select-none">
                              <Phone className="w-3 h-3" />
                              <span className="blur-sm">██ ██████-████</span>
                            </span>
                            <span className="text-sm text-zinc-500 flex items-center gap-1 select-none">
                              <MapPin className="w-3 h-3" />
                              <span className="blur-sm">Endereço ocultado — ███, Valente BA</span>
                            </span>
                          </div>
                          <button
                            onClick={() => handleUnlockContact(result)}
                            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-base font-black flex items-center justify-center gap-2 transition-all"
                          >
                            🔓 Desbloquear — R$ {unlockPrice.toFixed(2)}
                          </button>
                        </div>
                      ) : (
                        <div className="px-4 pb-4 pt-3 space-y-1.5 bg-emerald-500/5 border-t border-emerald-500/20">
                          <p className="text-sm font-black text-emerald-400 uppercase tracking-wider mb-2">✅ Acesso liberado</p>
                          <p className="text-base text-zinc-300 flex items-center gap-2">
                            <Phone className="w-4 h-4 text-blue-400" /> <strong>{result.telefone}</strong>
                          </p>
                          <p className="text-base text-zinc-300 flex items-center gap-2">
                            <Mail className="w-4 h-4 text-blue-400" /> {result.email}
                          </p>
                          <p className="text-base text-zinc-300 flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-blue-400" /> {result.endereco}
                          </p>
                          <p className="text-base text-zinc-300 flex items-center gap-2">
                            <Navigation className="w-4 h-4 text-emerald-400" /> {result.distanciaDetalhada} · {result.bairro}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL DESBLOQUEIO ── */}
      {showUnlockModal && unlockTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-md p-6 space-y-4">
            <h2 className="text-xl font-black text-white">Desbloquear Contato</h2>
            <p className="text-base text-zinc-400">Loja: <strong className="text-white">{unlockTarget.store}</strong></p>
            <p className="text-4xl font-black text-blue-400">R$ {unlockPrice.toFixed(2)}</p>
            <p className="text-base text-zinc-500">Após o pagamento você recebe telefone, e-mail e geolocalização completa.</p>
            <div className="space-y-2">
              {(['pix', 'debito', 'credito'] as const).map((method) => (
                <button
                  key={method}
                  onClick={() => confirmUnlockPayment(method)}
                  disabled={loadingUnlock}
                  className="w-full p-3.5 bg-zinc-800 border border-zinc-700 rounded-xl flex items-center justify-between hover:border-blue-500/40 transition-all disabled:opacity-50 text-base"
                >
                  <span className="font-bold text-white">
                    {method === 'pix' ? 'PIX' : method === 'debito' ? 'Cartão de Débito' : 'Cartão de Crédito'}
                  </span>
                  {loadingUnlock
                    ? <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                    : <span className="text-blue-400 font-black">Pagar R$ {unlockPrice.toFixed(2)}</span>
                  }
                </button>
              ))}
            </div>
            <button onClick={() => setShowUnlockModal(false)} className="w-full p-3 text-base text-zinc-500 hover:text-zinc-300 transition-colors">
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* SPLASH — primeira visita */}
      {splashFase !== 'pronto' && (
        <div className={`fixed inset-0 z-[60] bg-zinc-950 flex flex-col items-center justify-center gap-6 transition-opacity duration-500 ${
          splashFase === 'saindo' ? 'opacity-0' : 'opacity-100'
        }`}>
          {/* logo */}
          <div className={`flex flex-col items-center gap-4 transition-all duration-700 ${
            splashFase === 'logo' ? 'opacity-100 scale-100' : splashFase === 'pergunta' ? 'opacity-60 scale-90' : 'opacity-0 scale-75'
          }`}>
            <div className="w-24 h-24 bg-yellow-400 rounded-3xl flex items-center justify-center shadow-2xl shadow-yellow-500/30">
              <Zap className="w-14 h-14 text-black fill-black" />
            </div>
            <p className="text-3xl font-black text-white tracking-tight">Valente Conecta</p>
            <p className="text-zinc-500 text-sm font-medium">Conectando sua cidade</p>
          </div>

          {/* mensagem de boas-vindas */}
          <div className={`text-center px-6 transition-all duration-500 ${
            splashFase === 'pergunta' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            <p className="text-xl font-black text-white mb-2">Bem-vindo(a)! 👋</p>
            <p className="text-zinc-400 text-base">Como você planeja usar o<br /><span className="text-yellow-400 font-black">Valente Conecta</span>?</p>
          </div>
        </div>
      )}

      {/* ONBOARDING — escolha de perfil na primeira visita */}
      {showOnboarding && splashFase === 'pronto' && (
        <div className="fixed inset-0 z-50 bg-zinc-950 flex flex-col items-center justify-center p-6 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-indigo-500/20 border border-indigo-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-indigo-400" />
            </div>
            <h1 className="text-2xl font-black text-white mb-2">Como você vai usar o<br />Valente Conecta?</h1>
            <p className="text-zinc-400 text-sm">Escolha seu perfil para personalizar a tela inicial</p>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
            {([
              { tipo: 'usuario_geral' as const, emoji: '🔍', label: 'Consumidor',     sub: 'Busco produtos e serviços na cidade', border: 'border-blue-500/40',    hover: 'hover:border-blue-400',    bg: 'bg-blue-500/10' },
              { tipo: 'lojista'       as const, emoji: '🏪', label: 'Lojista',         sub: 'Tenho uma loja ou comércio',          border: 'border-amber-500/40',   hover: 'hover:border-amber-400',   bg: 'bg-amber-500/10' },
              { tipo: 'profissional'  as const, emoji: '👷', label: 'Profissional',    sub: 'Ofereço serviços autônomos',          border: 'border-violet-500/40',  hover: 'hover:border-violet-400',  bg: 'bg-violet-500/10' },
              { tipo: 'ambulante'     as const, emoji: '🛵', label: 'Ambulante',       sub: 'Vendo na rua ou em feiras',           border: 'border-emerald-500/40', hover: 'hover:border-emerald-400', bg: 'bg-emerald-500/10' },
            ] as const).map(opt => (
              <button
                key={opt.tipo}
                onClick={() => confirmarTipoUsuario(opt.tipo)}
                className={`${opt.bg} border ${opt.border} ${opt.hover} rounded-2xl p-4 flex flex-col items-center gap-2 text-center transition-all active:scale-95`}
              >
                <span className="text-3xl">{opt.emoji}</span>
                <p className="font-black text-white text-base">{opt.label}</p>
                <p className="text-xs text-zinc-400 leading-tight">{opt.sub}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
