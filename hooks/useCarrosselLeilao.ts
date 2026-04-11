'use client'

import { useState } from 'react'

export interface LanceLojista {
  slot: 1 | 2 | 3
  valor: number
}

export function useCarrosselLeilao() {
  const [slotSelecionado, setSlotSelecionado] = useState<1 | 2 | 3 | null>(null)
  const [meuLance, setMeuLance] = useState('')
  const [imagemPreview, setImagemPreview] = useState<string | null>(null)
  const [enviado, setEnviado] = useState(false)
  const [erroLance, setErroLance] = useState('')

  // Lances atuais dos slots (mock)
  const slotsDisponiveis = [
    { slot: 1 as const, lanceAtual: 85, disponivel: true },
    { slot: 2 as const, lanceAtual: 60, disponivel: true },
    { slot: 3 as const, lanceAtual: 35, disponivel: true },
  ]

  const LANCE_MINIMO = 35

  const handleImagemUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 500 * 1024) {
      setErroLance('Imagem deve ter no máximo 500KB para carregamento rápido.')
      return
    }
    const reader = new FileReader()
    reader.onload = (ev) => setImagemPreview(ev.target?.result as string)
    reader.readAsDataURL(file)
    setErroLance('')
  }

  const handleEnviarLance = () => {
    const valor = parseFloat(meuLance)
    const slotEscolhido = slotsDisponiveis.find(s => s.slot === slotSelecionado)
    if (!slotSelecionado) { setErroLance('Selecione um slot.'); return }
    if (isNaN(valor) || valor < LANCE_MINIMO) { setErroLance(`Lance mínimo: R$ ${LANCE_MINIMO},00`); return }
    if (slotEscolhido && valor <= slotEscolhido.lanceAtual) {
      setErroLance(`Lance atual do Slot ${slotSelecionado} é R$ ${slotEscolhido.lanceAtual},00. Seu lance precisa ser maior.`)
      return
    }
    if (!imagemPreview) { setErroLance('Faça o upload da imagem do anúncio.'); return }
    setEnviado(true)
    setErroLance('')
  }

  const resetar = () => {
    setEnviado(false)
    setSlotSelecionado(null)
    setMeuLance('')
    setImagemPreview(null)
    setErroLance('')
  }

  return {
    slotSelecionado,
    setSlotSelecionado,
    meuLance,
    setMeuLance,
    imagemPreview,
    handleImagemUpload,
    handleEnviarLance,
    enviado,
    resetar,
    erroLance,
    slotsDisponiveis,
    LANCE_MINIMO,
  }
}
