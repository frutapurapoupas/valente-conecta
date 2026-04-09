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
    // Ajustei para a senha que você costuma usar ou a que definimos
    if (email === 'admin@valente.com' && password === 'Admin@123456') {
      localStorage.setItem('admin_logged', 'true')
      router.push('/admin/dashboard')
    } else {
      setError('Acesso negado. Verifique as credenciais.')
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 font-sans">
      <div className="bg-zinc-900 p-10 rounded-60 border-4 border-zinc-800 w-full max-w-[450px] shadow-2xl">
        
        {/* LOGO E TÍTULO */}
        <header className="text-center mb-10">
          <h1 className="text-5xl font-black italic tracking-tighter text-white mb-2">
            VALENTE<span className="text-yellow-400">.</span>
          </h1>
          <p className="text-zinc-500 uppercase font-bold tracking-[0.2em] text-sm">
            Master Admin v2.0
          </p>
        </header>

        <form onSubmit={handleLogin} className="space-y-6">
          {/* CAMPO EMAIL */}
          <div>
            <label className="block text-zinc-500 text-xs uppercase font-black mb-2 ml-4">E-mail Administrativo</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              className="w-full bg-zinc-800 border-2 border-zinc-700 p-4 rounded-25 text-white text-lg outline-none focus:border-yellow-400 transition-all"
              placeholder="admin@valente.com"
            />
          </div>

          {/* CAMPO SENHA */}
          <div>
            <label className="block text-zinc-500 text-xs uppercase font-black mb-2 ml-4">Senha de Acesso</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="w-full bg-zinc-800 border-2 border-zinc-700 p-4 rounded-25 text-white text-lg outline-none focus:border-yellow-400 transition-all"
              placeholder="••••••••"
            />
          </div>

          {/* MENSAGEM DE ERRO */}
          {error && (
            <div className="bg-red-500/10 border-2 border-red-500/50 text-red-500 p-4 rounded-20 text-center font-bold text-sm animate-pulse">
              {error}
            </div>
          )}

          {/* BOTÃO ENTRAR - AGORA VISÍVEL E FORTE */}
          <button 
            type="submit" 
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-black uppercase italic py-5 rounded-25 text-xl transition-all transform active:scale-95 shadow-[0_0_20px_rgba(250,204,21,0.3)]"
          >
            Entrar no Painel
          </button>
        </form>

        <footer className="mt-10 text-center">
          <p className="text-zinc-600 text-xs uppercase font-bold">
            &copy; 2026 Valente Conecta Marketplace
          </p>
        </footer>
      </div>
    </div>
  )
}