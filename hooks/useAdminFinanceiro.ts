'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

type NovoLancamento = {
  descricao: string
  valor: string
  vencimento: string
  categoria: string
}

const LANCAMENTO_INICIAL: NovoLancamento = {
  descricao: '',
  valor: '',
  vencimento: '05',
  categoria: 'FIXA',
}

export function useAdminFinanceiro() {
  const [despesas, setDespesas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [mesFiltro, setMesFiltro] = useState(new Date().getMonth() + 1)
  const [novoLancamento, setNovoLancamento] = useState<NovoLancamento>(LANCAMENTO_INICIAL)

  useEffect(() => {
    fetchFinanceiro()
  }, [mesFiltro])

  async function fetchFinanceiro() {
    setLoading(true)
    const { data } = await supabase
      .from('financeiro')
      .select('*')
      .order('vencimento', { ascending: true })
    if (data) setDespesas(data)
    setLoading(false)
  }

  async function handleSalvar() {
    const { error } = await supabase.from('financeiro').insert([{
      descricao: novoLancamento.descricao.toUpperCase(),
      valor: parseFloat(novoLancamento.valor.replace(',', '.')),
      vencimento: novoLancamento.vencimento,
      categoria: novoLancamento.categoria,
      status: 'PENDENTE',
    }])
    if (!error) {
      setIsModalOpen(false)
      setNovoLancamento(LANCAMENTO_INICIAL)
      fetchFinanceiro()
    }
  }

  const updateLancamento = (field: keyof NovoLancamento, value: string) =>
    setNovoLancamento((prev) => ({ ...prev, [field]: value }))

  const totalGeral = despesas.reduce((acc, curr) => acc + curr.valor, 0)

  return {
    despesas,
    loading,
    isModalOpen, setIsModalOpen,
    mesFiltro, setMesFiltro,
    novoLancamento,
    updateLancamento,
    handleSalvar,
    totalGeral,
  }
}
