'use client'
import { useState } from 'react'
import { useScanner } from '@/lib/hooks/useScanner'

export function useTesteScannerPage() {
  const { processarBip, modalAberto, setModalAberto, codigoDesconhecido } = useScanner('ID_DA_EMPRESA_AQUI')
  const [carrinho, setCarrinho] = useState<any[]>([])
  const [ultimoBip, setUltimoBip] = useState('')

  const handleScan = async (codigo: string) => {
    if (codigo === ultimoBip) return
    setUltimoBip(codigo)
    const res = await processarBip(codigo)
    if (res?.sucesso) {
      setCarrinho(prev => [res.produto, ...prev])
      navigator.vibrate?.(100)
    }
  }

  return { carrinho, ultimoBip, setUltimoBip, handleScan, modalAberto, setModalAberto, codigoDesconhecido }
}
