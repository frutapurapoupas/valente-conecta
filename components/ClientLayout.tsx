'use client'

import { useEffect } from 'react'

export default function ClientLayout({ children }: { children: React.ReactNode }) {

  useEffect(() => {
    // Registrar Service Worker para PWA
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then(registration => {
        console.log('Service Worker registrado com sucesso')

        // Atualização automática: detecta nova versão e força reload
        registration.onupdatefound = () => {
          const installingWorker = registration.installing
          if (installingWorker) {
            installingWorker.onstatechange = () => {
              if (installingWorker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                  // Nova versão disponível: força reload automático
                  window.location.reload()
                }
              }
            }
          }
        }
      }).catch(error => {
        console.log('Erro ao registrar Service Worker:', error)
      })
    }

    // Solicitar instalação do PWA
    let deferredPrompt: any = null
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault()
      deferredPrompt = e
      // Mostrar banner de instalação apenas se o usuário não tiver instalado
      const hasShownBanner = localStorage.getItem('install_banner_shown')
      if (!hasShownBanner) {
        setTimeout(() => {
          const installBanner = document.createElement('div')
          installBanner.id = 'pwa-install-banner'
          installBanner.innerHTML = `
            <div style="position:fixed;bottom:20px;left:20px;right:20px;background:#6366f1;color:white;padding:16px;border-radius:16px;display:flex;justify-content:space-between;align-items:center;z-index:1000;box-shadow:0 4px 12px rgba(0,0,0,0.15)">
              <div>
                <strong style="font-size:16px">📱 Instalar App</strong>
                <p style="font-size:12px;margin:4px 0 0 0;opacity:0.9">Adicione à tela inicial para acesso rápido</p>
              </div>
              <button id="installPwaBtn" style="background:white;color:#6366f1;border:none;padding:8px 16px;border-radius:8px;font-weight:bold;cursor:pointer">Instalar</button>
            </div>
          `
          document.body.appendChild(installBanner)
          localStorage.setItem('install_banner_shown', 'true')
          document.getElementById('installPwaBtn')?.addEventListener('click', async () => {
            if (deferredPrompt) {
              deferredPrompt.prompt()
              const { outcome } = await deferredPrompt.userChoice
              if (outcome === 'accepted') {
                console.log('Usuário aceitou instalação do PWA')
              }
              deferredPrompt = null
            }
            document.getElementById('pwa-install-banner')?.remove()
          })
        }, 3000)
      }
    })
  }, [])

  return <>{children}</>
}