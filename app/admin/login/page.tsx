'use client'

import { useAdminLogin } from '@/hooks/useAdminLogin'

export default function Login() {
  const { email, setEmail, password, setPassword, error, handleLogin } = useAdminLogin()

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea, #764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: 'white', padding: 40, borderRadius: 16, width: 400 }}>
        <h1 style={{ fontSize: 24, textAlign: 'center', marginBottom: 8 }}>Admin Master</h1>
        <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: 32 }}>Valente Conecta</p>
        <form onSubmit={handleLogin}>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" style={{ width: '100%', padding: 12, marginBottom: 16, border: '1px solid #ddd', borderRadius: 8 }} />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Senha" style={{ width: '100%', padding: 12, marginBottom: 16, border: '1px solid #ddd', borderRadius: 8 }} />
          {error && <div style={{ color: 'red', marginBottom: 16, textAlign: 'center' }}>{error}</div>}
          <button type="submit" style={{ width: '100%', background: '#667eea', color: 'white', padding: 12, border: 'none', borderRadius: 8, cursor: 'pointer' }}>Entrar</button>
        </form>
      </div>
    </div>
  )
}