'use client'

import { Power, MapPin, MessageCircle } from 'lucide-react'

export default function ProfessionalCard({ pro }: { pro: any }) {
  return (
    <div className={`p-6 rounded-3xl border transition-all ${
      pro.is_online ? 'bg-secondary/5 border-secondary shadow-lg shadow-secondary/10' : 'bg-dark-2 border-white/10'
    }`}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gray-700 overflow-hidden">
             <img src={pro.avatar} alt={pro.name} />
          </div>
          <div>
            <h4 className="text-xl font-bold text-white">{pro.name}</h4>
            <p className="text-secondary text-sm font-medium">{pro.category}</p>
          </div>
        </div>
        
        {/* INDICADOR DE STATUS (O PONTO CHAVE) */}
        {pro.is_online && (
          <div className="flex items-center gap-2 bg-secondary/20 px-3 py-1 rounded-full">
            <span className="w-2 h-2 bg-secondary rounded-full animate-ping" />
            <span className="text-secondary text-xs font-black uppercase italic">Aberto Agora</span>
          </div>
        )}
      </div>

      <div className="space-y-3 mb-6">
        <p className="text-gray-400 text-sm line-clamp-2">{pro.description}</p>
        <div className="flex items-center gap-2 text-gray-500 text-xs">
          <MapPin className="w-3 h-3" /> {pro.address}
        </div>
      </div>

      {/* Valor da Diária e Botão */}
      <div className="flex items-center justify-between border-t border-white/5 pt-4">
        <div>
          <p className="text-[10px] text-gray-500 uppercase font-bold">Diária a partir de</p>
          <p className="text-xl font-black text-white">R$ {pro.daily_rate}</p>
        </div>
        
        <button className="flex items-center gap-2 bg-white text-dark-1 px-6 py-3 rounded-xl font-bold hover:bg-secondary hover:text-white transition-all">
          <MessageCircle className="w-5 h-5" /> Contatar
        </button>
      </div>
    </div>
  )
}