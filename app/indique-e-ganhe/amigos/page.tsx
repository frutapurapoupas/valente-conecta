'use client'

import { useState, useEffect } from 'react'
import { Users, Gift, TrendingUp, Share2, Copy, Check } from 'lucide-react'

export default function IndiqueAmigosPage() {
  const [referralCode, setReferralCode] = useState('')
  const [referralLink, setReferralLink] = useState('')
  const [copied, setCopied] = useState(false)
  const [referralStats, setReferralStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    currentBatch: 0,
    batchSize: 10,
    batchAmount: 2.00
  })

  useEffect(() => {
    // Gerar código e link de indicação
    const userId = '00000000-0000-0000-0000-000000000001'
    const code = `VAL${userId.slice(-4).toUpperCase()}${Date.now().toString(36).toUpperCase()}`
    setReferralCode(code)
    setReferralLink(`https://valenteconecta.com.br/convite/${code}`)
  }, [])

  const copyToClipboard = async (text: string, type: 'link' | 'code') => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Erro ao copiar:', err)
    }
  }

  const shareOnWhatsApp = () => {
    const message = `Olá! Estou te convidando para fazer parte do Valente Conecta! Use meu código ${referralCode} e baixe o app: ${referralLink}`
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank')
  }

  const shareOptions = [
    {
      name: 'WhatsApp',
      icon: 'https://cdn-icons-png.flaticon.com/512/733/733585.png',
      action: shareOnWhatsApp
    },
    {
      name: 'Facebook',
      icon: 'https://cdn-icons-png.flaticon.com/512/733/733547.png',
      action: () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`, '_blank')
    },
    {
      name: 'Instagram',
      icon: 'https://cdn-icons-png.flaticon.com/512/733/733558.png',
      action: () => copyToClipboard(referralLink, 'link')
    },
    {
      name: 'Twitter',
      icon: 'https://cdn-icons-png.flaticon.com/512/733/733579.png',
      action: () => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Estou no Valente Conecta! Junte-se a nós: ${referralLink}`)}`, '_blank')
    }
  ]

  return (
    <div className="min-h-screen bg-zinc-900 text-white p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-yellow-500 mb-2">Indique Amigos</h1>
          <p className="text-zinc-400">Ganhe R$2,00 a cada 10 amigos que se cadastrarem</p>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-zinc-800 rounded-xl p-4 text-center">
            <Users className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{referralStats.total}</p>
            <p className="text-zinc-400 text-sm">Total Indicados</p>
          </div>
          <div className="bg-zinc-800 rounded-xl p-4 text-center">
            <Check className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{referralStats.completed}</p>
            <p className="text-zinc-400 text-sm">Confirmados</p>
          </div>
          <div className="bg-zinc-800 rounded-xl p-4 text-center">
            <TrendingUp className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{referralStats.currentBatch}/{referralStats.batchSize}</p>
            <p className="text-zinc-400 text-sm">Lote Atual</p>
          </div>
          <div className="bg-zinc-800 rounded-xl p-4 text-center">
            <Gift className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">R${referralStats.batchAmount.toFixed(2)}</p>
            <p className="text-zinc-400 text-sm">Próximo Bônus</p>
          </div>
        </div>

        {/* Código e Link de Indicação */}
        <div className="bg-zinc-800 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-yellow-500 mb-6">Seu Código de Indicação</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* QR Code */}
            <div className="text-center">
              <div className="w-48 h-48 bg-white rounded-xl mx-auto mb-4 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-32 h-32 bg-zinc-900 rounded-lg mx-auto mb-2 flex items-center justify-center">
                    <span className="text-white font-mono text-xs">{referralCode.slice(0, 8)}</span>
                  </div>
                  <p className="text-zinc-600 text-xs">QR Code</p>
                </div>
              </div>
              <p className="text-zinc-400 text-sm">Escaneie para compartilhar</p>
            </div>

            {/* Código e Link */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Código do Convite</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={referralCode}
                    readOnly
                    className="flex-1 bg-zinc-700 border border-zinc-600 rounded-lg px-4 py-3 font-mono text-yellow-400"
                  />
                  <button
                    onClick={() => copyToClipboard(referralCode, 'code')}
                    className="bg-yellow-500 text-zinc-900 px-4 py-3 rounded-lg hover:bg-yellow-400 transition"
                  >
                    {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Link de Indicação</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={referralLink}
                    readOnly
                    className="flex-1 bg-zinc-700 border border-zinc-600 rounded-lg px-4 py-3 text-sm"
                  />
                  <button
                    onClick={() => copyToClipboard(referralLink, 'link')}
                    className="bg-yellow-500 text-zinc-900 px-4 py-3 rounded-lg hover:bg-yellow-400 transition"
                  >
                    {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Compartilhamento */}
        <div className="bg-zinc-800 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-yellow-500 mb-6">Compartilhar nas Redes</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {shareOptions.map((option) => (
              <button
                key={option.name}
                onClick={option.action}
                className="bg-zinc-700 hover:bg-zinc-600 rounded-xl p-4 text-center transition"
              >
                <img src={option.icon} alt={option.name} className="w-12 h-12 mx-auto mb-2" />
                <p className="text-sm font-medium">{option.name}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Progresso do Lote */}
        <div className="bg-zinc-800 rounded-xl p-6">
          <h2 className="text-xl font-bold text-yellow-500 mb-6">Progresso do Lote Atual</h2>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-zinc-400">Amigos confirmados</span>
                <span className="text-yellow-400 font-bold">{referralStats.currentBatch}/{referralStats.batchSize}</span>
              </div>
              <div className="w-full bg-zinc-700 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-yellow-500 to-yellow-400 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${(referralStats.currentBatch / referralStats.batchSize) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-zinc-700 rounded-lg p-3">
                <p className="text-zinc-400 text-sm">Faltam</p>
                <p className="text-xl font-bold text-yellow-400">{referralStats.batchSize - referralStats.currentBatch}</p>
                <p className="text-zinc-400 text-xs">amigos</p>
              </div>
              <div className="bg-zinc-700 rounded-lg p-3">
                <p className="text-zinc-400 text-sm">Bônus</p>
                <p className="text-xl font-bold text-green-400">R${referralStats.batchAmount.toFixed(2)}</p>
                <p className="text-zinc-400 text-xs">ao completar</p>
              </div>
              <div className="bg-zinc-700 rounded-lg p-3">
                <p className="text-zinc-400 text-sm">Total</p>
                <p className="text-xl font-bold text-purple-400">{Math.floor(referralStats.completed / referralStats.batchSize)}</p>
                <p className="text-zinc-400 text-xs">lotes completos</p>
              </div>
            </div>
          </div>
        </div>

        {/* Como Funciona */}
        <div className="bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 rounded-xl p-6 mt-8 border border-yellow-500/30">
          <h3 className="text-lg font-bold text-yellow-400 mb-4">Como Funciona</h3>
          <div className="space-y-3 text-zinc-300">
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-yellow-500 text-zinc-900 rounded-full flex items-center justify-center font-bold">1</div>
              <p>Compartilhe seu código ou link com amigos</p>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-yellow-500 text-zinc-900 rounded-full flex items-center justify-center font-bold">2</div>
              <p>Seus amigos se cadastram usando seu código</p>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-yellow-500 text-zinc-900 rounded-full flex items-center justify-center font-bold">3</div>
              <p>A cada 10 amigos confirmados, você ganha R$2,00</p>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-yellow-500 text-zinc-900 rounded-full flex items-center justify-center font-bold">4</div>
              <p>O bônus é liberado conforme a meta de usuários ativos for atingida</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
