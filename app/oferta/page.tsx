'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function OfertaPage() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/oferta/escolha')
  }, [router])
  return null
}
