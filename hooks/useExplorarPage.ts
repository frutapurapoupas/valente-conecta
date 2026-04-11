'use client'

import { useState } from 'react'

export const CATEGORIAS = ['Todos', 'Borracharia', 'Manicure', 'Aluguel', 'Fretes', 'Mecânico']

export function useExplorarPage() {
  const [activeFilter, setActiveFilter] = useState('todos')

  return {
    activeFilter,
    setActiveFilter,
    categorias: CATEGORIAS,
  }
}
