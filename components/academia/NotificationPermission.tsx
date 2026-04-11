'use client'

import { useState, useEffect } from 'react'

export default function NotificationPermission() {
  const [showPermission, setShowPermission] = useState(false)
  const [permissionGranted, setPermissionGranted] = useState(false)

  useEffect(() => {
    // Verificar se já pediu permissão antes
    const permissionAsked = localStorage.getItem('academia_notification_permission_asked')
    const permissionStatus = localStorage.getItem('academia_notification_permission')

    if (!permissionAsked && 'Notification' in window) {
      setShowPermission(true)
    } else if (permissionStatus === 'granted') {
      setPermissionGranted(true)
    }
  }, [])

  const requestPermission = async () => {
    if ('Notification' in window) {
      try {
        const permission = await Notification.requestPermission()
        localStorage.setItem('academia_notification_permission', permission)
        localStorage.setItem('academia_notification_permission_asked', 'true')

        if (permission === 'granted') {
          setPermissionGranted(true)
          // Mostrar notificação de teste
          new Notification('🔔 Notificações ativadas!', {
            body: 'Agora você receberá lembretes inteligentes sobre seus treinos.',
            icon: '/favicon.ico'
          })
        }
      } catch (error) {
        console.error('Erro ao solicitar permissão:', error)
      }
    }
    setShowPermission(false)
  }

  const dismissPermission = () => {
    localStorage.setItem('academia_notification_permission_asked', 'true')
    setShowPermission(false)
  }

  if (!showPermission) return null

  return (
    <div className="fixed top-4 left-4 right-4 z-50 bg-indigo-600 text-white p-4 rounded-2xl shadow-xl border border-indigo-500">
      <div className="flex items-start gap-3">
        <div className="text-2xl">🔔</div>
        <div className="flex-1">
          <h4 className="font-bold text-sm mb-1">Ativar Notificações Inteligentes</h4>
          <p className="text-xs text-indigo-100 mb-3">
            Receba lembretes personalizados sobre seus treinos, metas e dicas de saúde baseadas no seu perfil!
          </p>
          <div className="flex gap-2">
            <button
              onClick={requestPermission}
              className="bg-white text-indigo-600 px-4 py-2 rounded-lg text-xs font-bold hover:bg-gray-100 transition"
            >
              Ativar
            </button>
            <button
              onClick={dismissPermission}
              className="text-indigo-200 px-4 py-2 rounded-lg text-xs hover:text-white transition"
            >
              Agora não
            </button>
          </div>
        </div>
        <button
          onClick={dismissPermission}
          className="text-indigo-200 hover:text-white"
        >
          ✕
        </button>
      </div>
    </div>
  )
}