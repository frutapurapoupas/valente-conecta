'use client'

import { useState } from 'react'

export const useDemandCapture = (category: string) => {
  const [loading, setLoading] = useState(false)

  const handleCapture = async (data: any) => {
    setLoading(true)
    try {
      console.log(`Capturando demanda para categoria: ${category}`, data)
      await new Promise(resolve => setTimeout(resolve, 1000))
      return { success: true }
    } catch (error) {
      console.error('Erro ao capturar demanda:', error)
      return { success: false, error }
    } finally {
      setLoading(false)
    }
  }

  return { handleCapture, loading }
}
