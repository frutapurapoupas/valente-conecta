'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

interface Taxas {
  Gold: number
  Black: number
  Silver: number
}

export interface Fatura {
  id: string
  loja: string
  valor: number
  plano: string
  verificado: boolean
}

export function useAdminControle() {
  const [taxas, setTaxasState] = useState<Taxas>({ Gold: 10, Black: 8, Silver: 15 })
  const [faturas, setFaturas] = useState<Fatura[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)

      // Load plans to get current taxa per plan
      const { data: plansData } = await supabase
        .from('plans')
        .select('name, nome, taxa, price')

      if (plansData && plansData.length > 0) {
        const taxasFromDB: Taxas = { Gold: 10, Black: 8, Silver: 15 }
        plansData.forEach((p: { name: string; nome?: string; taxa?: number; price?: number }) => {
          const planName = p.nome ?? p.name
          const planTaxa = p.taxa ?? p.price ?? 10
          const key = planName as keyof Taxas
          if (key in taxasFromDB) {
            taxasFromDB[key] = planTaxa
          }
        })
        setTaxasState(taxasFromDB)
      }

      // Load companies for faturas
      const { data: companies } = await supabase
        .from('companies')
        .select('id, nome_fantasia, plano, verificado')
        .order('nome_fantasia')

      if (companies) {
        setFaturas(
          companies.map((c: { id: string; nome_fantasia: string; plano: string; verificado: boolean }) => ({
            id: c.id,
            loja: c.nome_fantasia || 'Empresa',
            valor: 0,
            plano: c.plano || 'gratis',
            verificado: c.verificado ?? false,
          }))
        )
      }
    } catch (err) {
      console.error('useAdminControle:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const setTaxas = async (novasTaxas: Taxas) => {
    setTaxasState(novasTaxas)
    // Persist each plan's taxa
    await Promise.all(
      Object.entries(novasTaxas).map(([nome, taxa]) =>
        supabase
          .from('plans')
          .update({ taxa, price: taxa, updated_at: new Date().toISOString() })
          .or(`nome.eq.${nome},name.eq.${nome}`)
      )
    )
  }

  return { taxas, setTaxas, faturas, loading }
}
