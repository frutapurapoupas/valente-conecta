'use client'

import { useState, useEffect } from 'react'
import { Settings, DollarSign, Users, Store, Briefcase, Calendar, ShoppingCart, Dumbbell, Save, AlertCircle } from 'lucide-react'

interface BonusConfig {
  id: string
  type: 'amigos' | 'empresa' | 'profissionais' | 'servicos' | 'ambulantes' | 'academia'
  name: string
  batchSize: number
  amount: number
  description: string
  active: boolean
}

interface GlobalConfig {
  ambassadorThreshold: number
  populationTarget: number
  unlockRate: number
}

export default function AdminConfiguracoesBonusPage() {
  const [bonusConfigs, setBonusConfigs] = useState<BonusConfig[]>([
    {
      id: '1',
      type: 'amigos',
      name: 'Indicação de Amigos',
      batchSize: 10,
      amount: 2.00,
      description: 'Bônus pago a cada 10 amigos indicados',
      active: true
    },
    {
      id: '2',
      type: 'empresa',
      name: 'Indicação de Empresas/Lojas',
      batchSize: 3,
      amount: 2.00,
      description: 'Bônus pago a cada 3 empresas indicadas',
      active: true
    },
    {
      id: '3',
      type: 'profissionais',
      name: 'Indicação de Profissionais',
      batchSize: 5,
      amount: 1.50,
      description: 'Bônus pago a cada 5 profissionais indicados',
      active: false
    },
    {
      id: '4',
      type: 'servicos',
      name: 'Indicação de Serviços',
      batchSize: 7,
      amount: 3.00,
      description: 'Bônus pago a cada 7 serviços indicados',
      active: false
    },
    {
      id: '5',
      type: 'ambulantes',
      name: 'Indicação de Ambulantes',
      batchSize: 8,
      amount: 1.00,
      description: 'Bônus pago a cada 8 ambulantes indicados',
      active: false
    },
    {
      id: '6',
      type: 'academia',
      name: 'Indicação de Academia',
      batchSize: 4,
      amount: 2.50,
      description: 'Bônus pago a cada 4 academias indicadas',
      active: false
    }
  ])

  const [globalConfig, setGlobalConfig] = useState<GlobalConfig>({
    ambassadorThreshold: 15, // 15% de adoção para liberar bônus
    populationTarget: 40000, // População total de Valente-BA
    unlockRate: 100 // 100% de liberação quando threshold atingido
  })

  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')

  const getIcon = (type: string) => {
    switch (type) {
      case 'amigos': return Users
      case 'empresa': return Store
      case 'profissionais': return Briefcase
      case 'servicos': return Calendar
      case 'ambulantes': return ShoppingCart
      case 'academia': return Dumbbell
      default: return Settings
    }
  }

  const updateBonusConfig = (id: string, field: keyof BonusConfig, value: any) => {
    setBonusConfigs(prev => prev.map(config => 
      config.id === id ? { ...config, [field]: value } : config
    ))
  }

  const updateGlobalConfig = (field: keyof GlobalConfig, value: number) => {
    setGlobalConfig(prev => ({ ...prev, [field]: value }))
  }

  const saveConfigurations = async () => {
    setIsSaving(true)
    setSaveMessage('')

    try {
      // Simular salvamento na API
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setSaveMessage('Configurações salvas com sucesso!')
      setTimeout(() => setSaveMessage(''), 3000)
    } catch (error) {
      setSaveMessage('Erro ao salvar configurações. Tente novamente.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-900 text-white p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-yellow-500 mb-2">Configurações de Bônus</h1>
          <p className="text-zinc-400">Gerencie os critérios de pagamento do sistema de indicações</p>
        </div>

        {/* Configurações Globais */}
        <div className="bg-zinc-800 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-yellow-500 mb-6">Configurações Globais - Embaixador Conecta</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Meta de Adoção (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={globalConfig.ambassadorThreshold}
                  onChange={(e) => updateGlobalConfig('ambassadorThreshold', Number(e.target.value))}
                  className="w-full bg-zinc-700 border border-zinc-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  min="1"
                  max="100"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-400">%</span>
              </div>
              <p className="text-xs text-zinc-500 mt-1">
                Percentual mínimo para liberar bônus de indicação
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                População Alvo
              </label>
              <input
                type="number"
                value={globalConfig.populationTarget}
                onChange={(e) => updateGlobalConfig('populationTarget', Number(e.target.value))}
                className="w-full bg-zinc-700 border border-zinc-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                min="1000"
              />
              <p className="text-xs text-zinc-500 mt-1">
                População total da região
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Taxa de Liberação (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={globalConfig.unlockRate}
                  onChange={(e) => updateGlobalConfig('unlockRate', Number(e.target.value))}
                  className="w-full bg-zinc-700 border border-zinc-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  min="1"
                  max="100"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-400">%</span>
              </div>
              <p className="text-xs text-zinc-500 mt-1">
                Percentual de bônus liberado ao atingir meta
              </p>
            </div>
          </div>

          <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-xl p-4 mt-6">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-400">
                <p className="font-medium mb-1">Como funciona o Embaixador Conecta:</p>
                <ul className="space-y-1 text-zinc-300">
                  <li>Os usuários só liberam bônus de indicação quando a meta de adoção for atingida</li>
                  <li>Bônus ficam bloqueados até que {globalConfig.ambassadorThreshold}% da população ativa use o app</li>
                  <li>A liberação é gradual conforme o percentual de usuários ativos cresce</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Configurações por Tipo */}
        <div className="bg-zinc-800 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-yellow-500 mb-6">Configurações por Tipo de Indicação</h2>
          
          <div className="space-y-6">
            {bonusConfigs.map((config) => {
              const Icon = getIcon(config.type)
              return (
                <div key={config.id} className="bg-zinc-700 rounded-xl p-6">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      config.active ? 'bg-yellow-500/20' : 'bg-zinc-600'
                    }`}>
                      <Icon className={`w-6 h-6 ${config.active ? 'text-yellow-500' : 'text-zinc-400'}`} />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-bold text-white">{config.name}</h3>
                          <p className="text-zinc-400 text-sm">{config.description}</p>
                        </div>
                        
                        <button
                          onClick={() => updateBonusConfig(config.id, 'active', !config.active)}
                          className={`px-4 py-2 rounded-lg font-medium transition ${
                            config.active 
                              ? 'bg-green-500 text-white hover:bg-green-600' 
                              : 'bg-zinc-600 text-zinc-400 hover:bg-zinc-500'
                          }`}
                        >
                          {config.active ? 'Ativo' : 'Inativo'}
                        </button>
                      </div>

                      {config.active && (
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-2">
                              Quantidade por Lote
                            </label>
                            <input
                              type="number"
                              value={config.batchSize}
                              onChange={(e) => updateBonusConfig(config.id, 'batchSize', Number(e.target.value))}
                              className="w-full bg-zinc-600 border border-zinc-500 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                              min="1"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-2">
                              Valor do Bônus (R$)
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              value={config.amount}
                              onChange={(e) => updateBonusConfig(config.id, 'amount', Number(e.target.value))}
                              className="w-full bg-zinc-600 border border-zinc-500 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                              min="0"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Resumo e Salvar */}
        <div className="bg-zinc-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-yellow-500">Resumo das Configurações</h2>
            <button
              onClick={saveConfigurations}
              disabled={isSaving}
              className="bg-yellow-500 text-zinc-900 px-6 py-3 rounded-xl font-bold hover:bg-yellow-400 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin"></div>
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Salvar Configurações
                </>
              )}
            </button>
          </div>

          {saveMessage && (
            <div className={`p-4 rounded-lg mb-4 ${
              saveMessage.includes('sucesso') 
                ? 'bg-green-500/20 border border-green-500/50 text-green-400' 
                : 'bg-red-500/20 border border-red-500/50 text-red-400'
            }`}>
              <p className="text-sm">{saveMessage}</p>
            </div>
          )}

          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-zinc-700 rounded-lg p-4 text-center">
              <DollarSign className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">
                R${bonusConfigs.filter(c => c.active).reduce((sum, c) => sum + c.amount, 0).toFixed(2)}
              </p>
              <p className="text-zinc-400 text-sm">Total em Bônus Ativos</p>
            </div>
            
            <div className="bg-zinc-700 rounded-lg p-4 text-center">
              <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">
                {bonusConfigs.filter(c => c.active).length}
              </p>
              <p className="text-zinc-400 text-sm">Tipos Ativos</p>
            </div>
            
            <div className="bg-zinc-700 rounded-lg p-4 text-center">
              <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">{globalConfig.ambassadorThreshold}%</p>
              <p className="text-zinc-400 text-sm">Meta de Adoção</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
