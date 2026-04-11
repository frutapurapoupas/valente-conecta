'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export type UsuarioMonitor = {
  id: string
  nome: string
  local: string
  bonusIndicacao: number
  outrosBonus: number
  saldoCarteira: number
  saldoBloqueado: number
  status: string
}

export function useAdminMonitor() {
  const [usuarios, setUsuarios] = useState<UsuarioMonitor[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('users')
      .select('id, name, cidade, referral_balance, saldo_conecta, status')
      .order('referral_balance', { ascending: false })
      .limit(100)
      .then(({ data }) => {
        setUsuarios(
          (data || []).map(u => ({
            id:             u.id,
            nome:           u.name ?? 'Sem nome',
            local:          u.cidade ?? '—',
            bonusIndicacao: Number(u.referral_balance ?? 0),
            outrosBonus:    0,
            saldoCarteira:  Number(u.saldo_conecta ?? 0),
            saldoBloqueado: 0,
            status:         u.status ?? 'Verificado',
          }))
        )
        setLoading(false)
      })
  }, [])

  return { usuarios, loading }
}

