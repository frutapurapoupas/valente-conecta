'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Search, Wallet, Bell, Menu, LayoutGrid,
  CalendarClock, Package, Megaphone,
  Truck, ArrowRightLeft, UserPlus, Sparkles,
  Share2, Dumbbell, BookOpen, Users, Store
} from 'lucide-react'

import { useHomePage } from '@/hooks/useHomePage'
import { ActionCard } from '@/components/ui/ActionCard'
import SmartSearchBar from '@/components/ui/SmartSearchBar'
import OnboardingTutorial from '@/components/ui/OnboardingTutorial'

export default function HomePage() {
  const { isMenuOpen, setIsMenuOpen, balance } = useHomePage()
  const [isClient, setIsClient] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)

  useEffect(() => {
    setIsClient(true)

    const viewCount = parseInt(localStorage.getItem('onboarding_view_count') || '0')
    const hasSeenOnboarding = localStorage.getItem('has_seen_onboarding') === 'true'

    if (!hasSeenOnboarding && viewCount < 3) {
      setShowOnboarding(true)
    }
  }, [])

  const handleOnboardingClose = () => setShowOnboarding(false)
  const handleOnboardingDismiss = () => {
    setShowOnboarding(false)
    localStorage.setItem('has_seen_onboarding', 'true')
  }

  if (!isClient) return <div className="min-h-screen bg-black" />

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-40">

      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800">
        <div className="h-16 max-w-2xl mx-auto flex items-center justify-between px-4">

          <Menu
            className="w-6 h-6 text-yellow-500"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          />

          <div className="font-black uppercase italic text-yellow-500 text-sm tracking-widest">
            Valente Conecta
          </div>

          <Bell className="w-6 h-6 text-zinc-400" />
        </div>
      </header>

      {/* CONTAINER */}
      <main className="max-w-2xl mx-auto px-4 pt-6 space-y-6">

        {/* SEARCH HERO */}
        <section className="relative">
          <div className="absolute inset-0 bg-blue-600 blur-3xl opacity-30 rounded-[28px]" />
          <div className="relative bg-blue-600 rounded-[28px] p-5 shadow-xl space-y-3">

            <div className="flex items-center gap-2 text-xs font-black uppercase">
              <Sparkles className="w-4 h-4" />
              Busca Inteligente
            </div>

            <SmartSearchBar placeholder="O que procura em Valente?" />
          </div>
        </section>

        {/* INDICAÇÃO */}
        <Link
          href="/indique-e-ganhe"
          className="flex justify-between items-center p-5 rounded-[28px] bg-gradient-to-r from-yellow-500 to-orange-600 text-black"
        >
          <div className="flex items-center gap-3">
            <Share2 className="w-6 h-6" />
            <div className="leading-tight">
              <p className="font-black uppercase">Indique e Ganhe</p>
              <p className="text-xs opacity-80">Bônus ativos</p>
            </div>
          </div>
          <ArrowRightLeft className="w-5 h-5" />
        </Link>

        {/* SALDO */}
        <section className="bg-zinc-900 border border-zinc-800 rounded-[28px] p-5 flex justify-between items-center">
          <div>
            <p className="text-xs text-zinc-500 uppercase">Saldo</p>
            <p className="text-3xl font-black text-emerald-500">
              R$ {balance?.toFixed(2) || '0,00'}
            </p>
          </div>
          <Wallet className="w-7 h-7 text-zinc-500" />
        </section>

        {/* GRID ACTIONS */}
        <section className="grid grid-cols-2 gap-4">
          <ActionCard href="/pdv" icon={Store} label="PDV Colaborativo" color="text-emerald-500" />
          <ActionCard href="/catalogo" icon={BookOpen} label="Catálogo" color="text-pink-500" />
          <ActionCard href="/servicos-agendamento" icon={CalendarClock} label="Agendamentos" color="text-blue-400" />
          <ActionCard href="/academia" icon={Dumbbell} label="Academia" color="text-cyan-500" />
          <ActionCard href="/planos" icon={Package} label="Planos" color="text-purple-500" />
          <ActionCard href="/profissionais" icon={Users} label="Profissionais" color="text-indigo-500" />
          <ActionCard href="/anuncios" icon={Megaphone} label="Anúncios" color="text-orange-500" />
          <ActionCard href="/ambulantes" icon={Truck} label="Ambulantes" color="text-zinc-400" />
        </section>
      </main>

      {/* ONBOARDING */}
      <OnboardingTutorial
        isVisible={showOnboarding}
        onClose={handleOnboardingClose}
        onDismiss={handleOnboardingDismiss}
      />

      {/* FOOTER */}
      <nav className="fixed bottom-0 left-0 right-0 bg-zinc-950/90 backdrop-blur-xl border-t border-zinc-800">
        <div className="max-w-2xl mx-auto flex justify-between items-center px-6 py-4">

          <LayoutGrid className="w-6 h-6 text-yellow-500" />
          <ArrowRightLeft className="w-6 h-6 text-zinc-500" />

          <div className="bg-yellow-500 p-4 rounded-full text-black -mt-10 shadow-xl">
            <Search className="w-7 h-7" />
          </div>

          <Wallet className="w-6 h-6 text-zinc-500" />
          <UserPlus className="w-6 h-6 text-zinc-500" />

        </div>
      </nav>
    </div>
  )
}