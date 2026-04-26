'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Search, Wallet, QrCode, Bell, Menu, X, Zap, Dumbbell,
  ShoppingBag, Gift, Lock, MapPin, Phone, Mail, Navigation,
  ChevronRight, TrendingDown,
  Building2, Loader2, AlertTriangle, Crown, User, Store, Bike,
  LayoutGrid, Calendar, Megaphone, Package, Truck, Home
} from 'lucide-react'
import { useHomePage } from '@/hooks/useHomePage'
import SmartSearchBar from '@/components/ui/SmartSearchBar'
import OnboardingTutorial from '@/components/ui/OnboardingTutorial'
import { GestaoCard } from '@/components/GestaoCard'
import { PlanoAtivoCard } from '@/components/PlanoAtivoCard'

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
    tipoUsuario,
    isAdmin,
    isAdminMaster,
    isEmpresa,
    isProfissional,
    isUser,
    userData,
    linkIndicacao,
  } = useHomePage()

  const [showTutorial, setShowTutorial] = useState(false)
  const [alertaLocalizador, setAlertaLocalizador] = useState<{ tipo: 'academia' | 'esporte' | 'ambos'; mensagem: string } | null>(null)

  useEffect(() => {
    const viewCount = parseInt(localStorage.getItem('onboarding_view_count') || '0')
    const hasSeenOnboarding = localStorage.getItem('has_seen_onboarding') === 'true'
    
    if (viewCount < 3 && !hasSeenOnboarding) {
      setShowTutorial(true)
    }
  }, [])

  useEffect(() => {
    // Verificar alertas de localizador pendente
    const academiaAlerta = localStorage.getItem('academia_alerta_localizador')
    const esportes = JSON.parse(localStorage.getItem('academia_esportes') || '[]')
    const esportesSemLocalizador = esportes.filter((e: any) => !e.localizadorCapturado)

    if (academiaAlerta === 'true' && esportesSemLocalizador.length > 0) {
      setAlertaLocalizador({
        tipo: 'ambos',
        mensagem: `Você precisa capturar a localização da academia e de ${esportesSemLocalizador.length} esporte(s). Vá até o local e clique em capturar.`
      })
    } else if (academiaAlerta === 'true') {
      setAlertaLocalizador({
        tipo: 'academia',
        mensagem: 'Você precisa capturar a localização da academia. Vá até o local e clique em capturar.'
      })
    } else if (esportesSemLocalizador.length > 0) {
      setAlertaLocalizador({
        tipo: 'esporte',
        mensagem: `Você precisa capturar a localização de ${esportesSemLocalizador.length} esporte(s). Vá até o local e clique em capturar.`
      })
    }
  }, [])

  const handleCloseTutorial = () => {
    setShowTutorial(false)
  }

  const handleDismissTutorial = () => {
    localStorage.setItem('onboarding_view_count', '3')
    localStorage.setItem('has_seen_onboarding', 'true')
    setShowTutorial(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 text-white pb-40 relative overflow-hidden">
      <OnboardingTutorial 
        isVisible={showTutorial}
        onClose={handleCloseTutorial}
        onDismiss={handleDismissTutorial}
      />

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 right-0 w-80 h-80 bg-blue-500/30 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-2000" />
      </div>

      <header className="sticky top-0 z-50 bg-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl">
        <div className="h-16 max-w-2xl mx-auto flex items-center justify-between px-4">
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="relative group">
            <Menu className="w-6 h-6 text-yellow-400 cursor-pointer hover:text-yellow-300 transition-colors" />
          </button>
          
          <div className="font-black uppercase italic text-white text-sm tracking-widest">
            <span>VALENTE CONECTA</span>
          </div>
          
          <Link href="/carteira" className="relative group">
            <Wallet className="w-6 h-6 text-yellow-400 cursor-pointer hover:text-yellow-300 transition-colors" />
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pt-6 space-y-6 relative z-10">
        <GestaoCard />
        
        <PlanoAtivoCard />
        
        <div className="relative">
          <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-[32px] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-yellow-400">Busca Inteligente</span>
              <QrCode className="w-4 h-4 text-zinc-400" />
            </div>
            <SmartSearchBar placeholder="O que procura em Valente?" />
            <div className="text-xs text-zinc-400 text-center">
              <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></span>
              IA ativa · Busca local
            </div>
          </div>
        </div>

        <Link 
          href="/indique-e-ganhe"
          className="group relative flex justify-between items-center p-6 rounded-[32px] bg-gradient-to-r from-yellow-400/90 to-orange-500/90 backdrop-blur-xl border border-white/20 shadow-2xl hover:shadow-yellow-400/25 transition-all duration-300 hover:scale-105"
        >
          <div className="flex items-center gap-3">
            <Gift className="w-8 h-8 text-black" />
            <div>
              <p className="font-black text-black text-lg">Indique e Ganhe</p>
              <p className="text-black/70 text-xs">Bônus ativos</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-black text-black">R$ {balance?.toFixed(2) || '0.00'}</p>
            <p className="text-black/70 text-xs">Saldo</p>
          </div>
        </Link>

        <div className="grid grid-cols-2 gap-4">
          <ActionCard href="/pdv/colaborativo" icon={Store} label="PDV Colaborativo" color="text-emerald-400" />
          <ActionCard href="/catalogo" icon={Package} label="Catálogo" color="text-blue-400" />
          <ActionCard href="/servicos-agendamento" icon={Calendar} label="Serviços com Agendamento" color="text-pink-400" />
          <ActionCard href="/academia/selecao" icon={Dumbbell} label="Academia" color="text-cyan-400" hasAlert={!!alertaLocalizador} alertMessage={alertaLocalizador?.mensagem} />
          <ActionCard href="/planos" icon={Crown} label="Planos" color="text-purple-400" />
          <ActionCard href="/profissional/catalogo" icon={User} label="Área do Profissional" color="text-indigo-400" />
          <ActionCard href="/anuncios" icon={Megaphone} label="Anúncios" color="text-orange-400" />
          <ActionCard href="/ambulantes" icon={Bike} label="Ambulantes" color="text-amber-400" />
          <ActionCard href="/transportes-delivery" icon={Truck} label="Transportes e Delivery" color="text-teal-400" />
          <ActionCard href="/imoveis" icon={Home} label="Imóveis" color="text-rose-400" />
        </div>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white/10 backdrop-blur-2xl border-t border-white/20 shadow-2xl">
        <div className="flex justify-around items-center h-16 max-w-2xl mx-auto px-4">
          <button className="flex flex-col items-center">
            <LayoutGrid className="w-6 h-6 text-yellow-400" />
            <span className="text-[10px] text-zinc-400 mt-1">Menu</span>
          </button>
          
          <Link href="/busca-produtos" className="flex flex-col items-center">
            <Search className="w-6 h-6 text-zinc-400 hover:text-yellow-400 transition-colors" />
            <span className="text-[10px] text-zinc-400 mt-1">Buscar</span>
          </Link>
          
          <Link href="/instalar" className="relative">
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-4 rounded-full text-black -mt-10 shadow-2xl hover:shadow-yellow-400/50 transition-all duration-300 hover:scale-110">
              <QrCode className="w-6 h-6" />
            </div>
          </Link>
          
          <Link href="/notificacoes" className="flex flex-col items-center">
            <Bell className="w-6 h-6 text-zinc-400 hover:text-yellow-400 transition-colors" />
            <span className="text-[10px] text-zinc-400 mt-1">Alertas</span>
          </Link>
          
          <Link href="/carteira" className="flex flex-col items-center">
            <Wallet className="w-6 h-6 text-zinc-400 hover:text-yellow-400 transition-colors" />
            <span className="text-[10px] text-zinc-400 mt-1">Carteira</span>
          </Link>
        </div>
      </nav>
    </div>
  )
}

function ActionCard({ href, icon: Icon, label, color, hasAlert, alertMessage }: { href: string; icon: any; label: string; color: string; hasAlert?: boolean; alertMessage?: string }) {
  return (
    <Link href={href} className="relative group">
      <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-[24px] p-4 flex flex-col items-center justify-center h-28 hover:bg-white/15 transition-all duration-300 group-hover:scale-105">
        {hasAlert && (
          <div className="absolute top-2 right-2 w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center animate-pulse z-10">
            <AlertTriangle className="w-3 h-3 text-white" />
          </div>
        )}
        <Icon className={`w-8 h-8 ${color} mb-2`} />
        <span className="text-xs font-bold text-white/90 text-center">{label}</span>
        {hasAlert && alertMessage && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-orange-500/95 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
            {alertMessage}
          </div>
        )}
      </div>
    </Link>
  )
}