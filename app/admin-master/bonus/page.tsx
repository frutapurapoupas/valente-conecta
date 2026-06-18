'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { 
  Award, Settings, Save, DollarSign, Users, TrendingUp, 
  Zap, Dumbbell, Crown, Calendar, Building2, Info, CheckCircle, ArrowLeft
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

interface ConfiguracaoBonus {
  id: string
  modulo: 'ambulante' | 'academia' | 'profissional' | 'servico' | 'cidade' | 'empresa' | 'imovel_alugar' | 'imovel_vender' | 'transporte_delivery' | 'usuario_comum'
  nome: string
  bonusPorIndicacao: number
  indicacoesNecessarias: number
  ativo: boolean
}

const CONFIGURACOES_INICIAIS: ConfiguracaoBonus[] = [
  {
    id: '1',
    modulo: 'ambulante',
    nome: 'Ambulantes',
    bonusPorIndicacao: 10,
    indicacoesNecessarias: 3,
    ativo: true,
  },
  {
    id: '2',
    modulo: 'academia',
    nome: 'Academia',
    bonusPorIndicacao: 5,
    indicacoesNecessarias: 3,
    ativo: true,
  },
  {
    id: '3',
    modulo: 'profissional',
    nome: 'Profissionais',
    bonusPorIndicacao: 5,
    indicacoesNecessarias: 3,
    ativo: true,
  },
  {
    id: '4',
    modulo: 'servico',
    nome: 'Serviços com Agendamento',
    bonusPorIndicacao: 5,
    indicacoesNecessarias: 3,
    ativo: true,
  },
  {
    id: '5',
    modulo: 'cidade',
    nome: 'Plano Cidade',
    bonusPorIndicacao: 10,
    indicacoesNecessarias: 3,
    ativo: true,
  },
  {
    id: '6',
    modulo: 'empresa',
    nome: 'Empresas e Lojas',
    bonusPorIndicacao: 10,
    indicacoesNecessarias: 3,
    ativo: true,
  },
  {
    id: '7',
    modulo: 'imovel_alugar',
    nome: 'Imóveis - Aluguel',
    bonusPorIndicacao: 5,
    indicacoesNecessarias: 2,
    ativo: true,
  },
  {
    id: '8',
    modulo: 'imovel_vender',
    nome: 'Imóveis - Venda',
    bonusPorIndicacao: 10,
    indicacoesNecessarias: 2,
    ativo: true,
  },
  {
    id: '9',
    modulo: 'transporte_delivery',
    nome: 'Transporte e Delivery',
    bonusPorIndicacao: 5,
    indicacoesNecessarias: 4,
    ativo: true,
  },
  {
    id: '10',
    modulo: 'usuario_comum',
    nome: 'Usuários Comuns (WhatsApp)',
    bonusPorIndicacao: 2,
    indicacoesNecessarias: 10,
    ativo: true,
  },
]

export default function AdminMasterBonusPage() {
  const { isAdminMaster } = useAuth()
  const [configuracoes, setConfiguracoes] = useState<ConfiguracaoBonus[]>(CONFIGURACOES_INICIAIS)
  const [saving, setSaving] = useState(false)
  const [periodoPrePago, setPeriodoPrePago] = useState(15)

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

  const handleSalvarConfiguracoes = async () => {
    setSaving(true)
    try {
      // Salvar configurações de bônus
      for (const config of configuracoes) {
        await supabase
          .from('bonus_configuracoes')
          .upsert({
            id: config.id,
            modulo: config.modulo,
            nome: config.nome,
            bonus_por_indicacao: config.bonusPorIndicacao,
            indicacoes_necessarias: config.indicacoesNecessarias,
            ativo: config.ativo,
            updated_at: new Date().toISOString(),
          })
      }

      // Salvar período pré-pago
      await supabase
        .from('configuracoes_sistema')
        .upsert({
          chave: 'periodo_pre_pago',
          valor: periodoPrePago.toString(),
          updated_at: new Date().toISOString(),
        })

      alert('Configurações salvas com sucesso!')
    } catch (error) {
      console.error('Erro ao salvar configurações:', error)
      alert('Erro ao salvar configurações')
    } finally {
      setSaving(false)
    }
  }

  const updateConfiguracao = (id: string, campo: keyof ConfiguracaoBonus, valor: any) => {
    setConfiguracoes(prev => prev.map(config => 
      config.id === id ? { ...config, [campo]: valor } : config
    ))
  }

  const getIconeModulo = (modulo: string) => {
    switch (modulo) {
      case 'ambulante': return <Zap className="w-5 h-5 text-amber-400" />
      case 'academia': return <Dumbbell className="w-5 h-5 text-emerald-400" />
      case 'profissional': return <Crown className="w-5 h-5 text-yellow-400" />
      case 'servico': return <Calendar className="w-5 h-5 text-purple-400" />
      case 'cidade': return <Building2 className="w-5 h-5 text-blue-400" />
      case 'empresa': return <Building2 className="w-5 h-5 text-rose-400" />
      case 'imovel_alugar': return <Building2 className="w-5 h-5 text-cyan-400" />
      case 'imovel_vender': return <Building2 className="w-5 h-5 text-orange-400" />
      case 'transporte_delivery': return <Calendar className="w-5 h-5 text-teal-400" />
      case 'usuario_comum': return <Users className="w-5 h-5 text-green-400" />
      default: return <Award className="w-5 h-5" />
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-zinc-900/95 backdrop-blur border-b border-zinc-800">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                href="/admin-master/dashboard"
                className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
                title="Voltar para Dashboard"
              >
                <ArrowLeft className="w-5 h-5 text-zinc-400" />
              </Link>
              <Award className="w-6 h-6 text-yellow-500" />
              <div>
                <h1 className="text-xl font-bold">Configurações de Bônus</h1>
                <p className="text-zinc-400 text-sm">Admin Master</p>
              </div>
            </div>
            <button
              onClick={handleSalvarConfiguracoes}
              disabled={saving}
              className="bg-yellow-500 text-zinc-900 px-4 py-2 rounded-lg font-medium hover:bg-yellow-400 transition flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Informações */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-400 mt-0.5" />
            <div>
              <h3 className="font-bold text-blue-400 mb-1">Como funciona o sistema de bônus</h3>
              <p className="text-sm text-blue-300">
                Usuários que indicarem outros para o sistema recebem bônus financeiros. 
                O bônus é liberado quando o indicado adquirir um plano pago e o indicador 
                atingir o número mínimo de indicações necessárias.
              </p>
            </div>
          </div>
        </div>

        {/* Configuração Período Pré-Pago */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5 text-yellow-500" />
            Período Pré-Pago
          </h2>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                Dias para pagamento após ativação do plano
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={periodoPrePago}
                  onChange={(e) => setPeriodoPrePago(parseInt(e.target.value) || 15)}
                  className="w-32 bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white"
                  min={1}
                  max={90}
                />
                <span className="text-zinc-400">dias</span>
              </div>
            </div>
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 max-w-md">
              <p className="text-sm text-yellow-300">
                Após este período sem pagamento via PIX, o plano será bloqueado automaticamente 
                e uma notificação push será enviada ao usuário informando a suspensão.
              </p>
            </div>
          </div>
        </div>

        {/* Configurações por Módulo */}
        <div>
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-500" />
            Bônus por Módulo
          </h2>
          <div className="space-y-4">
            {configuracoes.map(config => (
              <div
                key={config.id}
                className={`bg-zinc-900 border rounded-2xl p-6 ${!config.ativo ? 'opacity-50' : 'border-zinc-800'}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center">
                      {getIconeModulo(config.modulo)}
                    </div>
                    <div>
                      <h3 className="font-bold text-white">{config.nome}</h3>
                      <p className="text-sm text-zinc-400">Módulo: {config.modulo}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => updateConfiguracao(config.id, 'ativo', !config.ativo)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                      config.ativo
                        ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                        : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                    }`}
                  >
                    {config.ativo ? 'Ativo' : 'Inativo'}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">
                      Bônus por indicação (R$)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">R$</span>
                      <input
                        type="number"
                        step="0.01"
                        value={config.bonusPorIndicacao}
                        onChange={(e) => updateConfiguracao(config.id, 'bonusPorIndicacao', parseFloat(e.target.value) || 0)}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-10 pr-4 py-2 text-white"
                        disabled={!config.ativo}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">
                      Indicações necessárias para desbloqueio
                    </label>
                    <input
                      type="number"
                      value={config.indicacoesNecessarias}
                      onChange={(e) => updateConfiguracao(config.id, 'indicacoesNecessarias', parseInt(e.target.value) || 0)}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white"
                      min={1}
                      disabled={!config.ativo}
                    />
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-zinc-800">
                  <div className="flex items-center gap-2 text-sm text-zinc-400">
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                    <span>
                      Bônus total potencial: R$ {(config.bonusPorIndicacao * config.indicacoesNecessarias).toFixed(2)}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 mt-2">
                    O usuário precisa indicar {config.indicacoesNecessarias} pessoas diferentes que adquiram um plano pago 
                    para receber o bônus total de R$ {(config.bonusPorIndicacao * config.indicacoesNecessarias).toFixed(2)}.
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Resumo */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            Resumo das Configurações
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-zinc-800 rounded-xl p-4">
              <p className="text-sm text-zinc-400 mb-1">Módulos ativos</p>
              <p className="text-2xl font-bold text-white">
                {configuracoes.filter(c => c.ativo).length} / {configuracoes.length}
              </p>
            </div>
            <div className="bg-zinc-800 rounded-xl p-4">
              <p className="text-sm text-zinc-400 mb-1">Período pré-pago</p>
              <p className="text-2xl font-bold text-white">{periodoPrePago} dias</p>
            </div>
            <div className="bg-zinc-800 rounded-xl p-4">
              <p className="text-sm text-zinc-400 mb-1">Maior bônus por indicação</p>
              <p className="text-2xl font-bold text-emerald-400">
                R$ {Math.max(...configuracoes.map(c => c.bonusPorIndicacao)).toFixed(2)}
              </p>
            </div>
            <div className="bg-zinc-800 rounded-xl p-4">
              <p className="text-sm text-zinc-400 mb-1">Menor bônus por indicação</p>
              <p className="text-2xl font-bold text-yellow-400">
                R$ {Math.min(...configuracoes.map(c => c.bonusPorIndicacao)).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
