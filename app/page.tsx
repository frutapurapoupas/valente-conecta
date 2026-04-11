'use client'

import Link from 'next/link'
import {
  Search, Wallet, QrCode, Bell, Menu, X, Zap, Dumbbell,
  ShoppingBag, Gift, Lock, MapPin, Phone, Mail, Navigation,
  Settings2, PlayCircle, ChevronRight, TrendingDown,
  Building2, User, Package, Loader2, Users, Download,
} from 'lucide-react'
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
    showDemoModal, setShowDemoModal,
    tipoDemo, setTipoDemo,
  } = useHomePage()

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-24">

      {/* HEADER */}
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
        <Link href="/indique">
          <div className="bg-gradient-to-r from-yellow-500 to-amber-500 rounded-2xl p-5 flex items-center gap-4 active:scale-95 transition-all">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Gift className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <p className="font-black text-lg text-white">Indique e Ganhe</p>
              <p className="text-base text-yellow-100">Até R$ 50/mês indicando amigos</p>
            </div>
            <ChevronRight className="w-5 h-5 text-white/70" />
          </div>
        </Link>

        {/* ACESSO RÁPIDO */}
        <div className="grid grid-cols-2 gap-3">
          <Link href="/explorar">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col gap-3 hover:border-zinc-600 transition-all active:scale-95">
              <div className="w-10 h-10 bg-indigo-500/15 border border-indigo-500/20 rounded-xl flex items-center justify-center">
                <Search className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <p className="font-black text-base text-white">Explorar</p>
                <p className="text-sm text-zinc-500">Serviços e lojas</p>
              </div>
            </div>
          </Link>

          <Link href="/oferta">
            <div className="bg-zinc-900 border border-red-500/20 rounded-2xl p-4 flex flex-col gap-3 hover:border-red-500/40 transition-all active:scale-95">
              <div className="w-10 h-10 bg-red-500/15 border border-red-500/20 rounded-xl flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <p className="font-black text-base text-white">Ofertas</p>
                <p className="text-sm text-zinc-500">Preços reduzidos</p>
              </div>
            </div>
          </Link>

          <Link href="/ambulantes">
            <div className="bg-zinc-900 border border-amber-500/20 rounded-2xl p-4 flex flex-col gap-3 hover:border-amber-500/40 transition-all active:scale-95">
              <div className="w-10 h-10 bg-amber-500/15 border border-amber-500/20 rounded-xl flex items-center justify-center">
                <span className="text-xl">🛵</span>
              </div>
              <div>
                <p className="font-black text-base text-white">Ambulantes</p>
                <p className="text-sm text-zinc-500">Feirantes e vendedores</p>
              </div>
            </div>
          </Link>

          <Link href="/academia">
            <div className="bg-zinc-900 border border-purple-500/20 rounded-2xl p-4 flex flex-col gap-3 hover:border-purple-500/40 transition-all active:scale-95">
              <div className="w-10 h-10 bg-purple-500/15 border border-purple-500/20 rounded-xl flex items-center justify-center">
                <Dumbbell className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="font-black text-base text-white">Academia</p>
                <p className="text-sm text-zinc-500">A partir de grátis</p>
              </div>
            </div>
          </Link>

          <Link href="/pdv/colaborativo">
            <div className="bg-zinc-900 border border-blue-500/20 rounded-2xl p-4 flex flex-col gap-3 hover:border-blue-500/40 transition-all active:scale-95">
              <div className="w-10 h-10 bg-blue-500/15 border border-blue-500/20 rounded-xl flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="font-black text-base text-white">Minha Loja</p>
                <p className="text-sm text-zinc-500">PDV e estoque</p>
              </div>
            </div>
          </Link>

          <Link href="/carteira">
            <div className="bg-zinc-900 border border-emerald-500/20 rounded-2xl p-4 flex flex-col gap-3 hover:border-emerald-500/40 transition-all active:scale-95">
              <div className="w-10 h-10 bg-emerald-500/15 border border-emerald-500/20 rounded-xl flex items-center justify-center">
                <Wallet className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="font-black text-base text-white">Carteira</p>
                <p className="text-sm text-zinc-500">Moeda Conecta</p>
              </div>
            </div>
          </Link>
        </div>

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

        {/* DEMO + ADMIN */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setShowDemoModal(true)}
            className="bg-zinc-900 border border-violet-500/30 text-white p-4 rounded-2xl flex flex-col items-center gap-2 hover:border-violet-500/60 transition-all active:scale-95"
          >
            <PlayCircle className="w-7 h-7 text-violet-400" />
            <span className="font-black text-base">Demo</span>
            <span className="text-sm text-zinc-500">Simular usuário</span>
          </button>
          <Link href="/admin/login">
            <div className="bg-zinc-900 border border-zinc-700 text-white p-4 rounded-2xl flex flex-col items-center gap-2 hover:border-zinc-500 transition-all active:scale-95 h-full justify-center">
              <Settings2 className="w-7 h-7 text-zinc-400" />
              <span className="font-black text-base">Admin</span>
              <span className="text-sm text-zinc-500">Painel completo</span>
            </div>
          </Link>
        </div>

      </main>

      {/* ── MODAL DEMO ── */}
      {showDemoModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70">
          <div className="bg-zinc-900 border-t border-zinc-800 rounded-t-3xl w-full max-w-md p-6 space-y-3">
            <div className="flex justify-between items-center mb-1">
              <div>
                <h2 className="text-lg font-black text-white">Modo Demonstração</h2>
                <p className="text-sm text-zinc-500">Simule a experiência de cada perfil</p>
              </div>
              <button onClick={() => setShowDemoModal(false)} className="p-2 hover:bg-zinc-800 rounded-xl">
                <X className="w-5 h-5 text-zinc-400" />
              </button>
            </div>

            {([
              { label: 'Empresa / Loja', desc: 'PDV, estoque, perfil', href: '/pdv/colaborativo', icon: <Building2 className="w-6 h-6 text-blue-400" /> },
              { label: 'Profissional Liberal', desc: 'Perfil, catálogo, planos', href: '/profissional/catalogo', icon: <User className="w-6 h-6 text-violet-400" /> },
              { label: 'Ambulante / PDV Móvel', desc: 'Vendas rápidas', href: '/ambulantes', icon: <span className="text-2xl">🛵</span> },
              { label: 'Usuário Geral', desc: 'Busca, carteira, indicações', href: '/', icon: <Users className="w-6 h-6 text-zinc-400" /> },
            ]).map(item => (
              <Link key={item.label} href={item.href} onClick={() => setShowDemoModal(false)}>
                <div className="flex items-center gap-4 p-4 bg-zinc-800 border border-zinc-700 rounded-2xl hover:border-zinc-500 transition-all active:scale-95">
                  <div className="w-10 h-10 bg-zinc-700 rounded-xl flex items-center justify-center flex-shrink-0">
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <p className="font-black text-base text-white">{item.label}</p>
                    <p className="text-sm text-zinc-500">{item.desc}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-zinc-600" />
                </div>
              </Link>
            ))}

            <Link href="/admin/master" onClick={() => setShowDemoModal(false)}>
              <div className="flex items-center gap-4 p-4 bg-zinc-800 border border-indigo-500/30 rounded-2xl hover:border-indigo-500/60 transition-all active:scale-95">
                <Settings2 className="w-6 h-6 text-indigo-400" />
                <div className="flex-1">
                  <p className="font-black text-base text-white">Admin Master</p>
                  <p className="text-sm text-zinc-500">Dashboard com todos os dados</p>
                </div>
                <ChevronRight className="w-5 h-5 text-zinc-600" />
              </div>
            </Link>

            <div className="border-t border-zinc-800 pt-3">
              <Link href="/instalar" onClick={() => setShowDemoModal(false)}>
                <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border border-yellow-500/30 rounded-2xl hover:border-yellow-500/60 transition-all active:scale-95">
                  <Download className="w-6 h-6 text-yellow-400" />
                  <div className="flex-1">
                    <p className="font-black text-base text-white">Instalar no Celular</p>
                    <p className="text-sm text-zinc-500">QR Code para cada perfil</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-zinc-600" />
                </div>
              </Link>
            </div>
          </div>
        </div>
      )}

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
                      <div className="p-4 flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-black text-sm">{result.foto}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-black text-base text-white">{result.name}</p>
                          <span className="inline-block text-xs bg-blue-500/20 text-blue-400 font-bold px-2 py-0.5 rounded-full border border-blue-500/20">
                            {result.categoria}
                          </span>
                        </div>
                        {result.locked && <Lock className="w-5 h-5 text-zinc-600 flex-shrink-0" />}
                      </div>

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
    </div>
  )

}
