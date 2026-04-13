
'use client'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function InvitePage({ params }) {
  const router = useRouter()
  const { id } = params

  useEffect(() => {
    // Detecta se está no app (deep link), senão redireciona para loja/app web
    const userAgent = typeof window !== 'undefined' ? window.navigator.userAgent : ''
    const isAndroid = /Android/i.test(userAgent)
    const isIOS = /iPhone|iPad|iPod/i.test(userAgent)
    const appLink = `valenteapp://invite/${id}`
    const webLink = `/cadastro?invite=${id}`
    const playStore = 'https://play.google.com/store/apps/details?id=br.com.valente.app'
    const appStore = 'https://apps.apple.com/app/id0000000000' // Trocar pelo id real

    // Tenta abrir o app
    if (isAndroid) {
      window.location.href = appLink
      setTimeout(() => {
        window.location.href = playStore
      }, 1200)
    } else if (isIOS) {
      window.location.href = appLink
      setTimeout(() => {
        window.location.href = appStore
      }, 1200)
    } else {
      // Web/PWA
      router.replace(webLink)
    }
  }, [id, router])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 text-white p-8">
      <h1 className="text-2xl font-bold mb-4">Convite recebido!</h1>
      <p className="mb-2">Você está sendo convidado para conhecer um profissional parceiro.</p>
      <p className="mb-6">Aguarde, estamos direcionando você para o app...</p>
      <div className="animate-pulse text-4xl">🔗</div>
    </div>
  )
}

export const dynamic = 'force-static'
