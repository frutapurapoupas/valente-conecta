'use client'

import { useState, useEffect } from 'react'

export type UserRole = 'usuario' | 'servico_agendamento' | 'admin_master' | 'delegado'

export interface UserProfile {
  id: string
  nome: string
  email: string
  telefone: string
  role: UserRole
  servicoId?: string // Se for servico_agendamento, ID do serviço
  createdAt: string
}

const USER_KEY = 'valente_user_profile'

export function useAuth() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const savedUser = localStorage.getItem(USER_KEY)
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setLoading(false)
  }, [])

  const login = (userData: UserProfile) => {
    setUser(userData)
    localStorage.setItem(USER_KEY, JSON.stringify(userData))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem(USER_KEY)
  }

  const updateUser = (updates: Partial<UserProfile>) => {
    if (user) {
      const updated = { ...user, ...updates }
      setUser(updated)
      localStorage.setItem(USER_KEY, JSON.stringify(updated))
    }
  }

  const isServicoAgendamento = user?.role === 'servico_agendamento'
  const isAdminMaster = user?.role === 'admin_master'
  const isDelegado = user?.role === 'delegado'

  return {
    user,
    loading,
    login,
    logout,
    updateUser,
    isServicoAgendamento,
    isAdminMaster,
    isDelegado,
  }
}
