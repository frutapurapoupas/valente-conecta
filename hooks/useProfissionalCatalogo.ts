'use client'

import { useState } from 'react'

export function useProfissionalCatalogo() {
  const [images, setImages] = useState<string[]>([])
  const [isOnline, setIsOnline] = useState(false)

  const toggleOnline = () => setIsOnline(prev => !prev)

  return { images, setImages, isOnline, toggleOnline }
}
