'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Wallet, Gift, Users, Building, QrCode, Copy, Check, Zap, ArrowLeft, User, Clock, Lock, Unlock, Shield } from 'lucide-react'
import { getPlanoUsuario, getUsuarioLogado } from '@/services/auth'
import { supabase } from '@/lib/supabase'
import { QRCodeCanvas } from 'qrcode.react'

export default function CarteiraPage() {
  const [activeTab, setActiveTab] = useState<'saldo' | 'indicar' | 'bonus' | 'resgatar'>('saldo')
  const [copied, setCopied] = useState(false)
  const [userType, setUserType] = useState<'amigo' | 'empresa' | 'profissional'>('amigo')
  const [plano, setPlano] = useState<'gratis' | 'basico' | 'premium'>('gratis')
  const [usuario, setUsuario] = useState<any>(null)
  
  const [loja, setLoja] = useState({
    nome: 'Valente Conecta',
    endereco: 'Rua Principal, 123 - Centro',
    cidade: 'Coité - BA'
  })

  const [walletData, setWalletData] = useState({
    saldoDisponivel: 45.00,
    saldoBloqueado: 105.00,
    totalBonusAcumulado: 150.00,
    indicacoesCompletadas: 2,
    indicacoesPendentes: 3,
    proximoPagamento: 50.00,
    diasProximoPagamento: 15,
  })

  const [indications] = useState([
    { id: 1, name: 'João Silva', type: 'amigo', date: '01/04/2026', status: 'aprovado', value: 1, cicloCompleto: true },
    { id: 2, name: 'Padaria do Zé', type: 'empresa', date: '28/03/2026', status: 'aprovado', value: 2, cicloCompleto: true },
    { id: 4, name: 'Carlos Santos', type: 'amigo', date: '20/03/2026', status: 'pendente', value: 1, cicloCompleto: false },
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
    
    const lojaSalva = localStorage.getItem('loja_info')
    if (lojaSalva) setLoja(JSON.parse(lojaSalva))
  }, [])

  const linkIndicacao = typeof window !== 'undefined' 
    ? `${window.location.origin}/cadastro?ref=${usuario?.id || 'convite'}&tipo=${userType}`
    : ''

  const copyToClipboard = () => {
    navigator.clipboard.writeText(linkIndicacao)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const mesesParaLiberar = Math.ceil(walletData.saldoBloqueado / adminConfig.pagamentoMensalMax)

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

      <main className="p-4 max-w-xl mx-auto">
        {/* Info do plano */}
        <div className={`rounded-xl p-3 mb-4 ${plano === 'premium' ? 'bg-purple-50' : 'bg-gray-100'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-600">
              <Shield className="w-5 h-5" />
              <p className="text-sm">Plano: <strong className="capitalize">{plano}</strong></p>
            </div>
          </div>
        </div>

        {/* Cards de Saldo */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white p-4 rounded-3xl shadow-lg shadow-green-100">
            <div className="flex items-center gap-2 mb-2">
              <Unlock className="w-4 h-4" />
              <p className="text-[10px] uppercase font-black tracking-wider opacity-80">Disponível</p>
            </div>
            <p className="text-2xl font-black">R$ {walletData.saldoDisponivel.toFixed(2)}</p>
          </div>

          <div className="bg-gradient-to-br from-zinc-700 to-zinc-900 text-white p-4 rounded-3xl shadow-lg shadow-zinc-200">
            <div className="flex items-center gap-2 mb-2">
              <Lock className="w-4 h-4" />
              <p className="text-[10px] uppercase font-black tracking-wider opacity-80">Bloqueado</p>
            </div>
            <p className="text-2xl font-black">R$ {walletData.saldoBloqueado.toFixed(2)}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-white rounded-2xl p-1.5 shadow-sm border border-gray-100 overflow-x-auto">
          {[
            { id: 'saldo', label: 'Saldo', icon: Wallet, color: 'from-green-500 to-emerald-600' },
            { id: 'indicar', label: 'Indicar', icon: Gift, color: 'from-yellow-400 to-amber-500' },
            { id: 'bonus', label: 'Bônus', icon: Users, color: 'from-blue-500 to-indigo-600' },
            { id: 'resgatar', label: 'Resgatar', icon: Zap, color: 'from-purple-500 to-pink-600' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-3 rounded-xl flex flex-col items-center gap-1 transition-all ${
                activeTab === tab.id 
                  ? `bg-gradient-to-r ${tab.color} text-white shadow-md` 
                  : 'text-gray-400 hover:bg-gray-50'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span className="text-[10px] font-bold uppercase">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Conteúdo: INDICAR (QR CODE ATUALIZADO) */}
        {activeTab === 'indicar' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100">
              <h3 className="text-xs font-black uppercase text-gray-400 mb-4 text-center tracking-widest">Tipo de Indicação</h3>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'amigo', label: 'Amigo', icon: User, color: 'text-blue-500', bonus: adminConfig.bonusAmigo },
                  { id: 'empresa', label: 'Empresa', icon: Building, color: 'text-purple-500', bonus: adminConfig.bonusEmpresa },
                  { id: 'profissional', label: 'Pro', icon: Users, color: 'text-green-500', bonus: adminConfig.bonusProfissional }
                ].map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setUserType(type.id as any)}
                    className={`p-3 rounded-2xl text-center transition-all border-2 ${
                      userType === type.id ? 'border-yellow-400 bg-yellow-50' : 'border-gray-50 bg-gray-50'
                    }`}
                  >
                    <type.icon className={`w-6 h-6 mx-auto mb-1 ${type.color}`} />
                    <p className="text-[10px] font-black uppercase italic">{type.label}</p>
                    <p className="text-[10px] font-bold text-green-600">R${type.bonus}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-gray-50 text-center">
              <div className="flex justify-center mb-8">
                <div className="bg-white p-4 rounded-3xl border-4 border-gray-50 shadow-inner">
                  <QRCodeCanvas
                    value={linkIndicacao}
                    size={220}
                    level={"H"}
                    imageSettings={{
                      src: "/logo.png",
                      height: 40,
                      width: 40,
                      excavate: true,
                    }}
                  />
                </div>
              </div>
              
              <div className="mb-8">
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Escaneie para cadastrar</p>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <div className="h-1 w-1 bg-yellow-400 rounded-full animate-ping" />
                  <p className="text-xs font-bold text-zinc-600">Link de Indicação Ativo</p>
                </div>
              </div>
              
              <button
                onClick={copyToClipboard}
                className="w-full py-5 bg-gradient-to-r from-yellow-400 to-amber-500 text-black rounded-2xl font-black uppercase italic text-sm shadow-xl shadow-yellow-100 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                {copied ? (
                  <><Check className="w-5 h-5" /> Copiado!</>
                ) : (
                  <><Copy className="w-5 h-5" /> Copiar Link de Indicação</>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Conteúdo: SALDO (Simplificado) */}
        {activeTab === 'saldo' && (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-black uppercase italic mb-4">Resumo Mensal</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-gray-50">
                <span className="text-sm text-gray-500">Próxima Liberação</span>
                <span className="font-black text-green-600">R$ {adminConfig.pagamentoMensalMax.toFixed(2)}</span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed italic">
                * O sistema libera automaticamente R$ {adminConfig.pagamentoMensalMax} a cada 30 dias do seu saldo bloqueado para o disponível.
              </p>
            </div>
          </div>
        )}

        {/* ... (Demais tabs como Bônus e Resgatar seguem a mesma lógica de estilo) ... */}
      </main>
    </div>
  )
}