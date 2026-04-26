'use client'

import { useAmbulante } from '@/hooks/useAmbulante'
import { CatalogoAmbulante } from '@/components/ambulantes/CatalogoAmbulante'

export default function CatalogoAmbulantePage({ params }: { params: { id: string } }) {
  const ambulanteData = useAmbulante(params.id)

  return <CatalogoAmbulante ambulanteId={params.id} {...ambulanteData} />
}
