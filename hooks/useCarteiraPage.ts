'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { getPlanoUsuario, getUsuarioLogado } from '@/services/auth'

export type TabCarteira = 'saldo' | 'indicar' | 'bonus' | 'resgatar' | 'pagamento'
export type TipoUsuario = 'amigo' | 'empresa' | 'profissional'
export type TipoResgate = 'pix' | 'app' | 'moeda'

export type BonusItem = {
  id: number
  origem: 'indicacao' | 'promocao' | 'campanha' | 'cashback'
  descricao: string
  valor: number
  status: 'bloqueado' | 'liberando' | 'disponivel' | 'resgatado'
  dataCredito: string
  previsaoLiberacao?: string
}

export type ResgateItem = {
  id: number
  tipo: TipoResgate
  valor: number
  destino: string
  data: string
  status: 'concluido' | 'pendente' | 'cancelado'
}

export type WalletData = {
  saldoDisponivel: number
  // Bloqueado proveniente de indicações — liberado em parcelas mensais configuráveis
  bonusIndicacaoBloqueado: number
  // Bloqueado de outros tipos de bônus — liberado integralmente ou por regras próprias
  bonusOutrosBloqueado: number
  totalBonusAcumulado: number
  indicacoesCompletadas: number
  indicacoesPendentes: number
  proximoPagamento: number
  diasProximoPagamento: number
}

export type Indication = {
  id: number
  name: string
  type: string
  date: string
  status: string
  value: number
  cicloCompleto: boolean
}

export type AdminConfig = {
  bonusAmigo: number
  bonusEmpresa: number
  bonusProfissional: number
  pagamentoMensalMax: number
}

const WALLET_DATA: WalletData = {
  saldoDisponivel: 45.00,
  bonusIndicacaoBloqueado: 105.00,  // sujeito ao limite mensal do Admin Master
  bonusOutrosBloqueado: 0.00,       // liberado integralmente ou por regras próprias
  totalBonusAcumulado: 150.00,
  indicacoesCompletadas: 2,
  indicacoesPendentes: 3,
  proximoPagamento: 50.00,
  diasProximoPagamento: 15,
}

const INDICATIONS: Indication[] = [
  { id: 1, name: 'João Silva', type: 'amigo', date: '01/04/2026', status: 'aprovado', value: 1, cicloCompleto: true },
  { id: 2, name: 'Padaria do Zé', type: 'empresa', date: '28/03/2026', status: 'aprovado', value: 2, cicloCompleto: true },
  { id: 4, name: 'Carlos Santos', type: 'amigo', date: '20/03/2026', status: 'pendente', value: 1, cicloCompleto: false },
]

const BONUS_HISTORICO: BonusItem[] = [
  { id: 1, origem: 'indicacao', descricao: 'Indicação: João Silva (amigo)', valor: 1.00, status: 'disponivel', dataCredito: '01/04/2026' },
  { id: 2, origem: 'indicacao', descricao: 'Indicação: Padaria do Zé (empresa)', valor: 2.00, status: 'disponivel', dataCredito: '28/03/2026' },
  { id: 3, origem: 'indicacao', descricao: 'Indicação: Carlos Santos (amigo)', valor: 1.00, status: 'bloqueado', dataCredito: '20/03/2026', previsaoLiberacao: 'mai/2026' },
  { id: 4, origem: 'indicacao', descricao: 'Bônus de indicações (parcela mensal)', valor: 50.00, status: 'liberando', dataCredito: '10/04/2026', previsaoLiberacao: 'mai/2026' },
  { id: 5, origem: 'cashback', descricao: 'Cashback compra PDV', valor: 2.50, status: 'disponivel', dataCredito: '05/04/2026' },
  { id: 6, origem: 'campanha', descricao: 'Campanha Semana do Consumidor', valor: 10.00, status: 'disponivel', dataCredito: '22/03/2026' },
]

const RESGATES_HISTORICO: ResgateItem[] = [
  { id: 1, tipo: 'pix', valor: 20.00, destino: '***456-7', data: '01/04/2026', status: 'concluido' },
  { id: 2, tipo: 'app', valor: 5.00, destino: 'Pagamento PDV - Supermercado', data: '28/03/2026', status: 'concluido' },
  { id: 3, tipo: 'moeda', valor: 15.00, destino: 'Convertido em Moeda Conecta', data: '20/03/2026', status: 'concluido' },
]

const ADMIN_CONFIG: AdminConfig = {
  bonusAmigo: 1,
  bonusEmpresa: 2,
  bonusProfissional: 2,
  pagamentoMensalMax: 50,
}

export function useCarteiraPage() {
  const searchParams = useSearchParams()
  const tabInicial = (searchParams.get('tab') as TabCarteira) || 'saldo'
  const [activeTab, setActiveTab] = useState<TabCarteira>(tabInicial)
  const [copied, setCopied] = useState(false)
  const [copiedQR, setCopiedQR] = useState(false)
  const [userType, setUserType] = useState<TipoUsuario>('amigo')
  const [tipoResgate, setTipoResgate] = useState<TipoResgate>('pix')
  const [valorResgate, setValorResgate] = useState('')
  const [pixKey, setPixKey] = useState('')
  const [loadingResgate, setLoadingResgate] = useState(false)
  const [plano, setPlano] = useState<'gratis' | 'basico' | 'premium'>('gratis')
  const [usuario, setUsuario] = useState<any>(null)
  const [loja, setLoja] = useState({
    nome: 'Valente Conecta',
    endereco: 'Rua Principal, 123 - Centro',
    cidade: 'Coité - BA',
  })

  const walletData = WALLET_DATA
  const indications = INDICATIONS
  const adminConfig = ADMIN_CONFIG
  const bonusHistorico = BONUS_HISTORICO
  const resgatesHistorico = RESGATES_HISTORICO

  useEffect(() => {
    setPlano(getPlanoUsuario())
    setUsuario(getUsuarioLogado())
    const lojaSalva = localStorage.getItem('loja_info')
    if (lojaSalva) setLoja(JSON.parse(lojaSalva))
  }, [])

  // QR de indicação
  const linkIndicacao =
    typeof window !== 'undefined'
      ? `${window.location.origin}/cadastro?ref=${usuario?.id || 'convite'}&tipo=${userType}`
      : ''

  // QR de pagamento/transação — identifica este usuário para receber ou transferir
  const qrPagamento =
    typeof window !== 'undefined'
      ? JSON.stringify({
          tipo: 'pagamento_conecta',
          userId: usuario?.id || 'usuario',
          nome: usuario?.nome || 'Usuário',
          cidade: loja.cidade,
        })
      : ''

  const copyToClipboard = () => {
    navigator.clipboard.writeText(linkIndicacao)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const copyQRLink = () => {
    navigator.clipboard.writeText(qrPagamento)
    setCopiedQR(true)
    setTimeout(() => setCopiedQR(false), 2000)
  }

  const handleResgate = () => {
    const valor = parseFloat(valorResgate)
    if (!valor || valor <= 0 || valor > walletData.saldoDisponivel) return
    setLoadingResgate(true)
    setTimeout(() => setLoadingResgate(false), 2000)
  }

  // Apenas o bônus de indicação segue a regra de parcelamento mensal
  const mesesParaLiberar = Math.ceil(walletData.bonusIndicacaoBloqueado / adminConfig.pagamentoMensalMax)

  // Saldo bloqueado total (exibição nos cards)
  const saldoBloqueadoTotal = walletData.bonusIndicacaoBloqueado + walletData.bonusOutrosBloqueado

  // Resumo de bônus por status
  const totalBonusDisponivel = bonusHistorico
    .filter(b => b.status === 'disponivel')
    .reduce((s, b) => s + b.valor, 0)
  const totalBonusBloqueado = bonusHistorico
    .filter(b => b.status === 'bloqueado' || b.status === 'liberando')
    .reduce((s, b) => s + b.valor, 0)

  const statusBonusLabel: Record<BonusItem['status'], string> = {
    disponivel: 'Disponível',
    liberando: 'Liberando',
    bloqueado: 'Bloqueado',
    resgatado: 'Resgatado',
  }

  const statusBonusColor: Record<BonusItem['status'], string> = {
    disponivel: 'bg-green-100 text-green-700',
    liberando: 'bg-yellow-100 text-yellow-700',
    bloqueado: 'bg-zinc-100 text-zinc-500',
    resgatado: 'bg-blue-100 text-blue-600',
  }

  const origemIcon: Record<BonusItem['origem'], string> = {
    indicacao: '👥',
    promocao: '🎯',
    campanha: '📣',
    cashback: '💰',
  }

  return {
    activeTab, setActiveTab,
    copied, copiedQR,
    userType, setUserType,
    tipoResgate, setTipoResgate,
    valorResgate, setValorResgate,
    pixKey, setPixKey,
    loadingResgate,
    plano,
    usuario,
    loja,
    walletData,
    indications,
    adminConfig,
    bonusHistorico,
    resgatesHistorico,
    linkIndicacao,
    qrPagamento,
    copyToClipboard,
    copyQRLink,
    handleResgate,
    mesesParaLiberar,
    saldoBloqueadoTotal,
    totalBonusDisponivel,
    totalBonusBloqueado,
    statusBonusLabel,
    statusBonusColor,
    origemIcon,
  }
}
