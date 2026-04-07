'use client'

import { useState, useEffect } from 'react'
import { Bell, X } from 'lucide-react'

export default function NotificacaoBanner() {
  const [notificacoesAtivas, setNotificacoesAtivas] = useState(false)
  const [mostrar, setMostrar] = useState(true)

  useEffect(() => {
    // Verificar se já foi solicitado antes
    const jaSolicitado = localStorage.getItem('notificacao_solicitada')
    if (jaSolicitado === 'true') {
      setMostrar(false)
      return
    }
    
    // Verificar se já tem permissão
    if (Notification.permission === 'granted') {
      setNotificacoesAtivas(true)
      setMostrar(false)
    }
  }, [])

  const ativarNotificacoes = async () => {
    if (!('Notification' in window)) {
      alert('Seu navegador não suporta notificações')
      setMostrar(false)
      return
    }
    
    const permission = await Notification.requestPermission()
    
    if (permission === 'granted') {
      setNotificacoesAtivas(true)
      localStorage.setItem('notificacao_solicitada', 'true')
      setMostrar(false)
      alert('✅ Notificações ativadas! Você receberá alertas.')
    } else {
      // Não mostrar mais o banner se o usuário negar
      localStorage.setItem('notificacao_solicitada', 'true')
      setMostrar(false)
      alert('💡 Você pode ativar as notificações mais tarde nas configurações do navegador.\n\nEnquanto isso, as mensagens serão abertas no WhatsApp.')
    }
  }

  // Não mostrar se já foi solicitado ou se já tem permissão
  if (!mostrar || notificacoesAtivas) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 bg-blue-600 text-white p-4 rounded-xl shadow-lg z-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bell className="w-6 h-6" />
          <div>
            <p className="font-bold">Receba notificações</p>
            <p className="text-sm opacity-90">Alertas de vendas e fiado</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={ativarNotificacoes} className="px-3 py-1 bg-white text-blue-600 rounded-lg text-sm font-semibold">
            Ativar
          </button>
          <button onClick={() => setMostrar(false)} className="p-1 hover:bg-white/20 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}