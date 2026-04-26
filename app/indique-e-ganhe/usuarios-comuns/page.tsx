'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronLeft, Users, Gift, Check, Clock, AlertCircle, Copy, Share2, QrCode } from 'lucide-react'
import { useIndicacaoUsuarioComum } from '@/hooks/useIndicacaoUsuarioComum'
import { useAuth } from '@/hooks/useAuth'

export default function IndicacaoUsuarioComumPage() {
  const { user } = useAuth()
  const {
    loading,
    criarIndicacao,
    validarIndicacao,
    usarCreditoEmLoja,
    marcarParaResgateMensal,
    getIndicacoesByUsuario,
    getCreditosByUsuario,
    getProgresso,
    configuracao
  } = useIndicacaoUsuarioComum()

  const [indicacoes, setIndicacoes] = useState<any[]>([])
  const [creditos, setCreditos] = useState<any[]>([])
  const [progresso, setProgresso] = useState({
    indicacoesValidadas: 0,
    indicacoesNecessarias: 0,
    creditosDisponiveis: 0,
    proximoCreditoEm: 0
  })
  const [showShareModal, setShowShareModal] = useState(false)
  const [whatsappInput, setWhatsappInput] = useState('')
  const [codigoValidacao, setCodigoValidacao] = useState('')

  useEffect(() => {
    if (user?.id) {
      loadData()
    }
  }, [user?.id])

  const loadData = async () => {
    if (!user?.id) return

    const [indicacoesData, creditosData, progressoData] = await Promise.all([
      getIndicacoesByUsuario(user.id),
      getCreditosByUsuario(user.id),
      getProgresso(user.id)
    ])

    setIndicacoes(indicacoesData)
    setCreditos(creditosData)
    setProgresso(progressoData)
  }

  const handleCompartilhar = async () => {
    if (!whatsappInput) {
      alert('Digite o WhatsApp do indicado')
      return
    }

    try {
      await criarIndicacao(user.id, 'temp-id', whatsappInput)
      alert('Indicação criada! O indicado deve validar com o código.')
      setWhatsappInput('')
      setShowShareModal(false)
      loadData()
    } catch (error) {
      alert('Erro ao criar indicação')
    }
  }

  const handleValidar = async (indicacaoId: string) => {
    if (!codigoValidacao) {
      alert('Digite o código de validação')
      return
    }

    try {
      await validarIndicacao(indicacaoId, codigoValidacao)
      alert('Indicação validada com sucesso!')
      setCodigoValidacao('')
      loadData()
    } catch (error) {
      alert('Erro ao validar indicação')
    }
  }

  const handleUsarCredito = async (creditoId: string, lojaId: string) => {
    try {
      await usarCreditoEmLoja(creditoId, lojaId)
      alert('Crédito usado com sucesso!')
      loadData()
    } catch (error) {
      alert('Erro ao usar crédito')
    }
  }

  const handleMarcarResgate = async (creditoId: string, lojaId: string) => {
    try {
      await marcarParaResgateMensal(creditoId, lojaId)
      alert('Crédito marcado para resgate no final do mês!')
      loadData()
    } catch (error) {
      alert('Erro ao marcar para resgate')
    }
  }

  const linkIndicacao = `https://valenteconecta.com.br/indicar/${user?.id}`

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-24">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-zinc-900/95 backdrop-blur border-b border-zinc-800 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link href="/indique-e-ganhe" className="p-2 bg-zinc-800 rounded-xl">
            <ChevronLeft className="w-5 h-5 text-zinc-400" />
          </Link>
          <h1 className="text-lg font-black text-white">Indique Usuários Comuns</h1>
          <div className="w-10" />
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Card de Progresso */}
        <div className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 border border-green-500/30 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Users className="w-8 h-8 text-green-400" />
            <div>
              <h2 className="text-xl font-bold text-white">Seu Progresso</h2>
              <p className="text-sm text-zinc-400">Indicações validadas</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-zinc-300">Indicações validadas</span>
              <span className="text-2xl font-black text-green-400">
                {progresso.indicacoesValidadas} / {progresso.indicacoesNecessarias}
              </span>
            </div>

            <div className="w-full bg-zinc-800 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all"
                style={{
                  width: `${(progresso.indicacoesValidadas / progresso.indicacoesNecessarias) * 100}%`
                }}
              />
            </div>

            <div className="flex justify-between items-center text-sm">
              <span className="text-zinc-400">
                {progresso.proximoCreditoEm > 0
                  ? `Faltam ${progresso.proximoCreditoEm} indicações para o próximo crédito`
                  : 'Você já atingiu o objetivo!'}
              </span>
              <span className="text-green-400 font-bold">
                R$ {configuracao.bonusPorIndicacao.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Créditos Disponíveis */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Gift className="w-8 h-8 text-yellow-400" />
            <div>
              <h2 className="text-xl font-bold text-white">Créditos Disponíveis</h2>
              <p className="text-sm text-zinc-400">Use em qualquer loja com o app</p>
            </div>
          </div>

          {creditos.length === 0 ? (
            <div className="text-center py-8">
              <Gift className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
              <p className="text-zinc-500 font-medium">Nenhum crédito disponível</p>
              <p className="text-sm text-zinc-400 mt-1">
                Valide {progresso.indicacoesNecessarias} indicações para ganhar R$ {configuracao.bonusPorIndicacao.toFixed(2)}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {creditos.map(credito => (
                <div
                  key={credito.id}
                  className="bg-zinc-800 border border-zinc-700 rounded-xl p-4 flex items-center justify-between"
                >
                  <div>
                    <p className="font-bold text-white">R$ {credito.valor.toFixed(2)}</p>
                    <p className="text-xs text-zinc-400">
                      Gerado em {new Date(credito.dataGeracao).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUsarCredito(credito.id, 'loja-id')}
                      className="px-3 py-2 bg-green-600 rounded-lg text-sm font-bold hover:bg-green-700 transition"
                    >
                      Usar Agora
                    </button>
                    <button
                      onClick={() => handleMarcarResgate(credito.id, 'loja-id')}
                      className="px-3 py-2 bg-orange-600 rounded-lg text-sm font-bold hover:bg-orange-700 transition"
                    >
                      Resgate Mensal
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Link de Indicação */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Share2 className="w-8 h-8 text-blue-400" />
            <div>
              <h2 className="text-xl font-bold text-white">Compartilhar</h2>
              <p className="text-sm text-zinc-400">Envie para seus amigos</p>
            </div>
          </div>

          <button
            onClick={() => setShowShareModal(true)}
            className="w-full py-3 bg-blue-600 rounded-xl font-bold text-white hover:bg-blue-700 transition flex items-center justify-center gap-2"
          >
            <Share2 className="w-5 h-5" />
            Nova Indicação
          </button>
        </div>

        {/* Histórico de Indicações */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">Histórico de Indicações</h2>

          {indicacoes.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
              <p className="text-zinc-500 font-medium">Nenhuma indicação ainda</p>
              <p className="text-sm text-zinc-400 mt-1">Comece indicando seus amigos!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {indicacoes.map(indicacao => (
                <div
                  key={indicacao.id}
                  className="bg-zinc-800 border border-zinc-700 rounded-xl p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {indicacao.validado ? (
                        <Check className="w-5 h-5 text-green-400" />
                      ) : (
                        <Clock className="w-5 h-5 text-orange-400" />
                      )}
                      <span className="font-bold text-white">{indicacao.whatsapp}</span>
                    </div>
                    <span className="text-xs text-zinc-400">
                      {new Date(indicacao.dataIndicacao).toLocaleDateString('pt-BR')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${indicacao.validado ? 'text-green-400' : 'text-orange-400'}`}>
                      {indicacao.validado ? 'Validado' : 'Pendente de validação'}
                    </span>

                    {!indicacao.validado && (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Código"
                          value={codigoValidacao}
                          onChange={e => setCodigoValidacao(e.target.value)}
                          className="px-3 py-1 bg-zinc-700 rounded-lg text-sm w-24"
                        />
                        <button
                          onClick={() => handleValidar(indicacao.id)}
                          className="px-3 py-1 bg-green-600 rounded-lg text-sm font-bold hover:bg-green-700 transition"
                        >
                          Validar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Informações */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-zinc-400 mt-0.5" />
            <div className="text-sm text-zinc-400 space-y-2">
              <p><strong className="text-white">Como funciona:</strong></p>
              <ul className="list-disc list-inside space-y-1">
                <li>Indique usuários comuns com WhatsApp válido</li>
                <li>A cada {configuracao.indicacoesNecessarias} indicações validadas, você ganha R$ {configuracao.bonusPorIndicacao.toFixed(2)}</li>
                <li>Use o crédito em qualquer loja que usa o app</li>
                <li>Se a loja não usar o app, marque para resgate no final do mês</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* Modal de Compartilhamento */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center">
          <div className="bg-zinc-900 rounded-t-3xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-white">Nova Indicação</h2>
              <button
                onClick={() => setShowShareModal(false)}
                className="p-2 bg-zinc-800 rounded-lg"
              >
                <ChevronLeft className="w-6 h-6 text-zinc-400" />
              </button>
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wide">WhatsApp do Indicado</label>
              <input
                type="tel"
                value={whatsappInput}
                onChange={e => setWhatsappInput(e.target.value)}
                placeholder="Ex: 75988888888"
                className="mt-1 w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <button
              onClick={handleCompartilhar}
              className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl font-black text-lg flex items-center justify-center gap-2"
            >
              <Share2 className="w-5 h-5" />
              Criar Indicação
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
