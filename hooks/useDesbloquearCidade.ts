'use client'

import { useState, useEffect } from 'react'

export interface CidadeOpcao {
  id: string
  nome: string
  desbloqueada: boolean
  validadeAte?: string // ISO string
}

const CIDADES_DISPONIVEIS: CidadeOpcao[] = [
  { id: 'valente-ba',    nome: 'Valente, BA',    desbloqueada: true  },
  { id: 'nordestina-ba', nome: 'Nordestina, BA', desbloqueada: false },
  { id: 'santaluz-ba',   nome: 'Santaluz, BA',   desbloqueada: false },
  { id: 'queimadas-ba',  nome: 'Queimadas, BA',  desbloqueada: false },
]

const STORAGE_KEY = 'cidades_desbloqueadas'
const CIDADE_ATIVA_KEY = 'cidade_ativa'
const CUSTO_DEFAULT = 30 // Conectas

export function useDesbloquearCidade() {
  const [cidadeAtiva, setCidadeAtivaState] = useState<CidadeOpcao>(CIDADES_DISPONIVEIS[0])
  const [cidades, setCidades] = useState<CidadeOpcao[]>(CIDADES_DISPONIVEIS)
  const [modalAberto, setModalAberto] = useState(false)
  const [cidadeSelecionada, setCidadeSelecionada] = useState<CidadeOpcao | null>(null)
  const [saldoConectas, setSaldoConectas] = useState(0)
  const [custo, setCusto] = useState(CUSTO_DEFAULT)
  const [desbloqueando, setDesbloqueando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    // Load persisted unlocked cities
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const desbloqueadas: { id: string; validadeAte: string }[] = JSON.parse(saved)
      const agora = new Date()
      setCidades(prev => prev.map(c => {
        const entry = desbloqueadas.find(d => d.id === c.id)
        if (!entry) return c
        const valida = new Date(entry.validadeAte) > agora
        return { ...c, desbloqueada: valida, validadeAte: valida ? entry.validadeAte : undefined }
      }))
    }

    // Load active city
    const ativa = localStorage.getItem(CIDADE_ATIVA_KEY)
    if (ativa) {
      const parsed = JSON.parse(ativa) as CidadeOpcao
      setCidadeAtivaState(parsed)
    }

    // Load admin cost config
    const modConfig = localStorage.getItem('admin_config_moderacao')
    if (!modConfig) {
      const ecoConfig = localStorage.getItem('admin_config_economia')
      if (ecoConfig) {
        const val = parseInt(JSON.parse(ecoConfig).valorDesbloquearCidade, 10)
        if (!isNaN(val)) setCusto(val)
      }
    }

    // Mock: load user's Conectas balance
    const walletRaw = localStorage.getItem('wallet_saldo')
    const saldo = walletRaw ? parseInt(walletRaw, 10) : 120
    setSaldoConectas(saldo)
  }, [])

  function abrirSeletor() {
    setModalAberto(true)
    setErro(null)
  }

  function fecharModal() {
    setModalAberto(false)
    setCidadeSelecionada(null)
    setErro(null)
  }

  function selecionarCidade(cidade: CidadeOpcao) {
    if (cidade.desbloqueada) {
      // Already unlocked — just switch
      setCidadeAtivaState(cidade)
      localStorage.setItem(CIDADE_ATIVA_KEY, JSON.stringify(cidade))
      setModalAberto(false)
      return
    }
    setCidadeSelecionada(cidade)
    setErro(null)
  }

  async function confirmarDesbloqueio() {
    if (!cidadeSelecionada) return
    if (saldoConectas < custo) {
      setErro(`Saldo insuficiente. Você tem ${saldoConectas} ✦ e precisa de ${custo} ✦.`)
      return
    }

    setDesbloqueando(true)
    // Simulate async call (will be replaced by unlockCityForUser + updateUserSaldo)
    await new Promise(r => setTimeout(r, 700))

    const novoSaldo = saldoConectas - custo
    setSaldoConectas(novoSaldo)
    localStorage.setItem('wallet_saldo', String(novoSaldo))

    const validade = new Date()
    validade.setDate(validade.getDate() + 30)
    const validadeStr = validade.toISOString()

    // Persist unlock
    const savedRaw = localStorage.getItem(STORAGE_KEY)
    const saved: { id: string; validadeAte: string }[] = savedRaw ? JSON.parse(savedRaw) : []
    const idx = saved.findIndex(d => d.id === cidadeSelecionada.id)
    if (idx !== -1) saved[idx].validadeAte = validadeStr
    else saved.push({ id: cidadeSelecionada.id, validadeAte: validadeStr })
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved))

    const cidadeDesbloqueada: CidadeOpcao = {
      ...cidadeSelecionada,
      desbloqueada: true,
      validadeAte: validadeStr,
    }

    setCidades(prev => prev.map(c => c.id === cidadeSelecionada.id ? cidadeDesbloqueada : c))
    setCidadeAtivaState(cidadeDesbloqueada)
    localStorage.setItem(CIDADE_ATIVA_KEY, JSON.stringify(cidadeDesbloqueada))

    setDesbloqueando(false)
    setModalAberto(false)
    setCidadeSelecionada(null)
  }

  function diasRestantes(validadeAte?: string): number | null {
    if (!validadeAte) return null
    const diff = new Date(validadeAte).getTime() - Date.now()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }

  return {
    cidadeAtiva,
    cidades,
    modalAberto,
    cidadeSelecionada,
    saldoConectas,
    custo,
    desbloqueando,
    erro,
    abrirSeletor,
    fecharModal,
    selecionarCidade,
    confirmarDesbloqueio,
    diasRestantes,
  }
}
