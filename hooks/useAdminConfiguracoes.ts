'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

// ─── Tipos ────────────────────────────────────────────────────────────────────
export type ConfigGeral = {
  nomePlataforma: string
  emailSuporte: string
  cnpjResponsavel: string
  razaoSocial: string
  urlLogo: string
  corPrimaria: string
  linkTermosUso: string
  linkPoliticaPrivacidade: string
}

export type ConfigEconomia = {
  valorConectaReais: string
  bonusIndicacaoUser: string
  bonusIndicacaoEmpresa: string
  bonusIndicacaoProfissional: string
  limiteSaldoCarteira: string
  taxaSaque: string
  consultasGratisPerDia: string
  valorConsultaExtra: string
  valorDesbloquearCidade: string
  valorDesbloquearProfissional: string
  maxFotosPorProduto: string
}

export type CidadeConfig = {
  id: number
  nome: string
  ativa: boolean
  padrao: boolean
}

export type ConfigModeracao = {
  aprovacaoAutoEmpresa: boolean
  aprovacaoAutoProduto: boolean
  aprovacaoAutoFoto: boolean
  validadeOfertaDias: string
  limiteProdutosPorEmpresa: string
  limiteOfertasAtivasPorEmpresa: string
}

export type ConfigIntegracoes = {
  whatsappBusiness: string
  chavePix: string
  webhookUrl: string
  pushGlobal: boolean
  maxPushPorDia: string
}

// ─── Mock inicial (fase 1 — integração Supabase na fase 2) ───────────────────
const GERAL_INICIAL: ConfigGeral = {
  nomePlataforma:          'Valente Conecta',
  emailSuporte:            'contato@valente.com',
  cnpjResponsavel:         '00.000.000/0001-00',
  razaoSocial:             'Valente Conecta LTDA',
  urlLogo:                 '',
  corPrimaria:             '#EAB308',
  linkTermosUso:           'https://valente.com/termos',
  linkPoliticaPrivacidade: 'https://valente.com/privacidade',
}

const ECONOMIA_INICIAL: ConfigEconomia = {
  valorConectaReais:     '0.50',
  bonusIndicacaoUser:          '1',
  bonusIndicacaoEmpresa:       '2',
  bonusIndicacaoProfissional:  '3',
  limiteSaldoCarteira:   '500',
  taxaSaque:             '5',
  consultasGratisPerDia: '5',
  valorConsultaExtra:    '1',
  valorDesbloquearCidade:'30',
  valorDesbloquearProfissional: '5.90',
  maxFotosPorProduto:    '2',
}

const CIDADES_INICIAIS: CidadeConfig[] = [
  { id: 1, nome: 'Valente-BA',    ativa: true,  padrao: true  },
  { id: 2, nome: 'Nordestina-BA', ativa: true,  padrao: false },
  { id: 3, nome: 'Santaluz-BA',   ativa: false, padrao: false },
]

const MODERACAO_INICIAL: ConfigModeracao = {
  aprovacaoAutoEmpresa:          false,
  aprovacaoAutoProduto:          false,
  aprovacaoAutoFoto:             false,
  validadeOfertaDias:            '30',
  limiteProdutosPorEmpresa:      '50',
  limiteOfertasAtivasPorEmpresa: '5',
}

const INTEGRACOES_INICIAL: ConfigIntegracoes = {
  whatsappBusiness: '(75) 99999-0000',
  chavePix:         'contato@valente.com',
  webhookUrl:       '',
  pushGlobal:       true,
  maxPushPorDia:    '3',
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useAdminConfiguracoes() {
  const [aba, setAba] = useState<'geral' | 'economia' | 'moderacao' | 'integracoes'>('geral')

  const [geral,       setGeral]       = useState<ConfigGeral>(GERAL_INICIAL)
  const [economia,    setEconomia]    = useState<ConfigEconomia>(ECONOMIA_INICIAL)
  const [cidades,     setCidades]     = useState<CidadeConfig[]>(CIDADES_INICIAIS)
  const [moderacao,   setModeracao]   = useState<ConfigModeracao>(MODERACAO_INICIAL)
  const [integracoes, setIntegracoes] = useState<ConfigIntegracoes>(INTEGRACOES_INICIAL)

  const [novaCidade, setNovaCidade] = useState('')
  const [salvando,   setSalvando]   = useState(false)
  const [salvoOk,    setSalvoOk]    = useState<string | null>(null)

  // ── Carrega do banco no mount ─────────────────────────────────────
  useEffect(() => {
    supabase
      .from('admin_configs')
      .select('*')
      .limit(1)
      .single()
      .then(({ data }) => {
        if (!data) return
        if (data.geral)       setGeral(prev       => ({ ...prev, ...data.geral       }))
        if (data.economia)    setEconomia(prev    => ({ ...prev, ...data.economia    }))
        if (data.cidades)     setCidades(data.cidades)
        if (data.moderacao)   setModeracao(prev   => ({ ...prev, ...data.moderacao   }))
        if (data.integracoes) setIntegracoes(prev => ({ ...prev, ...data.integracoes }))
      })
  }, [])

  function updateGeral(campo: keyof ConfigGeral, valor: string) {
    setGeral(prev => ({ ...prev, [campo]: valor }))
  }

  function updateEconomia(campo: keyof ConfigEconomia, valor: string) {
    setEconomia(prev => ({ ...prev, [campo]: valor }))
  }

  function updateModeracao(campo: keyof ConfigModeracao, valor: string | boolean) {
    setModeracao(prev => ({ ...prev, [campo]: valor }))
  }

  function updateIntegracoes(campo: keyof ConfigIntegracoes, valor: string | boolean) {
    setIntegracoes(prev => ({ ...prev, [campo]: valor }))
  }

  function toggleCidade(id: number) {
    setCidades(prev => prev.map(c => c.id === id ? { ...c, ativa: !c.ativa } : c))
  }

  function setCidadePadrao(id: number) {
    setCidades(prev => prev.map(c => ({ ...c, padrao: c.id === id })))
  }

  function adicionarCidade() {
    if (!novaCidade.trim()) return
    setCidades(prev => [...prev, { id: Date.now(), nome: novaCidade.trim(), ativa: true, padrao: false }])
    setNovaCidade('')
  }

  function removerCidade(id: number) {
    setCidades(prev => prev.filter(c => c.id !== id))
  }

  async function salvar(secao: string) {
    setSalvando(true)
    const payload: Record<string, unknown> = { id: 1 }
    if (secao === 'geral')        payload.geral        = geral
    if (secao === 'economia')     payload.economia     = economia
    if (secao === 'cidades')      payload.cidades      = cidades
    if (secao === 'moderacao')    payload.moderacao    = moderacao
    if (secao === 'integracoes')  payload.integracoes  = integracoes
    await supabase.from('admin_configs').upsert(payload)
    setSalvando(false)
    setSalvoOk(secao)
    setTimeout(() => setSalvoOk(null), 2500)
  }

  return {
    aba, setAba,
    geral, updateGeral,
    economia, updateEconomia,
    cidades, toggleCidade, setCidadePadrao, adicionarCidade, removerCidade,
    novaCidade, setNovaCidade,
    moderacao, updateModeracao,
    integracoes, updateIntegracoes,
    salvando, salvoOk, salvar,
  }
}
