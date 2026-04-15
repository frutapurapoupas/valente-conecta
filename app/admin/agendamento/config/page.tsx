// app/admin/agendamento/config/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { Settings, DollarSign, Bell, Users, Clock, Save, Eye, EyeOff } from 'lucide-react'

export default function ConfigAgendamentoPage() {
  const [config, setConfig] = useState({
    plano: 'FREE',
    contatoBloqueado: true,
    localizadorBloqueado: true,
    ativarFilaEspera: false,
    ativarPeriodicidade: false,
    periodicidadeDias: 30,
    precoDesbloqueioContato: 0.50
  })
  
  const [salvando, setSalvando] = useState(false)

  const salvarConfig = async () => {
    setSalvando(true)
    try {
      await fetch('/api/profissionais/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      })
      alert('Configurações salvas com sucesso!')
    } catch (error) {
      console.error('Erro ao salvar:', error)
      alert('Erro ao salvar configurações')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-20">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-2xl font-bold mb-2">Configurações do Agendamento</h1>
        <p className="text-zinc-400 mb-8">Gerencie como seu negócio funciona</p>

        {/* Plano Atual */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 mb-6">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-yellow-500" />
            Plano Atual
          </h2>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-2xl font-bold text-yellow-500">
                {config.plano === 'FREE' ? 'Plano Grátis' : config.plano === 'PRO' ? 'Plano PRO' : 'Plano Business'}
              </p>
              <p className="text-sm text-zinc-400 mt-1">
                {config.plano === 'FREE' 
                  ? 'Contatos e localização aparecem borrados para não assinantes'
                  : 'Todos os recursos liberados'}
              </p>
            </div>
            <button className="px-4 py-2 bg-blue-500 rounded-xl text-sm">
              Fazer Upgrade
            </button>
          </div>
        </div>

        {/* Visibilidade (para plano FREE) */}
        {config.plano === 'FREE' && (
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 mb-6">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <EyeOff className="w-5 h-5 text-blue-400" />
              Visibilidade do Perfil
            </h2>
            <div className="space-y-4">
              <label className="flex items-center justify-between cursor-pointer">
                <span>Bloquear contato (telefone/WhatsApp)</span>
                <button
                  onClick={() => setConfig({ ...config, contatoBloqueado: !config.contatoBloqueado })}
                  className={`relative w-12 h-6 rounded-full transition ${config.contatoBloqueado ? 'bg-blue-500' : 'bg-zinc-700'}`}
                >
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition ${config.contatoBloqueado ? 'right-1' : 'left-1'}`} />
                </button>
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span>Bloquear localização no mapa</span>
                <button
                  onClick={() => setConfig({ ...config, localizadorBloqueado: !config.localizadorBloqueado })}
                  className={`relative w-12 h-6 rounded-full transition ${config.localizadorBloqueado ? 'bg-blue-500' : 'bg-zinc-700'}`}
                >
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition ${config.localizadorBloqueado ? 'right-1' : 'left-1'}`} />
                </button>
              </label>
              <div className="pt-4 border-t border-zinc-800">
                <p className="text-sm text-zinc-400">
                  💡 Desbloqueie contato e localização por apenas R$ 0,50 por visualização
                </p>
                <button className="mt-2 px-4 py-2 bg-emerald-500 text-black rounded-xl text-sm font-bold">
                  Desbloquear por R$ 0,50
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Funcionalidades */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 mb-6">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5 text-purple-400" />
            Funcionalidades
          </h2>
          <div className="space-y-4">
            <label className="flex items-center justify-between cursor-pointer">
              <span>Ativar Fila de Espera</span>
              <button
                onClick={() => setConfig({ ...config, ativarFilaEspera: !config.ativarFilaEspera })}
                className={`relative w-12 h-6 rounded-full transition ${config.ativarFilaEspera ? 'bg-blue-500' : 'bg-zinc-700'}`}
              >
                <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition ${config.ativarFilaEspera ? 'right-1' : 'left-1'}`} />
              </button>
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <span>Ativar Lembrete de Periodicidade</span>
              <button
                onClick={() => setConfig({ ...config, ativarPeriodicidade: !config.ativarPeriodicidade })}
                className={`relative w-12 h-6 rounded-full transition ${config.ativarPeriodicidade ? 'bg-blue-500' : 'bg-zinc-700'}`}
              >
                <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition ${config.ativarPeriodicidade ? 'right-1' : 'left-1'}`} />
              </button>
            </label>
            {config.ativarPeriodicidade && (
              <div>
                <label className="text-sm text-zinc-400">Dias para lembrete</label>
                <input
                  type="number"
                  value={config.periodicidadeDias}
                  onChange={(e) => setConfig({ ...config, periodicidadeDias: parseInt(e.target.value) })}
                  className="w-full mt-1 px-4 py-2 bg-zinc-800 rounded-xl"
                />
              </div>
            )}
          </div>
        </div>

        {/* Botão Salvar */}
        <button
          onClick={salvarConfig}
          disabled={salvando}
          className="w-full py-4 bg-blue-500 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Save className="w-5 h-5" />
          {salvando ? 'Salvando...' : 'Salvar Configurações'}
        </button>
      </div>
    </div>
  )
}