'use client'

import { useState, useEffect } from 'react'
import { Bell, X } from 'lucide-react'

export default function NotificacaoBanner() {
  const [notificacoesAtivas, setNotificacoesAtivas] = useState(false)
  const [mostrar, setMostrar] = useState(true)
  const [mensagem, setMensagem] = useState<string | null>(null)
  const [bloqueio, setBloqueio] = useState<string | null>(null)

  useEffect(() => {
    // HTTPS obrigatório para notificações
    if (typeof window !== 'undefined' && window.location.protocol !== 'https:') {
      setBloqueio('As notificações só funcionam em sites seguros (HTTPS).')
      return
    }
    // Verificar suporte
    if (typeof window !== 'undefined' && !('Notification' in window)) {
      setBloqueio('Seu navegador não suporta notificações.')
      return
    }
    // Verificar se já foi solicitado antes
    const jaSolicitado = localStorage.getItem('notificacao_solicitada')
    if (jaSolicitado === 'true') {
      setMostrar(false)
      return
    }
    // Verificar permissão
    if (Notification.permission === 'granted') {
      setNotificacoesAtivas(true)
      setMostrar(false)
      return
    }
    if (Notification.permission === 'denied') {
      setBloqueio('As notificações estão bloqueadas no navegador. Vá nas configurações do navegador e permita notificações para este site.')
      return
    }
  }, [])

  const ativarNotificacoes = async () => {
    try {
      if (!('Notification' in window)) {
        setBloqueio('Seu navegador não suporta notificações.')
        setMostrar(false)
        return
      }
      const permission = await Notification.requestPermission()
      if (permission === 'granted') {
        setNotificacoesAtivas(true)
        localStorage.setItem('notificacao_solicitada', 'true')
        setMostrar(false)
        setMensagem('✅ Notificações ativadas! Você receberá alertas.')
      } else if (permission === 'denied') {
        setBloqueio('As notificações estão bloqueadas no navegador. Vá nas configurações do navegador e permita notificações para este site.')
        localStorage.setItem('notificacao_solicitada', 'true')
        setMostrar(false)
      } else {
        setMensagem('💡 Você pode ativar as notificações mais tarde nas configurações do navegador. Enquanto isso, as mensagens serão abertas no WhatsApp.')
        localStorage.setItem('notificacao_solicitada', 'true')
        setMostrar(false)
      }
    } catch (e) {
      setBloqueio('Ocorreu um erro ao tentar ativar as notificações. Tente novamente ou use outro navegador.')
      setMostrar(false)
    }
  }

  // Não mostrar se já foi solicitado ou se já tem permissão
  if (!mostrar || notificacoesAtivas) return mensagem ? (
    <div className="fixed bottom-4 left-4 right-4 bg-green-600 text-white p-4 rounded-xl shadow-lg z-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bell className="w-6 h-6" />
          <div>
            <p className="font-bold">{mensagem}</p>
          </div>
        </div>
        <button onClick={() => setMensagem(null)} className="p-1 hover:bg-white/20 rounded-lg">
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  ) : null

  if (bloqueio) {
    return (
      <div className="fixed bottom-4 left-4 right-4 bg-yellow-700 text-white p-4 rounded-xl shadow-lg z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell className="w-6 h-6" />
            <div>
              <p className="font-bold">Notificações indisponíveis</p>
              <p className="text-sm opacity-90">{bloqueio}</p>
            </div>
          </div>
          <button onClick={() => setBloqueio(null)} className="p-1 hover:bg-white/20 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    )
  }

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