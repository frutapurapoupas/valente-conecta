'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

function ConviteSucessoContent() {
  const searchParams = useSearchParams()
  // ... resto do código permanece igual
}

export default function ConviteSucessoPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <ConviteSucessoContent />
    </Suspense>
  )
}