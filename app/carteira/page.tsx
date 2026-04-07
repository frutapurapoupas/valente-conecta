'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Wallet, Gift, Users, Building, QrCode, Copy, Check, Zap, ArrowLeft, User, Clock, Lock, Unlock, TrendingUp, Award, Shield } from 'lucide-react'
import { getPlanoUsuario, getUsuarioLogado } from '@/services/auth'

interface Cliente {
  id: string
  nome: string
  telefone: string
  saldoFiado: number
  limiteCredito: number
  carteiraConecta: number
}

export default function CarteiraPage() {
  const [activeTab, setActiveTab] = useState<'saldo' | 'indicar' | 'bonus' | 'resgatar'>('saldo')
  const [copied, setCopied] = useState(false)
  const [userType, setUserType] = useState<'amigo' | 'empresa' | 'profissional'>('amigo')
  const [plano, setPlano] = useState<'gratis' | 'basico' | 'premium'>('gratis')
  const [usuario, setUsuario] = useState<any>(null)
  
  // Dados da loja (do usuário logado)
  const [loja, setLoja] = useState({
    nome: 'Valente Conecta',
    endereco: 'Rua Principal, 123 - Centro',
    cidade: 'Coité - BA'
  })

  // Dados completos da carteira
  const [walletData, setWalletData] = useState({
    saldoDisponivel: 45.00,
    saldoBloqueado: 105.00,
    totalBonusAcumulado: 150.00,
    indicacoesCompletadas: 2,
    indicacoesPendentes: 3,
    proximoPagamento: 50.00,
    diasProximoPagamento: 15,
    historicoPagamentos: [
      { id: 1, data: '01/03/2026', valor: 50.00, status: 'pago' },
      { id: 2, data: '01/02/2026', valor: 50.00, status: 'pago' },
    ]
  })

  const [indications, setIndications] = useState([
    { id: 1, name: 'João Silva', type: 'amigo', date: '01/04/2026', status: 'aprovado', value: 1, cicloCompleto: true },
    { id: 2, name: 'Padaria do Zé', type: 'empresa', date: '28/03/2026', status: 'aprovado', value: 2, cicloCompleto: true },
    { id: 3, name: 'Maria Fitness', type: 'profissional', date: '25/03/2026', status: 'aprovado', value: 2, cicloCompleto: true },
    { id: 4, name: 'Carlos Santos', type: 'amigo', date: '20/03/2026', status: 'pendente', value: 1, cicloCompleto: false },
    { id: 5, name: 'Loja do Pedro', type: 'empresa', date: '15/03/2026', status: 'pendente', value: 2, cicloCompleto: false },
    { id: 6, name: 'Ana Professora', type: 'profissional', date: '10/03/2026', status: 'pendente', value: 2, cicloCompleto: false },
  ])

  const [adminConfig] = useState({
    bonusAmigo: 1,
    bonusEmpresa: 2,
    bonusProfissional: 2,
    pagamentoMensalMax: 50
  })

  useEffect(() => {
    const planoUsuario = getPlanoUsuario()
    const usuarioLogado = getUsuarioLogado()
    setPlano(planoUsuario)
    setUsuario(usuarioLogado)
    
    // Carregar dados da loja do localStorage
    const lojaSalva = localStorage.getItem('loja_info')
    if (lojaSalva) {
      setLoja(JSON.parse(lojaSalva))
    }
  }, [])

  // Calcular bônus pendentes
  const bonusPendentesLiberacao = walletData.saldoBloqueado
  const mesesParaLiberar = Math.ceil(bonusPendentesLiberacao / adminConfig.pagamentoMensalMax)

  const copyToClipboard = () => {
    const link = `${window.location.origin}/indique?tipo=${userType}&codigo=${Date.now()}`
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white shadow-sm sticky top-0 z-20">
        <div className="flex items-center gap-3 px-4 py-3">
          <Link href="/" className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Logo" className="w-8 h-8" />
            <span className="font-bold text-lg">Minha Carteira</span>
          </div>
        </div>
      </header>

      <main className="p-4 max-w-7xl mx-auto">
        {/* Info do plano */}
        <div className={`rounded-xl p-3 mb-4 ${plano === 'premium' ? 'bg-purple-50' : plano === 'basico' ? 'bg-blue-50' : 'bg-gray-100'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-gray-600" />
              <p className="text-sm">
                Plano: <strong className="capitalize">{plano}</strong>
              </p>
            </div>
            {plano === 'gratis' && (
              <Link href="/planos">
                <button className="text-xs bg-blue-500 text-white px-3 py-1 rounded-full">
                  Fazer Upgrade
                </button>
              </Link>
            )}
          </div>
        </div>

        {/* Cards de Saldo */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4 rounded-2xl">
            <div className="flex items-center gap-2 mb-2">
              <Unlock className="w-5 h-5" />
              <p className="text-sm opacity-90">Disponível para Resgate</p>
            </div>
            <p className="text-2xl font-bold">R$ {walletData.saldoDisponivel.toFixed(2)}</p>
            <p className="text-xs opacity-80 mt-2">💰 Pode resgatar agora</p>
          </div>

          <div className="bg-gradient-to-r from-gray-500 to-gray-600 text-white p-4 rounded-2xl">
            <div className="flex items-center gap-2 mb-2">
              <Lock className="w-5 h-5" />
              <p className="text-sm opacity-90">Aguardando Liberação</p>
            </div>
            <p className="text-2xl font-bold">R$ {walletData.saldoBloqueado.toFixed(2)}</p>
            <p className="text-xs opacity-80 mt-2">⏳ Será liberado R$50/mês</p>
          </div>
        </div>

        {/* Próximo Pagamento */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm text-gray-500">Próximo pagamento</p>
            <p className="text-sm font-semibold text-green-600">R$ {walletData.proximoPagamento.toFixed(2)}</p>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-xs text-gray-400">Em {walletData.diasProximoPagamento} dias</p>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-gray-400" />
              <p className="text-xs text-gray-400">{mesesParaLiberar} meses restantes</p>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
            <div 
              className="bg-green-500 rounded-full h-2 transition-all"
              style={{ width: `${(walletData.saldoDisponivel / walletData.totalBonusAcumulado) * 100}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            💡 Você recebe R$ {adminConfig.pagamentoMensalMax}/mês até zerar seu bônus
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-white rounded-xl p-1 shadow-sm overflow-x-auto">
          <button
            onClick={() => setActiveTab('saldo')}
            className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 transition whitespace-nowrap px-3 ${
              activeTab === 'saldo' 
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md' 
                : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            <Wallet className="w-4 h-4" />
            <span className="text-sm font-medium">Meu Saldo</span>
          </button>
          <button
            onClick={() => setActiveTab('indicar')}
            className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 transition whitespace-nowrap px-3 ${
              activeTab === 'indicar' 
                ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-white shadow-md' 
                : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            <Gift className="w-4 h-4" />
            <span className="text-sm font-medium">Indicar</span>
          </button>
          <button
            onClick={() => setActiveTab('bonus')}
            className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 transition whitespace-nowrap px-3 ${
              activeTab === 'bonus' 
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md' 
                : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            <Users className="w-4 h-4" />
            <span className="text-sm font-medium">Bônus</span>
          </button>
          <button
            onClick={() => setActiveTab('resgatar')}
            className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 transition whitespace-nowrap px-3 ${
              activeTab === 'resgatar' 
                ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-md' 
                : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span className="text-sm font-medium">Resgatar</span>
          </button>
        </div>

        {/* Tab Saldo */}
        {activeTab === 'saldo' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h3 className="font-semibold mb-3">Resumo da Carteira</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-sm text-gray-600">Total de bônus acumulado</span>
                  <span className="font-semibold">R$ {walletData.totalBonusAcumulado.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-sm text-gray-600">Indicações completadas</span>
                  <span className="font-semibold text-green-600">{walletData.indicacoesCompletadas}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-sm text-gray-600">Indicações pendentes</span>
                  <span className="font-semibold text-yellow-600">{walletData.indicacoesPendentes}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Próximo pagamento</span>
                  <span className="font-semibold text-green-600">R$ {walletData.proximoPagamento.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-xl p-4">
              <p className="text-sm text-blue-800">
                📊 <strong>Como funciona a liberação?</strong><br/>
                • Você acumula bônus de R$ {adminConfig.bonusAmigo} (amigo) e R$ {adminConfig.bonusEmpresa} (empresa/profissional)<br/>
                • Todo mês, R$ {adminConfig.pagamentoMensalMax} é liberado para resgate<br/>
                • Bônus pendentes: R$ {bonusPendentesLiberacao.toFixed(2)} serão liberados em {mesesParaLiberar} meses
              </p>
            </div>
          </div>
        )}

        {/* Tab Indicar */}
        {activeTab === 'indicar' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h3 className="font-semibold mb-3">Quem você quer indicar?</h3>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setUserType('amigo')}
                  className={`p-3 rounded-xl text-center transition border-2 ${
                    userType === 'amigo' 
                      ? 'border-yellow-400 bg-yellow-50' 
                      : 'border-gray-200 hover:border-yellow-200'
                  }`}
                >
                  <Users className="w-6 h-6 mx-auto mb-1 text-blue-500" />
                  <p className="text-sm font-medium">Amigo</p>
                  <p className="text-xs text-green-600 mt-1">+R${adminConfig.bonusAmigo}</p>
                </button>
                <button
                  onClick={() => setUserType('empresa')}
                  className={`p-3 rounded-xl text-center transition border-2 ${
                    userType === 'empresa' 
                      ? 'border-yellow-400 bg-yellow-50' 
                      : 'border-gray-200 hover:border-yellow-200'
                  }`}
                >
                  <Building className="w-6 h-6 mx-auto mb-1 text-purple-500" />
                  <p className="text-sm font-medium">Empresa</p>
                  <p className="text-xs text-green-600 mt-1">+R${adminConfig.bonusEmpresa}</p>
                </button>
                <button
                  onClick={() => setUserType('profissional')}
                  className={`p-3 rounded-xl text-center transition border-2 ${
                    userType === 'profissional' 
                      ? 'border-yellow-400 bg-yellow-50' 
                      : 'border-gray-200 hover:border-yellow-200'
                  }`}
                >
                  <User className="w-6 h-6 mx-auto mb-1 text-green-500" />
                  <p className="text-sm font-medium">Profissional</p>
                  <p className="text-xs text-green-600 mt-1">+R${adminConfig.bonusProfissional}</p>
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-gradient-to-r from-yellow-400 to-amber-500 p-4 rounded-2xl inline-block">
                  <QrCode className="w-48 h-48 text-white" />
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-2 font-mono">QR Code de indicação</p>
              <p className="text-xs text-gray-400 mb-4">Mostre para quem você quer indicar</p>
              
              <button
                onClick={copyToClipboard}
                className="w-full py-3 bg-gradient-to-r from-yellow-400 to-amber-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2"
              >
                {copied ? (
                  <>
                    <Check className="w-5 h-5" />
                    Link copiado!
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5" />
                    Copiar link de indicação
                  </>
                )}
              </button>
            </div>

            <div className="bg-gradient-to-r from-yellow-400 to-amber-500 rounded-xl p-4 text-white">
              <div className="flex items-center gap-2 mb-2">
                <Gift className="w-5 h-5" />
                <p className="font-semibold">Como funciona?</p>
              </div>
              <p className="text-sm opacity-90">
                • Indique amigos e ganhe R${adminConfig.bonusAmigo} por indicação<br/>
                • Indique empresas e profissionais e ganhe R${adminConfig.bonusEmpresa}<br/>
                • Você recebe R${adminConfig.pagamentoMensalMax}/mês até zerar seu bônus<br/>
                • Ao final de cada mês, resgate seus valores em dinheiro real
              </p>
            </div>
          </div>
        )}

        {/* Tab Bônus */}
        {activeTab === 'bonus' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b bg-yellow-50">
                <h3 className="font-semibold flex items-center gap-2">
                  <Clock className="w-4 h-4 text-yellow-600" />
                  Aguardando validação ({indications.filter(i => i.status === 'pendente').length})
                </h3>
                <p className="text-xs text-gray-500 mt-1">Essas indicações ainda não completaram o ciclo</p>
              </div>
              <div className="divide-y">
                {indications.filter(i => i.status === 'pendente').map(ind => (
                  <div key={ind.id} className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{ind.name}</p>
                        <p className="text-xs text-gray-500">
                          {ind.type === 'amigo' ? '👤 Amigo' : ind.type === 'empresa' ? '🏪 Empresa' : '💼 Profissional'}
                          {' • '}{ind.date}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-yellow-600">+R${ind.value.toFixed(2)}</p>
                        <p className="text-xs text-yellow-500">⏳ Pendente</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      ⚠️ Aguardando confirmação do indicado
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b bg-green-50">
                <h3 className="font-semibold flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  Bônus já liberados ({indications.filter(i => i.status === 'aprovado' && i.cicloCompleto).length})
                </h3>
                <p className="text-xs text-gray-500 mt-1">Essas indicações já validaram e viraram bônus</p>
              </div>
              <div className="divide-y">
                {indications.filter(i => i.status === 'aprovado' && i.cicloCompleto).map(ind => (
                  <div key={ind.id} className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{ind.name}</p>
                        <p className="text-xs text-gray-500">
                          {ind.type === 'amigo' ? '👤 Amigo' : ind.type === 'empresa' ? '🏪 Empresa' : '💼 Profissional'}
                          {' • '}{ind.date}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">+R${ind.value.toFixed(2)}</p>
                        <p className="text-xs text-green-500">✓ Bônus liberado</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab Resgatar */}
        {activeTab === 'resgatar' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-6 shadow-sm text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Saldo disponível para resgate</h3>
              <p className="text-3xl font-bold text-green-600 mb-4">R$ {walletData.saldoDisponivel.toFixed(2)}</p>
              
              {walletData.saldoDisponivel >= 10 ? (
                <>
                  <p className="text-sm text-gray-500 mb-4">
                    Você pode resgatar até R$ {adminConfig.pagamentoMensalMax} por mês
                  </p>
                  <button className="w-full py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition">
                    Resgatar via PIX
                  </button>
                </>
              ) : (
                <div>
                  <p className="text-gray-500 mb-2">
                    Saldo mínimo para resgate: R$ 10,00
                  </p>
                  <p className="text-sm text-yellow-600">
                    💡 Indique mais amigos para acumular bônus!
                  </p>
                </div>
              )}
            </div>

            <div className="bg-blue-50 rounded-xl p-4">
              <p className="text-sm text-blue-800">
                💡 <strong>Regras de resgate:</strong><br/>
                • Resgate mínimo: R$ 10,00<br/>
                • Máximo por mês: R$ {adminConfig.pagamentoMensalMax}<br/>
                • O pagamento é processado em até 5 dias úteis<br/>
                • Bônus expiram após 6 meses sem uso
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}