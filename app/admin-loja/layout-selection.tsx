'use client'

import { useState, useEffect } from 'react'
import { Monitor, Smartphone, ArrowRight, Store, Settings } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function AdminLojaLayoutSelection() {
  const router = useRouter()
  const [selectedLayout, setSelectedLayout] = useState<'desktop' | 'mobile'>('desktop')
  const [userRole, setUserRole] = useState<'admin' | 'delegado'>('admin')

  useEffect(() => {
    // Verificar se há preferência salva no localStorage
    const savedLayout = localStorage.getItem('admin-layout-preference') as 'desktop' | 'mobile'
    const savedRole = localStorage.getItem('user-role') as 'admin' | 'delegado'
    
    if (savedLayout) setSelectedLayout(savedLayout)
    if (savedRole) setUserRole(savedRole)
    
    // Se for delegado, forçar mobile
    if (savedRole === 'delegado') {
      setSelectedLayout('mobile')
      // Redirecionar diretamente para a versão mobile
      setTimeout(() => {
        router.push('/admin-loja/mobile')
      }, 1000)
    }
  }, [router])

  const handleLayoutSelection = (layout: 'desktop' | 'mobile') => {
    setSelectedLayout(layout)
    localStorage.setItem('admin-layout-preference', layout)
    
    // Redirecionar para a versão correspondente
    if (layout === 'desktop') {
      router.push('/admin-loja')
    } else {
      router.push('/admin-loja/mobile')
    }
  }

  const handleRoleSelection = (role: 'admin' | 'delegado') => {
    setUserRole(role)
    localStorage.setItem('user-role', role)
    
    if (role === 'delegado') {
      // Delegados sempre usam mobile
      setSelectedLayout('mobile')
      setTimeout(() => {
        router.push('/admin-loja/mobile')
      }, 1000)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-900 text-white flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Store className="w-12 h-12 text-yellow-500" />
            <h1 className="text-3xl font-black text-yellow-500 italic">
              Admin Loja
            </h1>
          </div>
          <p className="text-zinc-400 text-lg">
            Escolha seu tipo de acesso
          </p>
        </div>

        {/* Seleção de Papel */}
        <div className="bg-zinc-800 rounded-2xl p-6 mb-6">
          <h2 className="text-xl font-bold text-white mb-4 text-center">
            Quem é você?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => handleRoleSelection('admin')}
              className={`p-6 rounded-xl border-2 transition-all ${
                userRole === 'admin'
                  ? 'border-yellow-500 bg-yellow-500/20'
                  : 'border-zinc-600 bg-zinc-700 hover:border-zinc-500'
              }`}
            >
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                  <Settings className="w-8 h-8 text-yellow-500" />
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-bold text-white mb-1">Administrador</h3>
                  <p className="text-zinc-400 text-sm">
                    Acesso completo ao sistema
                  </p>
                </div>
              </div>
            </button>

            <button
              onClick={() => handleRoleSelection('delegado')}
              className={`p-6 rounded-xl border-2 transition-all ${
                userRole === 'delegado'
                  ? 'border-yellow-500 bg-yellow-500/20'
                  : 'border-zinc-600 bg-zinc-700 hover:border-zinc-500'
              }`}
            >
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 bg-blue-500/20 rounded-xl flex items-center justify-center">
                  <Store className="w-8 h-8 text-blue-500" />
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-bold text-white mb-1">Delegado</h3>
                  <p className="text-zinc-400 text-sm">
                    Acesso limitado ao mobile
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Seleção de Layout (apenas para admin) */}
        {userRole === 'admin' && (
          <div className="bg-zinc-800 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-4 text-center">
              Escolha o layout preferido
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => handleLayoutSelection('desktop')}
                className={`p-6 rounded-xl border-2 transition-all ${
                  selectedLayout === 'desktop'
                    ? 'border-yellow-500 bg-yellow-500/20'
                    : 'border-zinc-600 bg-zinc-700 hover:border-zinc-500'
                }`}
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 bg-green-500/20 rounded-xl flex items-center justify-center">
                    <Monitor className="w-8 h-8 text-green-500" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-lg font-bold text-white mb-1">Desktop</h3>
                    <p className="text-zinc-400 text-sm">
                      Padrão notebook - tela cheia
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleLayoutSelection('mobile')}
                className={`p-6 rounded-xl border-2 transition-all ${
                  selectedLayout === 'mobile'
                    ? 'border-yellow-500 bg-yellow-500/20'
                    : 'border-zinc-600 bg-zinc-700 hover:border-zinc-500'
                }`}
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 bg-blue-500/20 rounded-xl flex items-center justify-center">
                    <Smartphone className="w-8 h-8 text-blue-500" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-lg font-bold text-white mb-1">Mobile</h3>
                    <p className="text-zinc-400 text-sm">
                      Padrão celular - otimizado
                    </p>
                  </div>
                </div>
              </button>
            </div>

            {/* Informações Adicionais */}
            <div className="mt-6 p-4 bg-zinc-700 rounded-lg">
              <h4 className="font-bold text-yellow-500 mb-2">📋 Informações Importantes</h4>
              <div className="space-y-2 text-sm text-zinc-300">
                <p>
                  <span className="text-green-400 font-medium">• Administrador:</span> Pode escolher entre Desktop e Mobile
                </p>
                <p>
                  <span className="text-blue-400 font-medium">• Delegado:</span> Acesso automático ao Mobile (celular)
                </p>
                <p>
                  <span className="text-yellow-400 font-medium">• Desktop:</span> Ideal para notebooks e telas grandes
                </p>
                <p>
                  <span className="text-yellow-400 font-medium">• Mobile:</span> Otimizado para tablets e celulares
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Redirecionamento Automático */}
        {userRole === 'delegado' && (
          <div className="text-center">
            <div className="bg-blue-500/20 border border-blue-500/30 rounded-xl p-6">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Smartphone className="w-8 h-8 text-blue-400" />
                <h3 className="text-xl font-bold text-white">
                  Redirecionando para Mobile...
                </h3>
              </div>
              <p className="text-blue-400">
                Delegados sempre acessam a versão mobile otimizada
              </p>
              <div className="mt-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto"></div>
              </div>
            </div>
          </div>
        )}

        {/* Acesso Direto */}
        <div className="text-center mt-6">
          <p className="text-zinc-400 text-sm mb-4">
            Ou acesse diretamente:
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => router.push('/admin-loja')}
              className="flex items-center gap-2 bg-zinc-700 hover:bg-zinc-600 px-4 py-2 rounded-lg transition"
            >
              <Monitor className="w-4 h-4" />
              <span>Desktop</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => router.push('/admin-loja/mobile')}
              className="flex items-center gap-2 bg-zinc-700 hover:bg-zinc-600 px-4 py-2 rounded-lg transition"
            >
              <Smartphone className="w-4 h-4" />
              <span>Mobile</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
