'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const ADMIN_EMAIL = 'admin@valente.com'
const ADMIN_PASSWORD = 'Mestre@2026' // ⚠️ SENHA PROVISÓRIA — substituir ao final dos testes

export function useAdminLogin() {
  const [email, setEmail] = useState(ADMIN_EMAIL)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      localStorage.setItem('admin_logged', 'true')
      router.push('/admin/dashboard')
    } else {
      setError('Email ou senha inválidos')
    }
  }

  return { email, setEmail, password, setPassword, error, handleLogin }
}
