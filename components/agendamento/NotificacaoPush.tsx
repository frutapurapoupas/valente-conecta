'use client'

import { useState, useEffect } from 'react'
import { Bell, CheckCircle, XCircle } from 'lucide-react'

export default function NotificacaoPush() {
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [subscription, setSubscription] = useState<PushSubscription | null>(null)

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission)
    }
  }, [])

  const solicitarPermissao = async () => {
    if (!('Notification' in window)) {
      alert('Seu navegador não suporta notificações')
      return
    }

    const result = await Notification.requestPermission()
    setPermission(result)

    if (result === 'granted') {
      // Registrar service worker para push
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready
        try {
          const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
          })
          setSubscription(subscription)
        } catch (error) {
          console.error('Erro ao subscrever push:', error)
        }
      }
    }
  }

  const enviarNotificacao = (titulo: string, corpo: string) => {
    if (permission === 'granted') {
      new Notification(titulo, { body: corpo, icon: '/icon-192.png' })
    }
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bell className="w-5 h-5 text-yellow-400" />
          <div>
            <h3 className="font-bold text-white">Notificações Push</h3>
            <p className="text-xs text-zinc-500">Receba alertas de confirmação e liberação de horários</p>
          </div>
        </div>
        {permission === 'granted' ? (
          <div className="flex items-center gap-1 text-emerald-400">
            <CheckCircle className="w-4 h-4" />
            <span className="text-xs">Ativado</span>
          </div>
        ) : permission === 'denied' ? (
          <div className="flex items-center gap-1 text-red-400">
            <XCircle className="w-4 h-4" />
            <span className="text-xs">Bloqueado</span>
          </div>
        ) : (
          <button onClick={solicitarPermissao} className="px-3 py-1 bg-yellow-500 text-black rounded-lg text-xs font-bold hover:bg-yellow-400 transition">
            Ativar
          </button>
        )}
      </div>
    </div>
  )
}