'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

export default function AgendaRedirectPage() {
  const router = useRouter()
  const params = useSearchParams()
  useEffect(() => {
    // Redireciona para a agenda do profissional com o id correto
    const id = params?.get('id')
    if (id) {
      router.replace(`/profissional/agenda?id=${id}`)
    }
  }, [params, router])
  return null
}
