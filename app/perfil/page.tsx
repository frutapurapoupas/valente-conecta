// Página de perfil do usuário para cadastro/edição
'use client'

import { useState, useEffect } from 'react'

export default function PerfilPage() {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [editando, setEditando] = useState(false)

  useEffect(() => {
    // Simulação: buscar dados do usuário do localStorage ou API
    const user = JSON.parse(localStorage.getItem('perfil_usuario') || '{}')
    if (user.nome) setNome(user.nome)
    if (user.email) setEmail(user.email)
  }, [])

  function salvarPerfil(e) {
    e.preventDefault()
    localStorage.setItem('perfil_usuario', JSON.stringify({ nome, email }))
    setEditando(false)
    alert('Perfil salvo com sucesso!')
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-md">
        <h1 className="text-2xl font-black text-white mb-4">Meu Perfil</h1>
        <form onSubmit={salvarPerfil} className="space-y-4">
          <div>
            <label className="block text-zinc-400 text-xs font-bold mb-1">Nome</label>
            <input
              className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              type="text"
              value={nome}
              onChange={e => setNome(e.target.value)}
              placeholder="Digite seu nome"
              required
            />
          </div>
          <div>
            <label className="block text-zinc-400 text-xs font-bold mb-1">Email</label>
            <input
              className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Digite seu email"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700 transition"
          >
            Salvar
          </button>
        </form>
      </div>
    </div>
  )
}
