'use client'

import { useState } from 'react'
import { Store, MapPin, Clock, Users, Settings, Check, ChevronRight, X } from 'lucide-react'

interface CardConfiguracaoLojaProps {
  nomeLoja: string
  onConcluir: (configuracoes: ConfiguracoesLoja) => void
  onPular: () => void
}

interface ConfiguracoesLoja {
  horarioFuncionamento: {
    abertura: string
    fechamento: string
    diasFuncionamento: string[]
  }
  localizacao: {
    endereco: string
    pontoReferencia: string
    raioAtendimento: number
  }
  equipe: {
    quantidadeFuncionarios: number
    permiteMultiAcesso: boolean
  }
  notificacoes: {
    alertasPedidos: boolean
    alertasEstoque: boolean
    alertasAgendamentos: boolean
  }
}

export function CardConfiguracaoLoja({ nomeLoja, onConcluir, onPular }: CardConfiguracaoLojaProps) {
  const [step, setStep] = useState(1)
  const [configuracoes, setConfiguracoes] = useState<ConfiguracoesLoja>({
    horarioFuncionamento: {
      abertura: '08:00',
      fechamento: '18:00',
      diasFuncionamento: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta']
    },
    localizacao: {
      endereco: '',
      pontoReferencia: '',
      raioAtendimento: 5
    },
    equipe: {
      quantidadeFuncionarios: 1,
      permiteMultiAcesso: false
    },
    notificacoes: {
      alertasPedidos: true,
      alertasEstoque: true,
      alertasAgendamentos: true
    }
  })

  const DIAS_SEMANA = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo']

  const toggleDia = (dia: string) => {
    const dias = configuracoes.horarioFuncionamento.diasFuncionamento
    setConfiguracoes({
      ...configuracoes,
      horarioFuncionamento: {
        ...configuracoes.horarioFuncionamento,
        diasFuncionamento: dias.includes(dia)
          ? dias.filter(d => d !== dia)
          : [...dias, dia]
      }
    })
  }

  const handleConcluir = () => {
    onConcluir(configuracoes)
  }

  const steps = [
    {
      id: 1,
      titulo: 'Horário de Funcionamento',
      icone: <Clock className="w-6 h-6" />,
      conteudo: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-800 uppercase tracking-wide">Abertura</label>
              <input
                type="time"
                value={configuracoes.horarioFuncionamento.abertura}
                onChange={e => setConfiguracoes({
                  ...configuracoes,
                  horarioFuncionamento: {
                    ...configuracoes.horarioFuncionamento,
                    abertura: e.target.value
                  }
                })}
                className="mt-1 w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 font-medium bg-white"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-800 uppercase tracking-wide">Fechamento</label>
              <input
                type="time"
                value={configuracoes.horarioFuncionamento.fechamento}
                onChange={e => setConfiguracoes({
                  ...configuracoes,
                  horarioFuncionamento: {
                    ...configuracoes.horarioFuncionamento,
                    fechamento: e.target.value
                  }
                })}
                className="mt-1 w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 font-medium bg-white"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-800 uppercase tracking-wide mb-2 block">Dias de funcionamento</label>
            <div className="flex flex-wrap gap-2">
              {DIAS_SEMANA.map(dia => (
                <button
                  key={dia}
                  onClick={() => toggleDia(dia)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all ${
                    configuracoes.horarioFuncionamento.diasFuncionamento.includes(dia)
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-gray-300 text-gray-700'
                  }`}
                >
                  {dia.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      id: 2,
      titulo: 'Localização',
      icone: <MapPin className="w-6 h-6" />,
      conteudo: (
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-800 uppercase tracking-wide">Endereço completo</label>
            <input
              type="text"
              value={configuracoes.localizacao.endereco}
              onChange={e => setConfiguracoes({
                ...configuracoes,
                localizacao: { ...configuracoes.localizacao, endereco: e.target.value }
              })}
              placeholder="Rua, número, bairro"
              className="mt-1 w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 font-medium bg-white"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-800 uppercase tracking-wide">Ponto de referência</label>
            <input
              type="text"
              value={configuracoes.localizacao.pontoReferencia}
              onChange={e => setConfiguracoes({
                ...configuracoes,
                localizacao: { ...configuracoes.localizacao, pontoReferencia: e.target.value }
              })}
              placeholder="Ex: Próximo à praça central"
              className="mt-1 w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 font-medium bg-white"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-800 uppercase tracking-wide">Raio de atendimento (km)</label>
            <input
              type="number"
              value={configuracoes.localizacao.raioAtendimento}
              onChange={e => setConfiguracoes({
                ...configuracoes,
                localizacao: { ...configuracoes.localizacao, raioAtendimento: parseInt(e.target.value) || 5 }
              })}
              min="1"
              max="50"
              className="mt-1 w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 font-medium bg-white"
            />
          </div>
        </div>
      )
    },
    {
      id: 3,
      titulo: 'Equipe',
      icone: <Users className="w-6 h-6" />,
      conteudo: (
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-800 uppercase tracking-wide">Quantidade de funcionários</label>
            <input
              type="number"
              value={configuracoes.equipe.quantidadeFuncionarios}
              onChange={e => setConfiguracoes({
                ...configuracoes,
                equipe: { ...configuracoes.equipe, quantidadeFuncionarios: parseInt(e.target.value) || 1 }
              })}
              min="1"
              className="mt-1 w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 font-medium bg-white"
            />
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <p className="font-bold text-gray-900">Acesso múltiplo</p>
              <p className="text-sm text-gray-500">Permitir que múltiplos funcionários acessem o painel</p>
            </div>
            <button
              onClick={() => setConfiguracoes({
                ...configuracoes,
                equipe: { ...configuracoes.equipe, permiteMultiAcesso: !configuracoes.equipe.permiteMultiAcesso }
              })}
              className={`w-14 h-8 rounded-full transition-all ${
                configuracoes.equipe.permiteMultiAcesso ? 'bg-indigo-600' : 'bg-gray-300'
              }`}
            >
              <div className={`w-6 h-6 bg-white rounded-full transition-all ${
                configuracoes.equipe.permiteMultiAcesso ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
        </div>
      )
    },
    {
      id: 4,
      titulo: 'Notificações',
      icone: <Settings className="w-6 h-6" />,
      conteudo: (
        <div className="space-y-3">
          {[
            { key: 'alertasPedidos', label: 'Alertas de pedidos', desc: 'Receba notificações de novos pedidos' },
            { key: 'alertasEstoque', label: 'Alertas de estoque', desc: 'Avisos quando produtos estiverem acabando' },
            { key: 'alertasAgendamentos', label: 'Alertas de agendamentos', desc: 'Notificações de novos agendamentos' }
          ].map(item => (
            <div key={item.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <p className="font-bold text-gray-900">{item.label}</p>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
              <button
                onClick={() => setConfiguracoes({
                  ...configuracoes,
                  notificacoes: { ...configuracoes.notificacoes, [item.key]: !configuracoes.notificacoes[item.key as keyof typeof configuracoes.notificacoes] }
                })}
                className={`w-14 h-8 rounded-full transition-all ${
                  configuracoes.notificacoes[item.key as keyof typeof configuracoes.notificacoes] ? 'bg-indigo-600' : 'bg-gray-300'
                }`}
              >
                <div className={`w-6 h-6 bg-white rounded-full transition-all ${
                  configuracoes.notificacoes[item.key as keyof typeof configuracoes.notificacoes] ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>
          ))}
        </div>
      )
    }
  ]

  const currentStep = steps[step - 1]

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-violet-700 p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Store className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black">Configurar {nomeLoja}</h2>
                <p className="text-sm opacity-80">Personalize seu ambiente de trabalho</p>
              </div>
            </div>
            <button onClick={onPular} className="text-white/80 hover:text-white text-sm font-medium">
              Pular
            </button>
          </div>
          
          {/* Progress */}
          <div className="flex gap-2">
            {steps.map((s, i) => (
              <div
                key={s.id}
                className={`flex-1 h-1 rounded-full transition-all ${
                  i + 1 <= step ? 'bg-white' : 'bg-white/30'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
              {currentStep.icone}
            </div>
            <h3 className="text-lg font-black text-gray-900">{currentStep.titulo}</h3>
          </div>
          {currentStep.conteudo}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 flex gap-3">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all"
            >
              Voltar
            </button>
          )}
          <button
            onClick={step === steps.length ? handleConcluir : () => setStep(step + 1)}
            className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-violet-700 text-white rounded-xl font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2"
          >
            {step === steps.length ? (
              <>
                <Check className="w-5 h-5" />
                Concluir Configuração
              </>
            ) : (
              <>
                Próximo
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
