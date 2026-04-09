'use client'

import { useState } from 'react'
import { Camera, Calendar, Check, Clock, Trash2 } from 'lucide-react'

export default function MeuCatalogoPage() {
  const [images, setImages] = useState<string[]>([])
  const [isOnline, setIsOnline] = useState(false)

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-10 pb-24">
      {/* HEADER: Status de Funcionamento */}
      <section className="flex flex-col md:flex-row justify-between items-center bg-dark-2 p-8 rounded-3xl border border-white/10 gap-6">
        <div>
          <h1 className="text-3xl font-black text-white italic">MEU CATÁLOGO</h1>
          <p className="text-gray-400">Gerencie como os clientes veem seu serviço.</p>
        </div>
        
        <button 
          onClick={() => setIsOnline(!isOnline)}
          className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black transition-all ${
            isOnline 
            ? 'bg-secondary text-white shadow-lg shadow-secondary/30 scale-105' 
            : 'bg-white/5 text-gray-500 border border-white/10'
          }`}
        >
          <Clock className={isOnline ? 'animate-pulse' : ''} />
          {isOnline ? 'ESTOU EM FUNCIONAMENTO' : 'ESTOU FECHADO'}
        </button>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* PORTFÓLIO: Upload de Fotos */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Camera className="text-primary" /> Fotos do Serviço
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {images.map((img, i) => (
              <div key={i} className="relative aspect-square rounded-xl overflow-hidden group">
                <img src={img} className="w-full h-full object-cover" />
                <button className="absolute inset-0 bg-red-500/80 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                  <Trash2 className="text-white w-5 h-5" />
                </button>
              </div>
            ))}
            <label className="aspect-square bg-white/5 border-2 border-dashed border-white/20 rounded-xl flex items-center justify-center cursor-pointer hover:border-primary transition-all">
              <span className="text-gray-500 text-2xl">+</span>
              <input type="file" className="hidden" multiple />
            </label>
          </div>
        </div>

        {/* AGENDA E VALORES */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Calendar className="text-secondary" /> Gestão de Agenda
          </h3>
          <div className="bg-white/5 p-6 rounded-3xl border border-white/10 space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Valor da Diária/Serviço</label>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-2xl font-bold text-white">R$</span>
                <input type="number" placeholder="0,00" className="bg-transparent text-3xl font-black text-white outline-none w-full" />
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 text-sm text-gray-400">
              <p>Agenda configurada para os próximos **120 dias**.</p>
              <p className="text-secondary mt-1">💡 Clientes só podem agendar para os próximos 60 dias.</p>
              <button className="mt-4 w-full py-3 bg-white/5 border border-white/10 rounded-xl text-white font-bold hover:bg-white/10">
                Bloquear Datas Específicas
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* BOTÃO SALVAR: Sempre visível no mobile */}
      <div className="fixed bottom-6 left-6 right-6 md:relative md:bottom-0 md:left-0 md:right-0">
        <button className="w-full py-5 bg-gradient-to-r from-primary to-secondary rounded-2xl text-white font-black text-xl shadow-2xl">
          SALVAR ALTERAÇÕES
        </button>
      </div>
    </div>
  )
}