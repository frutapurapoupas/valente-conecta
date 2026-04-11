'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export function useAdminUsuarios() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('users').select('*').then(({ data }) => {
      setUsers(data || [])
      setLoading(false)
    })
  }, [])

  return { users, loading }
}
