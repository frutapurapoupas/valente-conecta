import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

// Componente que usa useSearchParams
function ConviteSucessoContent() {
  const searchParams = useSearchParams()
  // ... resto do seu código
  return <div>...</div>
}

// Componente principal com Suspense
export default function ConviteSucessoPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <ConviteSucessoContent />
    </Suspense>
  )
}