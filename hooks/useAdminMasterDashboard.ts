'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

export interface AdminMasterData {
  receita: {
    mes: number
    hoje: number
    crescimento: number
  }
  usuarios: {
    total: number
    ativos: number
    novosHoje: number
    indicacoesPendentes: number
    indicacoesValidadas: number
    taxaConversao: number
    bonusPagosMes: number
  }
  empresas: {
    total: number
    gratis: number
    basico: number
    premium: number
    fisco: number
    receitaMes: number
  }
  profissionais: {
    total: number
    gratis: number
    basico: number
    premium: number
    receitaMes: number
  }
  academia: {
    total: number
    ativosMensal: number
    ativosSemestral: number
    treinandoAgora: number
    receitaMes: number
  }
  busca: {
    hoje: number
    semana: number
    mes: number
    receitaMes: number
  }
  carrossel: {
    slots: number
    lances: number[]
    pendentesAprovacao: number
    receitaMes: number
  }
  pdv: {
    pdvsAtivos: number
    transacoesHoje: number
    volumeHoje: number
    comissaoMes: number
  }
}

const DEFAULT_DATA: AdminMasterData = {
  receita: { mes: 0, hoje: 0, crescimento: 0 },
  usuarios: {
    total: 0, ativos: 0, novosHoje: 0,
    indicacoesPendentes: 0, indicacoesValidadas: 0,
    taxaConversao: 0, bonusPagosMes: 0,
  },
  empresas: { total: 0, gratis: 0, basico: 0, premium: 0, fisco: 0, receitaMes: 0 },
  profissionais: { total: 0, gratis: 0, basico: 0, premium: 0, receitaMes: 0 },
  academia: { total: 0, ativosMensal: 0, ativosSemestral: 0, treinandoAgora: 0, receitaMes: 0 },
  busca: { hoje: 0, semana: 0, mes: 0, receitaMes: 0 },
  carrossel: { slots: 3, lances: [0, 0, 0], pendentesAprovacao: 0, receitaMes: 0 },
  pdv: { pdvsAtivos: 0, transacoesHoje: 0, volumeHoje: 0, comissaoMes: 0 },
}

export function useAdminMasterDashboard() {
  const [data, setData] = useState<AdminMasterData>(DEFAULT_DATA)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const hoje = new Date()
  const inicioHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate()).toISOString()
  const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString()
  const inicioSemana = new Date(hoje.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)

      const [
        usersTotal,
        usersAtivos,
        usersHoje,
        empresasTotal,
        empresasGratis,
        empresasBasico,
        empresasPremium,
        empresasFisco,
        gymTotal,
        gymMensal,
        gymSemestral,
        produtosPendentes,
        transacoesHoje,
        transacoesMes,
        indicacoesPendentes,
        indicacoesValidadas,
        carrosselPendentes,
        carrosselAnuncios,
      ] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('users').select('*', { count: 'exact', head: true }).eq('status', 'ativo'),
        supabase.from('users').select('*', { count: 'exact', head: true }).gte('created_at', inicioHoje),
        supabase.from('companies').select('*', { count: 'exact', head: true }),
        supabase.from('companies').select('*', { count: 'exact', head: true }).eq('plano', 'gratis'),
        supabase.from('companies').select('*', { count: 'exact', head: true }).eq('plano', 'basico'),
        supabase.from('companies').select('*', { count: 'exact', head: true }).eq('plano', 'premium'),
        supabase.from('companies').select('*', { count: 'exact', head: true }).eq('plano', 'fisco'),
        supabase.from('gym_members').select('*', { count: 'exact', head: true }),
        supabase.from('gym_members').select('*', { count: 'exact', head: true }).eq('plano', 'mensal').eq('status', 'ativo'),
        supabase.from('gym_members').select('*', { count: 'exact', head: true }).eq('plano', 'semestral').eq('status', 'ativo'),
        supabase.from('products').select('*', { count: 'exact', head: true }).in('status', ['pending_completion', 'pending_sync']),
        supabase.from('transactions').select('amount').gte('created_at', inicioHoje),
        supabase.from('transactions').select('amount').gte('created_at', inicioMes),
        supabase.from('transactions').select('*', { count: 'exact', head: true }).eq('status', 'pendente').eq('type', 'REFERRAL'),
        supabase.from('transactions').select('*', { count: 'exact', head: true }).eq('status', 'concluido').eq('type', 'REFERRAL'),
        supabase.from('auction_anuncios').select('*', { count: 'exact', head: true }).eq('status', 'pendente'),
        supabase.from('auction_anuncios').select('valor_lance').eq('status', 'ativo').order('valor_lance', { ascending: false }).limit(3),
      ])

      const volumeHoje = (transacoesHoje.data || []).reduce((s: number, t: { amount: number }) => s + t.amount, 0)
      const volumeMes = (transacoesMes.data || []).reduce((s: number, t: { amount: number }) => s + t.amount, 0)
      const lancesCarrossel = (carrosselAnuncios.data || []).map((a: { valor_lance: number }) => a.valor_lance)
      while (lancesCarrossel.length < 3) lancesCarrossel.push(0)

      const totalEmpresas = empresasTotal.count || 0
      const receitaEmpresas =
        (empresasBasico.count || 0) * 29 +
        (empresasPremium.count || 0) * 56 +
        (empresasFisco.count || 0) * 150

      const gymMensalCount = gymMensal.count || 0
      const gymSemestralCount = gymSemestral.count || 0
      const receitaAcademia = gymMensalCount * 79 + gymSemestralCount * 59

      const receitaCarrossel = lancesCarrossel.reduce((s: number, v: number) => s + v, 0)

      const totalIndicacaoPendentes = indicacoesPendentes.count || 0
      const totalIndicacoesValidadas = indicacoesValidadas.count || 0
      const taxaConversao =
        totalIndicacaoPendentes + totalIndicacoesValidadas > 0
          ? Math.round((totalIndicacoesValidadas / (totalIndicacaoPendentes + totalIndicacoesValidadas)) * 1000) / 10
          : 0

      const receitaTotal = receitaEmpresas + receitaAcademia + receitaCarrossel + volumeMes * 0.01

      setData({
        receita: {
          mes: Math.round(receitaTotal),
          hoje: Math.round(volumeHoje),
          crescimento: 0,
        },
        usuarios: {
          total: usersTotal.count || 0,
          ativos: usersAtivos.count || 0,
          novosHoje: usersHoje.count || 0,
          indicacoesPendentes: totalIndicacaoPendentes,
          indicacoesValidadas: totalIndicacoesValidadas,
          taxaConversao,
          bonusPagosMes: 0,
        },
        empresas: {
          total: totalEmpresas,
          gratis: empresasGratis.count || 0,
          basico: empresasBasico.count || 0,
          premium: empresasPremium.count || 0,
          fisco: empresasFisco.count || 0,
          receitaMes: receitaEmpresas,
        },
        profissionais: {
          total: 0,
          gratis: 0,
          basico: 0,
          premium: 0,
          receitaMes: 0,
        },
        academia: {
          total: gymTotal.count || 0,
          ativosMensal: gymMensalCount,
          ativosSemestral: gymSemestralCount,
          treinandoAgora: 0,
          receitaMes: receitaAcademia,
        },
        busca: {
          hoje: 0,
          semana: 0,
          mes: 0,
          receitaMes: 0,
        },
        carrossel: {
          slots: 3,
          lances: lancesCarrossel.slice(0, 3),
          pendentesAprovacao: carrosselPendentes.count || 0,
          receitaMes: receitaCarrossel,
        },
        pdv: {
          pdvsAtivos: totalEmpresas,
          transacoesHoje: (transacoesHoje.data || []).length,
          volumeHoje: Math.round(volumeHoje),
          comissaoMes: Math.round(volumeMes * 0.01),
        },
      })
      setError(null)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao carregar dados'
      console.error('useAdminMasterDashboard:', msg)
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [inicioHoje, inicioMes, inicioSemana])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, refetch: fetchData }
}
