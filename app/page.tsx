'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Search, Wallet, Bell, Menu, LayoutGrid, GraduationCap, 
  CalendarClock, Package, Megaphone, ShoppingBag, 
  UserSquare2, Truck, ArrowRightLeft, UserPlus, Sparkles, Share2, Mic, MicOff 
} from 'lucide-react'
import { useHomePage } from '@/hooks/useHomePage'
import { useVoiceSearch } from '@/hooks/useVoiceSearch'

const ActionCard = ({ href, icon: Icon, label, color }: { href: string, icon: any, label: string, color: string }) => (
  <Link href={href} className="flex flex-col items-center justify-center p-6 bg-zinc-900 border border-zinc-800 rounded-[32px] h-44 active:scale-95 transition-all w-full shadow-lg">
    <div className={`p-4 rounded-2xl bg-white/5 ${color} mb-4`}>
      <Icon className="w-8 h-8" />
    </div>
    <span className="text-[11px] font-black uppercase text-zinc-300 text-center leading-tight tracking-tighter italic">
      {label}
    </span>
  </Link>
)

export default function HomePage() {
  const { isMenuOpen, setIsMenuOpen, balance } = useHomePage()
  const [searchTerm, setSearchTerm] = useState('')
  const [isClient, setIsClient] = useState(false)

  const { isListening, toggleListening } = useVoiceSearch((text, data) => {
    setSearchTerm(text)
    window.location.href = `/explorar?q=${encodeURIComponent(text)}&city=valente&mode=priority`
  })

  useEffect(() => { setIsClient(true) }, [])
  if (!isClient) return <div className="min-h-screen bg-black" />

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-40 font-sans">
      <header className="sticky top-0 z-50 bg-zinc-950/95 border-b border-zinc-800/50 h-16 flex items-center justify-between px-4 max-w-2xl mx-auto backdrop-blur-md">
        <Menu className="w-6 h-6 text-yellow-500 cursor-pointer" onClick={() => setIsMenuOpen(!isMenuOpen)} />
        <div className="text-center font-black uppercase italic bg-yellow-500 text-black px-4 py-1 rounded-sm shadow-[4px_4px_0px_#854d0e] skew-x-[-12deg]">
          Valente Conecta
        </div>
        <Bell className="w-6 h-6 text-zinc-400" />
      </header>

      <main className="max-w-2xl mx-auto px-4 pt-6 flex flex-col gap-5">
        
        <section className="relative">
          <div className="absolute inset-0 bg-blue-600 rounded-[32px] blur-3xl opacity-20" />
          <div className="relative flex flex-col gap-3 p-5 bg-zinc-900 border-[6px] border-blue-600 rounded-[32px] shadow-2xl">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className={`w-4 h-4 ${isListening ? 'text-red-500 animate-ping' : 'text-blue-400'}`} />
              <span className="text-[10px] font-black uppercase text-blue-400 italic">
                {isListening ? 'Ouvindo...' : 'Busca Inteligente Valente'}
              </span>
            </div>

            <div className="relative flex items-center bg-zinc-950 border-[3px] border-blue-600 rounded-2xl min-h-[64px] overflow-visible">
              <div className="flex-none pl-4 text-zinc-500">
                <Search className="w-5 h-5" />
              </div>
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="O que procura em Valente?" 
                className="flex-1 bg-transparent border-none outline-none text-white text-base font-bold px-3 py-4"
              />
              <button 
                type="button" 
                onClick={toggleListening} 
                className={`flex-none pr-4 flex items-center justify-center transition-all ${isListening ? 'text-red-500 scale-125' : 'text-blue-500'}`}
              >
                {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </section>

        <section>
          <Link href="/indique" className="flex items-center justify-between p-6 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-[32px] shadow-xl">
            <div className="flex items-center gap-4">
              <div className="bg-black/10 p-4 rounded-2xl text-black shadow-inner"><Share2 className="w-7 h-7" /></div>
              <div className="flex flex-col text-black font-black uppercase leading-tight italic">
                <span className="text-xl tracking-tighter italic">Indique e Ganhe</span>
                <span className="text-[11px] not-italic font-bold opacity-80">R$ 5,00 por indicação</span>
              </div>
            </div>
            <ArrowRightLeft className="w-5 h-5 text-black mr-2" />
          </Link>
        </section>

        <section className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-[32px] flex justify-between items-center shadow-inner">
          <div>
            <p className="text-zinc-500 text-[10px] uppercase font-black mb-1 italic tracking-widest">Saldo Disponível</p>
            <p className="text-3xl font-black text-emerald-500 italic tracking-tighter">R$ {balance?.toFixed(2) || '0,00'}</p>
          </div>
          <Wallet className="w-7 h-7 text-zinc-500" />
        </section>

        <section className="grid grid-cols-2 gap-4">
          <ActionCard href="/pdv" icon={LayoutGrid} label="PDV Colaborativo" color="text-emerald-500" />
          <ActionCard href="/admin/agendamento" icon={CalendarClock} label="Serviços" color="text-blue-400" />
          <ActionCard href="/planos" icon={Package} label="Planos da Loja" color="text-purple-500" />
          <ActionCard href="/anuncios" icon={Megaphone} label="Ofertas & Ads" color="text-orange-500" />
          <ActionCard href="/catalogo" icon={ShoppingBag} label="Catálogo Digital" color="text-pink-500" />
          <ActionCard href="/academia" icon={GraduationCap} label="Academia Valente" color="text-cyan-500" />
          <ActionCard href="/admin/profissionais" icon={UserSquare2} label="Profissionais" color="text-indigo-500" />
          <ActionCard href="/ambulantes" icon={Truck} label="Rede Ambulantes" color="text-zinc-400" />
        </section>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-zinc-950/90 border-t border-zinc-800/80 p-6 z-50 backdrop-blur-xl">
        <div className="max-w-2xl mx-auto flex justify-between items-center px-6">    
          <Link href="/"><LayoutGrid className="w-6 h-6 text-yellow-500" /></Link>    
          <Link href="/financeiro" className="text-zinc-500"><ArrowRightLeft className="w-6 h-6" /></Link>
          <div className="relative -mt-16 bg-yellow-500 p-5 rounded-full text-black shadow-2xl border-[6px] border-zinc-950 active:scale-90 transition-all">
            <Search className="w-8 h-8 stroke-[3px]" />
          </div>
          <Link href="/pagamentos" className="text-zinc-500"><Wallet className="w-6 h-6" /></Link>
          <Link href="/perfil" className="text-zinc-500"><UserPlus className="w-6 h-6" /></Link>  
        </div>
      </nav>
    </div>
  )
}