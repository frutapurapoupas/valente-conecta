'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { Check, ArrowLeft, Phone } from 'lucide-react'
import { useIndiquePage } from '@/hooks/useIndiquePage'

function IndicationContent() {
  const {
    step, setStep,
    formData, updateForm,
    installed,
    loading,
    erro,
    handleLogin,
    handleCadastro,
  } = useIndiquePage()

  if (installed) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-10 h-10 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Acesso liberado! ✅</h2>
          <p className="text-zinc-400 mb-4">Bem-vindo ao Valente Conecta</p>
          <div className="mt-4 w-full bg-zinc-800 rounded-full h-2">
            <div className="bg-emerald-500 rounded-full h-2 w-full animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  if (step === 1) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600">
        <div className="p-4">
          <Link href="/" className="inline-block p-2 bg-white/20 rounded-lg text-white">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </div>

        <div className="flex flex-col items-center justify-center px-4 py-8">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-xl">
            <div className="text-center mb-6">
              <img src="/icone.png" alt="Valente Conecta" className="w-24 h-24 mx-auto mb-3" />
              <h1 className="text-2xl font-bold">Valente Conecta</h1>
              <p className="text-gray-500 text-sm">PDV Colaborativo</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Telefone (WhatsApp)</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    value={formData.telefone}
                    onChange={(e) => updateForm('telefone', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border rounded-xl text-base"
                    placeholder="(00) 00000-0000"
                  />
                </div>
              </div>
              
              {erro && <p className="text-red-500 text-sm text-center">{erro}</p>}
              
              <button
                onClick={handleLogin}
                disabled={!formData.telefone || loading}
                className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold disabled:opacity-50"
              >
                {loading ? 'Verificando...' : 'Entrar'}
              </button>
              
              <button
                onClick={() => setStep(2)}
                className="w-full py-3 border border-gray-300 rounded-xl font-semibold text-gray-700"
              >
                Criar nova conta
              </button>
            </div>

            <p className="text-xs text-center text-gray-400 mt-4">
              ✅ Ao entrar, você concorda com nossos termos
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-4">
        <button onClick={() => setStep(1)} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>

      <div className="flex flex-col items-center justify-center px-4 py-4">
        <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-lg">
          <div className="text-center mb-6">
            <img src="/icone.png" alt="Logo" className="w-16 h-16 mx-auto mb-2" />
            <h2 className="text-xl font-bold">Criar conta grátis</h2>
            <p className="text-sm text-gray-500">Acesso imediato ao PDV e funcionalidades básicas</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nome completo</label>
              <input
                type="text"
                value={formData.nome}
                onChange={(e) => updateForm('nome', e.target.value)}
                className="w-full px-4 py-3 border rounded-xl"
                placeholder="Digite seu nome"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">E-mail</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => updateForm('email', e.target.value)}
                className="w-full px-4 py-3 border rounded-xl"
                placeholder="seu@email.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">WhatsApp</label>
              <input
                type="tel"
                value={formData.telefone}
                onChange={(e) => updateForm('telefone', e.target.value)}
                  className="w-full px-4 py-3 border rounded-xl"
                placeholder="(00) 00000-0000"
              />
            </div>

            <div className="bg-green-50 rounded-xl p-3 text-sm text-green-800">
              🎁 Plano Grátis incluí:<br/>
              • PDV básico<br/>
              • Busca de produtos<br/>
              • QR Code para vendas<br/>
              • Gestão de fiado<br/>
              • 5 consultas grátis/dia
            </div>

            {erro && <p className="text-red-500 text-sm text-center">{erro}</p>}

            <button
              onClick={handleCadastro}
              disabled={!formData.nome || !formData.telefone || !formData.email || loading}
              className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold disabled:opacity-50"
            >
              {loading ? 'Cadastrando...' : 'Criar conta grátis'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function IndiquePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Carregando...</div>}>
      <IndicationContent />
    </Suspense>
  )
}