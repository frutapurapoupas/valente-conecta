'use client'

import { useState } from 'react'
import { Settings2, Unlock, Users, ShieldAlert } from 'lucide-react'

export default function GovernancePanel() {
  const [globalLimit, setGlobalLimit] = useState(50)

  return (
    <div className="p-8 bg-dark-2 rounded-3xl border border-primary/20 space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-white italic">GOVERNANÇA DE CRÉDITOS</h2>
          <p className="text-gray-400 text-sm">Controle as regras de resgate do Banco Mãe.</p>
        </div>
        <ShieldAlert className="text-primary w-10 h-10 animate-pulse" />
      </header>

      {/* CONTROLE GLOBAL */}
      <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
        <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
          <Settings2 className="w-4 h-4" /> Limite Global de Resgate Mensal
        </label>
        <div className="flex items-center gap-6 mt-4">
          <input 
            type="range" 
            min="0" max="1000" step="10"
            value={globalLimit}
            onChange={(e) => setGlobalLimit(Number(e.target.value))}
            className="flex-1 accent-primary"
          />
          <span className="text-3xl font-black text-white">R$ {globalLimit}</span>
        </div>
        <button className="mt-4 text-xs font-bold text-primary underline">Salvar para todos os usuários</button>
      </div>

      {/* EXCEÇÕES PONTUAIS */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Unlock className="text-secondary w-5 h-5" /> Liberar Trava por Usuário
        </h3>
        <div className="relative">
          <input 
            placeholder="Buscar usuário por Nome ou CPF..." 
            className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white outline-none focus:border-secondary"
          />
        </div>
        
        {/* Lista de Exceções Ativas */}
        <div className="space-y-2">
          <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg border-l-4 border-secondary">
            <span className="text-sm text-white">João da Silva (Lojista Premium)</span>
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-secondary">LIMITE: ILIMITADO</span>
              <button className="text-red-500 text-xs hover:underline">Remover Exceção</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}