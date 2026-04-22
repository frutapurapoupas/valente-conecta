'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { QRCodeSVG } from 'qrcode.react'
import { Share2, Copy, Check, Gift, Users, TrendingUp, Store, Briefcase, Dumbbell, QrCode, Download, ChevronLeft } from 'lucide-react'

type TabType = 'amigos' | 'empresa' | 'profissionais' | 'academia'

export default function IndiqueEGanhePage() {
  const [activeTab, setActiveTab] = useState<TabType>('amigos')
  const [referralCode, setReferralCode] = useState('')
  const [referralLink, setReferralLink] = useState('')
  const [copied, setCopied] = useState(false)
  const [qrSize] = useState(200)

  useEffect(() => {
    const userId = 'USER123456'
    const code = `VAL${userId.slice(-4)}${Math.random().toString(36).substring(2, 8).toUpperCase()}`
    setReferralCode(code)
    setReferralLink(`https://valenteconecta.com.br/convite/${code}`)
  }, [])

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Erro ao copiar:', err)
    }
  }

  const downloadQRCode = () => {
    const svg = document.getElementById('qr-code-svg')
    if (svg) {
      const serializer = new XMLSerializer()
      const source = serializer.serializeToString(svg)
      const blob = new Blob([source], { type: 'image/svg+xml' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.download = `qr-code-${referralCode}.svg`
      link.href = url
      link.click()
      URL.revokeObjectURL(url)
    }
  }

  const shareViaWhatsApp = () => {
    const message = `🎉 *Convite Valente Conecta* 🎉\n\nUse meu código *${referralCode}* e ganhe benefícios exclusivos!\n\n🔗 Link: ${referralLink}\n\nBaixe o app e comece a economizar! 🚀`
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank')
  }

  const tabs = [
    { id: 'amigos', label: 'Amigos', icon: Users, bonus: 'R$ 2,00', meta: '10 amigos', progresso: 70 },
    { id: 'empresa', label: 'Empresas', icon: Store, bonus: 'R$ 5,00', meta: '3 empresas', progresso: 66 },
    { id: 'profissionais', label: 'Profissionais', icon: Briefcase, bonus: 'R$ 3,00', meta: '5 profissionais', progresso: 60 },
    { id: 'academia', label: 'Academia', icon: Dumbbell, bonus: 'R$ 10,00', meta: '2 indicações', progresso: 50 },
  ]

  const currentTab = tabs.find(t => t.id === activeTab) || tabs[0]

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-24">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-zinc-900/95 backdrop-blur border-b border-zinc-800 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link href="/" className="p-2 bg-zinc-800 rounded-xl">
            <ChevronLeft className="w-5 h-5 text-zinc-400" />
          </Link>
          <h1 className="text-lg font-black text-white">Indique e Ganhe</h1>
          <div className="w-10" />
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Cards de estatísticas */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gradient-to-br from-yellow-600/20 to-orange-600/20 border border-yellow-500/20 rounded-2xl p-4">
            <p className="text-yellow-400 text-xs font-bold uppercase">Total Indicados</p>
            <p className="text-2xl font-black text-white">47</p>
            <p className="text-yellow-400/70 text-xs mt-1">+12 este mês</p>
          </div>
          <div className="bg-gradient-to-br from-emerald-600/20 to-green-600/20 border border-emerald-500/20 rounded-2xl p-4">
            <p className="text-emerald-400 text-xs font-bold uppercase">Bônus Acumulado</p>
            <p className="text-2xl font-black text-white">R$ 156.50</p>
            <p className="text-emerald-400/70 text-xs mt-1">Disponível para saque</p>
          </div>
        </div>

        {/* QR Code */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <div className="text-center mb-4">
            <h3 className="font-bold text-white text-lg">Seu QR Code de Indicação</h3>
            <p className="text-zinc-500 text-sm">Compartilhe com amigos e ganhe bônus</p>
          </div>
          
          <div className="flex justify-center">
            <div className="bg-white p-4 rounded-2xl shadow-xl">
              <QRCodeSVG
                id="qr-code-svg"
                value={referralLink}
                size={qrSize}
                bgColor="#FFFFFF"
                fgColor="#000000"
                level="H"
                includeMargin={true}
              />
            </div>
          </div>
          
          <div className="mt-4 text-center">
            <p className="text-xs text-zinc-500 mb-2">Ou use seu código único</p>
            <div className="flex items-center gap-2 bg-zinc-800 rounded-xl p-3">
              <code className="flex-1 text-yellow-400 font-mono text-sm">{referralCode}</code>
              <button onClick={() => copyToClipboard(referralCode)} className="p-2 hover:bg-zinc-700 rounded-lg transition">
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-zinc-400" />}
              </button>
            </div>
          </div>
          
          <div className="flex gap-2 mt-4">
            <button onClick={downloadQRCode} className="flex-1 py-2 bg-zinc-800 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2">
              <Download className="w-4 h-4" /> Baixar QR
            </button>
            <button onClick={shareViaWhatsApp} className="flex-1 py-2 bg-green-600 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2">
              <Share2 className="w-4 h-4" /> Compartilhar
            </button>
          </div>
        </div>

        {/* Link de indicação */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
          <p className="text-xs text-zinc-500 mb-2">Link de indicação</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-zinc-300 text-sm truncate">{referralLink}</code>
            <button onClick={() => copyToClipboard(referralLink)} className="px-3 py-2 bg-yellow-500 text-black rounded-xl text-sm font-bold hover:bg-yellow-400 transition flex items-center gap-2">
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} Copiar
            </button>
          </div>
        </div>

        {/* Abas */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
                activeTab === tab.id ? 'bg-yellow-500 text-black' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="text-sm font-bold">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Conteúdo da aba */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-white">Indique {currentTab.label}</h3>
              <p className="text-zinc-500 text-sm">Ganhe {currentTab.bonus} a cada {currentTab.meta}</p>
            </div>
            <currentTab.icon className="w-8 h-8 text-yellow-400" />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-zinc-400">Progresso</span>
              <span className="text-yellow-400">{currentTab.progresso}%</span>
            </div>
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div className="h-full bg-yellow-500 rounded-full" style={{ width: `${currentTab.progresso}%` }} />
            </div>
          </div>
        </div>

        {/* Barra de progresso geral */}
        <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-2xl p-4">
          <p className="text-sm text-yellow-400 font-bold mb-2">Indique mais 3 amigos para ganhar R$ 2,00</p>
          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full" style={{ width: '65%' }} />
          </div>
          <p className="text-xs text-zinc-500 mt-2">Continue indicando para ganhar mais bônus!</p>
        </div>
      </main>
    </div>
  )
}