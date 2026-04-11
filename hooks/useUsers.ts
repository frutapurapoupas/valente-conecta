'use client'

import { useState, useEffect, useCallback } from 'react'
import { getUsers, approveUser, blockUser, User } from '@/services/userService'

export function useUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      const data = await getUsers()
      setUsers(data)
      setError(null)
    } catch (err) {
      setError('Erro ao carregar usuários')
    } finally {
      setLoading(false)
    }
  }, [])

  const handleApprove = async (userId: string, _approved: boolean) => {
    await approveUser(userId)
    await fetchUsers()
  }

  const handleBlock = async (userId: string, blocked: boolean) => {
    await blockUser(userId, blocked)
    await fetchUsers()
  }

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  return { users, loading, error, handleApprove, handleBlock, refetch: fetchUsers }
}
