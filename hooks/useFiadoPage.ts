'use client'

import { useState, useEffect } from 'react'
import { getPlanoUsuario } from '@/services/auth'

export type StatusFiado = 'pendente' | 'pago' | 'vencido'
export type FiltroFiado = 'todos' | StatusFiado

export type VendaFiada = {
  id: string
  clienteId: string
  clienteNome: string
  clienteTelefone: string
  valor: number
  data: string
  vencimento: string
  status: StatusFiado
  itens: any[]
  pagamento?: {
    data: string
    valor: number
    metodo: string
  }
}

export function useFiadoPage() {
  const [vendasFiadas, setVendasFiadas] = useState<VendaFiada[]>([])
  const [filtro, setFiltro] = useState<FiltroFiado>('todos')
  const [searchTerm, setSearchTerm] = useState('')
  const [showPagamentoModal, setShowPagamentoModal] = useState<VendaFiada | null>(null)
  const [showUpgradeAlert, setShowUpgradeAlert] = useState(false)
  const [planoPago, setPlanoPago] = useState(false)

  useEffect(() => {
    setPlanoPago(getPlanoUsuario() !== 'gratis')
  }, [])

  useEffect(() => {
    const saved = localStorage.getItem('vendas_fiadas')
    if (saved) {
      const vendas: VendaFiada[] = JSON.parse(saved)
      const atualizadas = vendas.map((v) => {
        if (v.status === 'pendente' && new Date(v.vencimento) < new Date()) {
          return { ...v, status: 'vencido' as StatusFiado }
        }
        return v
      })
      setVendasFiadas(atualizadas)
      localStorage.setItem('vendas_fiadas', JSON.stringify(atualizadas))
    }
  }, [])

  const registrarPagamento = (venda: VendaFiada, metodo: string) => {
    const atualizada: VendaFiada = {
      ...venda,
      status: 'pago',
      pagamento: {
        data: new Date().toISOString(),
        valor: venda.valor,
        metodo,
      },
    }
    const novas = vendasFiadas.map((v) => (v.id === venda.id ? atualizada : v))
    setVendasFiadas(novas)
    localStorage.setItem('vendas_fiadas', JSON.stringify(novas))

    // Atualizar saldo do cliente
    const clientesSalvos = localStorage.getItem('clientes_fiado')
    if (clientesSalvos) {
      const clientes = JSON.parse(clientesSalvos)
      const idx = clientes.findIndex((c: any) => c.id === venda.clienteId)
      if (idx !== -1) {
        clientes[idx].saldoFiado -= venda.valor
        localStorage.setItem('clientes_fiado', JSON.stringify(clientes))
      }
    }

    // Notificação push/WhatsApp — apenas plano pago
    if (planoPago) {
      // Fase 2: integrar com serviço de push e WhatsApp
      console.log(`[NOTIF] Enviando para ${venda.clienteTelefone}: pagamento de R$ ${venda.valor.toFixed(2)} registrado.`)
    }

    setShowPagamentoModal(null)
  }

  const handleNotificarVencimento = (venda: VendaFiada) => {
    if (!planoPago) {
      setShowUpgradeAlert(true)
      return
    }
    // Fase 2: chamar serviço de push/WhatsApp
    console.log(`[NOTIF] Aviso de vencimento para ${venda.clienteTelefone}`)
    alert(`Notificação enviada para ${venda.clienteNome}`)
  }

  const vendasFiltradas = vendasFiadas.filter((v) => {
    if (filtro !== 'todos' && v.status !== filtro) return false
    if (searchTerm && !v.clienteNome.toLowerCase().includes(searchTerm.toLowerCase())) return false
    return true
  })

  const totalPendente = vendasFiadas
    .filter((v) => v.status === 'pendente')
    .reduce((s, v) => s + v.valor, 0)

  const totalVencido = vendasFiadas
    .filter((v) => v.status === 'vencido')
    .reduce((s, v) => s + v.valor, 0)

  return {
    vendasFiltradas,
    filtro, setFiltro,
    searchTerm, setSearchTerm,
    showPagamentoModal, setShowPagamentoModal,
    showUpgradeAlert, setShowUpgradeAlert,
    planoPago,
    registrarPagamento,
    handleNotificarVencimento,
    totalPendente,
    totalVencido,
    countPendente: vendasFiadas.filter((v) => v.status === 'pendente').length,
    countVencido: vendasFiadas.filter((v) => v.status === 'vencido').length,
  }
}
