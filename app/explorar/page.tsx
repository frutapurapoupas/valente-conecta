'use client'

import { useState } from 'react'
import { Search, MapPin, Zap, Clock, Star } from 'lucide-react'
import ProfessionalCard from '@/components/services/ProfessionalStatus'

export default function ExplorarPage() {
  const [activeFilter, setActiveFilter] = useState('todos')

  return (
    <div className="min-h-screen bg-dark-1 pb-24">
      {/* HEADER DINÂMICO */}
      <header className="p-6 space-y-4 bg-gradient-to-b from-primary/10 to-transparent">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-gray-500 text-sm font-bold uppercase tracking-widest">Você está em</p>
            <h2 className="text-2xl font-black text-white flex items-center gap-2">
              <MapPin className="text-secondary w-5 h-5" /> VALENTE, BA
            </h2>
          </div>
          <div className="w-12 h-12 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center">
             <Zap className="text-yellow-500 fill-yellow-500" />
          </div>
        </div>

        {/* BARRA DE BUSCA "CHIQUE" */}
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-secondary transition-all" />
          <input 
            type="text" 
            placeholder="O que você precisa agora?" 
            className="w-full bg-white/5 border border-white/10 p-5 pl-12 rounded-2xl text-white outline-none focus:border-secondary/50 focus:bg-white/10 transition-all"
          />
        </div>

        {/* FILTROS DE CATEGORIA RÁPIDOS */}
        <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
          {['Todos', 'Borracharia', 'Manicure', 'Aluguel', 'Fretes', 'Mecânico'].map((cat) => (
            <button 
              key={cat}
              onClick={() => setActiveFilter(cat.toLowerCase())}
              className={`px-6 py-2 rounded-full whitespace-nowrap font-bold text-sm transition-all ${
                activeFilter === cat.toLowerCase() 
                ? 'bg-secondary text-white shadow-lg shadow-secondary/20' 
                : 'bg-white/5 text-gray-500 border border-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      {/* SEÇÃO: ABERTOS AGORA (O diferencial para serviços) */}
      <section className="px-6 space-y-6">
        <div className="flex justify-between items-end">
          <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">
            ⚡ Disponíveis Agora
          </h3>
          <span className="text-secondary text-xs font-bold">Ver todos</span>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {/* Aqui mapeamos os profissionais que estão com is_online: true */}
          <ProfessionalCard pro={{
            name: 'Borracharia do Baixinho',
            category: 'Borracharia 24h',
            is_online: true,
            daily_rate: 50.00,
            address: 'Rua Principal, Centro',
            avatar: '/borracharia.jpg'
          }} />
        </div>
      </section>

      {/* SEÇÃO: OFERTAS COM PREÇO BORRADO */}
      <section className="px-6 mt-10 space-y-6">
        <h3 className="text-xl font-black text-white uppercase italic tracking-tighter flex items-center gap-2">
          <Star className="text-primary w-5 h-5 fill-primary" /> Oportunidades
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
          {/* Exemplo de card de oferta com o Paywall de R$ 1,00 */}
          <div className="bg-dark-2 rounded-3xl border border-white/5 p-4 space-y-3">
             <div className="aspect-square bg-gray-800 rounded-2xl overflow-hidden grayscale-[0.5]">
                <img src="/casa-aluguel.jpg" className="w-full h-full object-cover opacity-50" />
             </div>
             <p className="text-white font-bold leading-tight">Aluguel Casa 3 Quartos</p>
             <div className="flex items-center justify-between">
                <span className="text-secondary font-black blur-[4px]">R$ 800</span>
                <button className="text-[10px] bg-white/10 px-2 py-1 rounded-lg text-gray-400">Ver</button>
             </div>
          </div>
        </div>
      </section>
    </div>
  )
}