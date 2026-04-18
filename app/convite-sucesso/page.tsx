import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

// Componente que usa useSearchParams
function ConviteSucessoContent() {
  const searchParams = useSearchParams()
  
  // Mantenha AQUI todo o resto do código original da sua página
  // Exemplo:
  const token = searchParams.get('token')
  const email = searchParams.get('email')
  
  return (
    <div>
      <h1>Convite enviado com sucesso!</h1>
      {email && <p>Email: {email}</p>}
      {/* Resto do seu código */}
    </div>
  )
}

// Componente principal com Suspense
export default function ConviteSucessoPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <ConviteSucessoContent />
    </Suspense>
  )
}