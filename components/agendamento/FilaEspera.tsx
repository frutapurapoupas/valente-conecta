// components/agendamento/FilaEspera.tsx
'use client'

import { useState, useEffect } from 'react'
import { Users, Bell, Volume2, VolumeX } from 'lucide-react'
import { usePushNotification } from '@/hooks/usePushNotification'

interface FilaEsperaProps {
  profissionalId: string
  agendamentos: any[]
  onChamarCliente: (cliente: any) => void
}

export function FilaEspera({ profissionalId, agendamentos, onChamarCliente }: FilaEsperaProps) {
  const [somAtivo, setSomAtivo] = useState(true)
  const { permission, requestPermission, sendNotification } = usePushNotification()
  
  const fila = agendamentos
    .filter(a => a.status === 'PENDENTE')
    .sort((a, b) => (a.posicao_fila || 0) - (b.posicao_fila || 0))

  const chamarCliente = (cliente: any) => {
    onChamarCliente(cliente)
    
    // Tocar som
    if (somAtivo) {
      const audio = new Audio('/sounds/notification.mp3')
      audio.play()
    }
    
    // Notificação push
    sendNotification(`Chamando ${cliente.cliente_nome}`, {
      body: `Posição ${cliente.posicao_fila}º - Por favor, dirija-se ao atendimento`,
      icon: '/icon.png',
      vibrate: [200, 100, 200]
    })
  }

  useEffect(() => {
    requestPermission()
  }, [])

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Users className="w-6 h-6 text-yellow-500" />
          <h2 className="text-xl font-bold">Fila de Espera</h2>
          <span className="bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded-full text-sm">
            {fila.length} aguardando
          </span>
        </div>
        <button
          onClick={() => setSomAtivo(!somAtivo)}
          className="p-2 hover:bg-zinc-800 rounded-xl"
        >
          {somAtivo ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
        </button>
      </div>

      <div className="space-y-3">
        {fila.map((item, index) => (
          <div
            key={item.id}
            className="flex items-center justify-between p-4 bg-zinc-800/30 rounded-xl hover:bg-zinc-800/50 transition"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center">
                <span className="text-xl font-bold text-yellow-500">{index + 1}º</span>
              </div>
              <div>
                <p className="font-bold">{item.cliente_nome}</p>
                <p className="text-sm text-zinc-400">{item.servico?.nome}</p>
              </div>
            </div>
            <button
              onClick={() => chamarCliente(item)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-400 rounded-xl hover:bg-blue-500/30 transition"
            >
              <Bell className="w-4 h-4" />
              Chamar
            </button>
          </div>
        ))}

        {fila.length === 0 && (
          <div className="text-center py-8 text-zinc-500">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Nenhum cliente na fila</p>
          </div>
        )}
      </div>
    </div>
  )
}