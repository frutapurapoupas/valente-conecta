// components/ClientLayout.tsx
'use client'

import { useEffect, useState } from 'react'
import { Download, X } from 'lucide-react'

interface ClientLayoutProps {
  children: React.ReactNode
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showInstallBanner, setShowInstallBanner] = useState(false)

  useEffect(() => {
    // Handler para instalação do PWA
    const handleBeforeInstallPrompt = (e: Event) => {
      // Previne o comportamento padrão
      e.preventDefault()
      
      // Armazena o evento para usar depois
      setDeferredPrompt(e)
      
      // Verifica se já mostramos o banner antes
      const hasShownBanner = localStorage.getItem('pwa-banner-shown')
      const hasInstalled = localStorage.getItem('pwa-installed')
      
      if (!hasShownBanner && !hasInstalled) {
        // Mostra o banner após 5 segundos
        setTimeout(() => {
          setShowInstallBanner(true)
        }, 5000)
      }
    }

    // Verificar se já está instalado (modo standalone)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    if (isStandalone) {
      localStorage.setItem('pwa-installed', 'true')
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    // Mostra o prompt de instalação
    deferredPrompt.prompt()
    
    // Aguarda a escolha do usuário
    const { outcome } = await deferredPrompt.userChoice
    
    if (outcome === 'accepted') {
      console.log('Usuário instalou o PWA')
      localStorage.setItem('pwa-installed', 'true')
    }
    
    // Limpa o prompt
    setDeferredPrompt(null)
    setShowInstallBanner(false)
    localStorage.setItem('pwa-banner-shown', 'true')
  }

  const handleCloseBanner = () => {
    setShowInstallBanner(false)
    localStorage.setItem('pwa-banner-shown', 'true')
  }

  return (
    <>
      {children}
      
      {/* Banner customizado de instalação do PWA */}
      {showInstallBanner && (
        <div className="fixed bottom-20 left-4 right-4 z-50 animate-in slide-in-from-bottom-10 duration-300 md:left-auto md:right-4 md:bottom-24 md:w-96">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-4 shadow-2xl border border-white/20 relative">
            {/* Botão fechar */}
            <button
              onClick={handleCloseBanner}
              className="absolute top-2 right-2 text-white/60 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
            
            <div className="flex items-center gap-3">
              {/* Ícone */}
              <div className="bg-white/20 p-2 rounded-xl">
                <Download className="w-6 h-6 text-white" />
              </div>
              
              {/* Texto */}
              <div className="flex-1">
                <h3 className="text-white font-bold text-sm">Instale o Valente Conecta</h3>
                <p className="text-white/80 text-xs">Tenha acesso rápido como um app</p>
              </div>
              
              {/* Botão instalar */}
              <button
                onClick={handleInstallClick}
                className="px-4 py-2 bg-white text-blue-600 rounded-xl text-sm font-bold hover:bg-white/90 transition-all transform hover:scale-105"
              >
                Instalar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Estilos para animação */}
      <style jsx global>{`
        @keyframes slideInFromBottom {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        .animate-in {
          animation: slideInFromBottom 0.3s ease-out;
        }
      `}</style>
    </>
  )
}