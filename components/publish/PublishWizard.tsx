'use client'

import { useState } from 'react'
import { Camera, Calendar, MapPin, DollarSign, Power } from 'lucide-react'

export default function PublishWizard({ type }: { type: 'offer' | 'professional' }) {
  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8 animate-in slide-in-from-bottom-4">
      <header>
        <h1 className="text-3xl font-black text-white">
          {type === 'offer' ? 'O que você quer anunciar?' : 'Configurar meu Catálogo'}
        </h1>
        <p className="text-gray-400">Preencha os campos obrigatórios abaixo.</p>
      </header>

      <section className="bg-dark-2 border border-white/10 rounded-3xl p-8 space-y-6">
        {/* Campo Obrigatório: Nome */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-primary uppercase">Título do Anúncio</label>
          <input 
            placeholder="Ex: Aluguel de Casa, Faxina Diária, Venda de Moto..."
            className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-white focus:border-secondary outline-none transition-all"
          />
        </div>

        {/* Upload de Foto (Obrigatória) */}
        <div className="grid grid-cols-2 gap-4">
          <div className="aspect-square bg-white/5 border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center hover:border-secondary cursor-pointer group transition-all">
            <Camera className="text-gray-500 group-hover:text-secondary mb-2" />
            <span className="text-xs text-gray-500 group-hover:text-white">Adicionar Foto</span>
          </div>
          {type === 'professional' && (
             <div className="aspect-square bg-white/5 border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center text-gray-500">
                <span className="text-2xl font-bold">+</span>
                <span className="text-xs">Portfólio</span>
             </div>
          )}
        </div>

        {/* Campos Específicos para Profissionais */}
        {type === 'professional' && (
          <div className="space-y-6 pt-4 border-t border-white/10">
            <div className="flex items-center justify-between p-4 bg-secondary/10 rounded-2xl border border-secondary/20">
              <div className="flex items-center gap-3">
                <Power className="text-secondary" />
                <span className="text-white font-bold">Estou em funcionamento</span>
              </div>
              <input type="checkbox" className="w-6 h-6 accent-secondary" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-secondary uppercase">Valor da Diária (R$)</label>
              <input type="number" className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-white" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-secondary uppercase flex items-center gap-2">
                <Calendar className="w-4 h-4" /> Minha Agenda (Próximos 120 dias)
              </label>
              <div className="p-4 bg-white/5 rounded-2xl text-xs text-gray-400">
                O sistema gerencia sua agenda automaticamente. Você define 120 dias, mas os clientes só enxergam a disponibilidade dos próximos 60.
              </div>
            </div>
          </div>
        )}

        {/* Preço com Paywall (Para Ofertas) */}
        {type === 'offer' && (
           <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl">
              <p className="text-yellow-500 text-xs font-bold mb-2 uppercase italic">Visualização Segura</p>
              <p className="text-white text-sm">O preço aparecerá borrado para os usuários. O desbloqueio custará 1 Moeda Conecta.</p>
           </div>
        )}
      </section>

      <button className="w-full py-5 bg-gradient-to-r from-primary to-secondary rounded-2xl text-white font-black text-xl shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all">
        PUBLICAR AGORA
      </button>
    </div>
  )
}