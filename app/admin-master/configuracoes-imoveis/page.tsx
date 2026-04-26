'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronLeft, Save, Home, Lock, Settings } from 'lucide-react'

export default function ConfiguracoesImoveisPage() {
  const [valorDesbloqueio, setValorDesbloqueio] = useState(30)
  const [salvo, setSalvo] = useState(false)

  useEffect(() => {
    carregarConfiguracao()
  }, [])

  const carregarConfiguracao = () => {
    const salvo = localStorage.getItem('config_valor_desbloqueio_imoveis')
    if (salvo) {
      setValorDesbloqueio(parseFloat(salvo))
    }
  }

  const salvarConfiguracao = () => {
    localStorage.setItem('config_valor_desbloqueio_imoveis', valorDesbloqueio.toString())
    setSalvo(true)
    setTimeout(() => setSalvo(false), 2000)
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-24">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-zinc-900/95 backdrop-blur border-b border-zinc-800 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link href="/admin-master/dashboard" className="p-2 bg-zinc-800 rounded-xl">
            <ChevronLeft className="w-5 h-5 text-zinc-400" />
          </Link>
          <h1 className="text-lg font-black text-white">Configurações Imóveis</h1>
          <div className="w-10" />
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Card de configuração */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-rose-600/20 p-3 rounded-xl">
              <Settings className="w-6 h-6 text-rose-400" />
            </div>
            <div>
              <h3 className="font-bold text-white">Valor de Desbloqueio</h3>
              <p className="text-sm text-zinc-400">Configure o valor para desbloquear anúncios de imóveis</p>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wide">Valor (R$)</label>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-2xl font-bold text-emerald-400">R$</span>
              <input
                type="number"
                step="1"
                min="0"
                value={valorDesbloqueio}
                onChange={e => setValorDesbloqueio(parseFloat(e.target.value) || 0)}
                className="flex-1 px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-2xl font-bold text-white focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          <div className="bg-zinc-800 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <Home className="w-4 h-4 text-rose-400" />
              <span>Usuários pagam este valor para desbloquear anúncios</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <Lock className="w-4 h-4 text-rose-400" />
              <span>Anúncios bloqueados não aparecem nas buscas</span>
            </div>
          </div>

          <button
            onClick={salvarConfiguracao}
            className="w-full py-3 bg-gradient-to-r from-rose-600 to-pink-600 rounded-xl font-bold text-white hover:from-rose-700 hover:to-pink-700 transition-all flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" />
            {salvo ? 'Salvo!' : 'Salvar Configuração'}
          </button>
        </div>

        {/* Informações adicionais */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <h3 className="font-bold text-white mb-3">Como funciona</h3>
          <div className="space-y-2 text-sm text-zinc-400">
            <p>1. Usuários cadastram imóveis gratuitamente</p>
            <p>2. Anúncios ficam bloqueados por padrão</p>
            <p>3. Para desbloquear, usuário paga o valor configurado</p>
            <p>4. Após pagamento, anúncio aparece nas buscas</p>
            <p>5. Contatos do anunciante ficam visíveis</p>
          </div>
        </div>
      </main>
    </div>
  )
}
