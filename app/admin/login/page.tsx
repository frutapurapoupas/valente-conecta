'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Login() {
  const [email, setEmail] = useState('admin@valente.com')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (email === 'admin@valente.com' && password === 'Admin@123456') {
      localStorage.setItem('admin_logged', 'true')
      router.push('/admin/dashboard')
    } else {
      setError('Email ou senha inválidos')
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea, #764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: 'white', padding: '40px', borderRadius: '16px', width: '100%', maxWidth: '400px' }}>
        <h1 style={{ fontSize: '24px', textAlign: 'center', marginBottom: '8px' }}>Admin Master</h1>
        <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: '32px' }}>Valente Conecta</p>
        <form onSubmit={handleLogin}>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" style={{ width: '100%', padding: '12px', marginBottom: '16px', border: '1px solid #ddd', borderRadius: '8px' }} />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Senha" style={{ width: '100%', padding: '12px', marginBottom: '16px', border: '1px solid #ddd', borderRadius: '8px' }} />
          {error && <div style={{ color: 'red', marginBottom: '16px', textAlign: 'center' }}>{error}</div>}
          <button type="submit" style={{ width: '100%', background: '#667eea', color: 'white', padding: '12px', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Entrar</button>
        </form>
      </div>
    </div>
  )
}