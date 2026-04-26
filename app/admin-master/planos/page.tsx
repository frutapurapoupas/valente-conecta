'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { usePlanos } from '@/hooks/usePlanos'
import { Save, Settings, DollarSign, Store, Calendar, Dumbbell, Zap, Crown, Check, X, ArrowLeft } from 'lucide-react'
import { DadosPlanoConfiguravel, CONFIGURACOES_PLANOS_INICIAIS } from '@/types/planos'
import Link from 'next/link'

export default function AdminMasterPlanosPage() {
  const { isAdminMaster } = useAuth()
  const planosHook = usePlanos()
  const [precos, setPrecos] = useState<DadosPlanoConfiguravel>(planosHook.precosConfiguraveis)
  const [configuracoes, setConfiguracoes] = useState(CONFIGURACOES_PLANOS_INICIAIS)
  const [saving, setSaving] = useState(false)

  // Temporariamente desabilitado para testes
  // if (!isAdminMaster) {
  //   return (
  //     <div className="min-h-screen bg-zinc-900 text-white flex items-center justify-center">
  //       <div className="text-center">
  //         <h1 className="text-2xl font-bold mb-2">Acesso Negado</h1>
  //         <p className="text-zinc-400">Apenas Admin Master pode acessar esta página</p>
  //       </div>
  //     </div>
  //   )
  // }

  const handleSalvarPrecos = async () => {
    setSaving(true)
    try {
      Object.entries(precos).forEach(([key, value]) => {
        planosHook.atualizarPrecoConfiguravel(key as keyof DadosPlanoConfiguravel, value)
      })
      alert('Preços atualizados com sucesso!')
    } catch (error) {
      console.error('Erro ao salvar preços:', error)
      alert('Erro ao salvar preços')
    }
    setSaving(false)
  }

  const togglePlanoAtivo = (id: string) => {
    setConfiguracoes(prev => prev.map(c => 
      c.id === id ? { ...c, ativo: !c.ativo } : c
    ))
  }

  const getIcone = (categoria: string) => {
    switch (categoria) {
      case 'academia': return <Dumbbell className="w-5 h-5" />
      case 'servico_agendamento': return <Calendar className="w-5 h-5" />
      case 'profissional': return <Crown className="w-5 h-5" />
      case 'ambulante': return <Zap className="w-5 h-5" />
      default: return <Store className="w-5 h-5" />
    }
  }

  const getCor = (categoria: string) => {
    switch (categoria) {
      case 'academia': return 'text-emerald-400 border-emerald-500/30'
      case 'servico_agendamento': return 'text-purple-400 border-purple-500/30'
      case 'profissional': return 'text-yellow-400 border-yellow-500/30'
      case 'ambulante': return 'text-amber-400 border-amber-500/30'
      default: return 'text-blue-400 border-blue-500/30'
    }
  }

  return (
    <div className="min-h-screen bg-zinc-900 text-white pb-24">
      <header className="sticky top-0 z-50 bg-zinc-900/95 backdrop-blur border-b border-zinc-800">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Link
              href="/admin-master/dashboard"
              className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
              title="Voltar para Dashboard"
            >
              <ArrowLeft className="w-5 h-5 text-zinc-400" />
            </Link>
            <Settings className="w-6 h-6 text-yellow-500" />
            <div>
              <h1 className="text-xl font-bold">Configuração de Planos</h1>
              <p className="text-zinc-400 text-sm">Admin Master</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-8">
        {/* Configuração de Preços */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-500" />
              Preços Configuráveis
            </h2>
            <button
              onClick={handleSalvarPrecos}
              disabled={saving}
              className="bg-yellow-500 text-zinc-900 px-4 py-2 rounded-lg font-medium hover:bg-yellow-400 transition flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Salvando...' : 'Salvar Preços'}
            </button>
          </div>

          <div className="bg-zinc-800 rounded-xl p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Academia Premium</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">R$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={precos.academiaPago}
                    onChange={(e) => setPrecos({ ...precos, academiaPago: parseFloat(e.target.value) })}
                    className="w-full bg-zinc-700 border border-zinc-600 rounded-lg pl-10 pr-4 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Profissional Básico</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">R$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={precos.profissionalBasico}
                    onChange={(e) => setPrecos({ ...precos, profissionalBasico: parseFloat(e.target.value) })}
                    className="w-full bg-zinc-700 border border-zinc-600 rounded-lg pl-10 pr-4 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Profissional Premium</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">R$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={precos.profissionalPremium}
                    onChange={(e) => setPrecos({ ...precos, profissionalPremium: parseFloat(e.target.value) })}
                    className="w-full bg-zinc-700 border border-zinc-600 rounded-lg pl-10 pr-4 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Serviço Agendamento Básico</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">R$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={precos.servicoAgendamentoBasico}
                    onChange={(e) => setPrecos({ ...precos, servicoAgendamentoBasico: parseFloat(e.target.value) })}
                    className="w-full bg-zinc-700 border border-zinc-600 rounded-lg pl-10 pr-4 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Serviço Agendamento Premium</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">R$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={precos.servicoAgendamentoPremium}
                    onChange={(e) => setPrecos({ ...precos, servicoAgendamentoPremium: parseFloat(e.target.value) })}
                    className="w-full bg-zinc-700 border border-zinc-600 rounded-lg pl-10 pr-4 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Ambulante Básico</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">R$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={precos.ambulanteBasico}
                    onChange={(e) => setPrecos({ ...precos, ambulanteBasico: parseFloat(e.target.value) })}
                    className="w-full bg-zinc-700 border border-zinc-600 rounded-lg pl-10 pr-4 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Ambulante Premium</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">R$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={precos.ambulantePremium}
                    onChange={(e) => setPrecos({ ...precos, ambulantePremium: parseFloat(e.target.value) })}
                    className="w-full bg-zinc-700 border border-zinc-600 rounded-lg pl-10 pr-4 py-2 text-white"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Configuração de Planos */}
        <section>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5 text-yellow-500" />
            Planos Disponíveis
          </h2>

          <div className="space-y-4">
            {configuracoes.map((plano) => (
              <div
                key={plano.id}
                className={`bg-zinc-800 border rounded-xl p-4 ${!plano.ativo ? 'opacity-50' : ''}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${getCor(plano.categoria)}`}>
                      {getIcone(plano.categoria)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-white">{plano.nome}</h3>
                        {plano.ativo ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <X className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                      <p className="text-sm text-zinc-400 mb-2">{plano.descricao}</p>
                      <p className="text-lg font-bold text-green-400">
                        {plano.preco === 0 ? 'Grátis' : `R$ ${plano.preco.toFixed(2)}`}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => togglePlanoAtivo(plano.id)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                      plano.ativo
                        ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                        : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                    }`}
                  >
                    {plano.ativo ? 'Desativar' : 'Ativar'}
                  </button>
                </div>

                <div className="mt-4 pt-4 border-t border-zinc-700">
                  <p className="text-xs font-medium text-zinc-400 mb-2">Recursos:</p>
                  <div className="flex flex-wrap gap-2">
                    {plano.recursos.map((recurso, idx) => (
                      <span
                        key={idx}
                        className="bg-zinc-700 px-2 py-1 rounded text-xs text-zinc-300"
                      >
                        {recurso}
                      </span>
                    ))}
                  </div>
                </div>

                {Object.keys(plano.limites).length > 0 && (
                  <div className="mt-4 pt-4 border-t border-zinc-700">
                    <p className="text-xs font-medium text-zinc-400 mb-2">Limites:</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                      {plano.limites.usuarios !== undefined && (
                        <div className="bg-zinc-700 px-2 py-1 rounded">
                          <span className="text-zinc-400">Usuários:</span>{' '}
                          <span className="text-white font-medium">
                            {plano.limites.usuarios === -1 ? 'Ilimitado' : plano.limites.usuarios}
                          </span>
                        </div>
                      )}
                      {plano.limites.catalogoItens !== undefined && (
                        <div className="bg-zinc-700 px-2 py-1 rounded">
                          <span className="text-zinc-400">Catálogo:</span>{' '}
                          <span className="text-white font-medium">
                            {plano.limites.catalogoItens === -1 ? 'Ilimitado' : plano.limites.catalogoItens}
                          </span>
                        </div>
                      )}
                      {plano.limites.relatorios && (
                        <div className="bg-zinc-700 px-2 py-1 rounded">
                          <span className="text-green-400">✓ Relatórios</span>
                        </div>
                      )}
                      {plano.limites.suportePrioritario && (
                        <div className="bg-zinc-700 px-2 py-1 rounded">
                          <span className="text-yellow-400">✓ Suporte Prioritário</span>
                        </div>
                      )}
                      {plano.limites.destaqueBusca && (
                        <div className="bg-zinc-700 px-2 py-1 rounded">
                          <span className="text-purple-400">✓ Destaque na Busca</span>
                        </div>
                      )}
                      {plano.limites.separacaoUsuarios && (
                        <div className="bg-zinc-700 px-2 py-1 rounded">
                          <span className="text-blue-400">✓ Separação por Usuários</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
