// app/indique/page.tsx
'use client'

import { useState } from 'react'
import { 
  Share2, Copy, Check, Users, Gift, DollarSign, Award, 
  Instagram, Facebook, Twitter, Send, X, MessageCircle
} from 'lucide-react'
import Link from 'next/link'

export default function IndiquePage() {
  const [copied, setCopied] = useState(false)
  const [indicado, setIndicado] = useState({ nome: '', telefone: '', email: '' })
  const [enviado, setEnviado] = useState(false)

  // Código de indicação único do usuário
  const codigoIndicacao = `VALENTE-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
  const linkIndicacao = `https://valenteconecta.com.br/indicar/${codigoIndicacao}`

  const copiarLink = async () => {
    await navigator.clipboard.writeText(linkIndicacao)
    setCopied(true)
    setTimeout(() => setCopied(false), 3000)
  }

  const compartilhar = (plataforma: string) => {
    const texto = `🎉 Ganhe R$ 5,00 por indicação no Valente Conecta!\n\nUse meu código: ${codigoIndicacao}\n\nBaixe o app: ${linkIndicacao}`
    
    const urls: Record<string, string> = {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(texto)}`,
      instagram: `instagram://library?assetType=text&text=${encodeURIComponent(texto)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(linkIndicacao)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(texto)}`
    }
    
    window.open(urls[plataforma], '_blank')
  }

  const enviarIndicacao = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await fetch('/api/indicacoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...indicado, codigo: codigoIndicacao })
      })
      setEnviado(true)
      setIndicado({ nome: '', telefone: '', email: '' })
      setTimeout(() => setEnviado(false), 5000)
    } catch (error) {
      console.error('Erro ao enviar indicação:', error)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-500 to-orange-600 text-black">
        <div className="container mx-auto px-4 py-12 text-center">
          <Share2 className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-4xl font-black italic mb-2">Indique e Ganhe</h1>
          <p className="text-lg opacity-90">R$ 5,00 por cada amigo que se cadastrar!</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Cards de Benefícios */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-center">
            <Users className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
            <h3 className="text-lg font-bold mb-2">Convide Amigos</h3>
            <p className="text-zinc-400 text-sm">Compartilhe seu código único com amigos e familiares</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-center">
            <Gift className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
            <h3 className="text-lg font-bold mb-2">Amigos se Cadastram</h3>
            <p className="text-zinc-400 text-sm">Seu amigo se cadastra usando seu código</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-center">
            <DollarSign className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
            <h3 className="text-lg font-bold mb-2">Você Ganha R$5</h3>
            <p className="text-zinc-400 text-sm">Crédito na carteira para usar no app</p>
          </div>
        </div>

        {/* Seu Código */}
        <div className="bg-zinc-900/50 border border-yellow-500/30 rounded-2xl p-6 mb-8">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-500" />
            Seu Código de Indicação
          </h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-center">
              <code className="text-2xl font-mono font-bold text-yellow-500">{codigoIndicacao}</code>
            </div>
            <button
              onClick={copiarLink}
              className="flex items-center justify-center gap-2 px-6 py-4 bg-yellow-500 text-black rounded-xl font-bold hover:bg-yellow-600 transition"
            >
              {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              {copied ? 'Copiado!' : 'Copiar Código'}
            </button>
          </div>
        </div>

        {/* Compartilhar */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Compartilhar</h2>
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={() => compartilhar('whatsapp')} 
              className="flex items-center gap-2 px-6 py-3 bg-green-600 rounded-xl hover:bg-green-700 transition"
            >
              <MessageCircle className="w-5 h-5" /> WhatsApp
            </button>
            <button 
              onClick={() => compartilhar('instagram')} 
              className="flex items-center gap-2 px-6 py-3 bg-pink-600 rounded-xl hover:bg-pink-700 transition"
            >
              <Instagram className="w-5 h-5" /> Instagram
            </button>
            <button 
              onClick={() => compartilhar('facebook')} 
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 rounded-xl hover:bg-blue-700 transition"
            >
              <Facebook className="w-5 h-5" /> Facebook
            </button>
            <button 
              onClick={() => compartilhar('twitter')} 
              className="flex items-center gap-2 px-6 py-3 bg-sky-600 rounded-xl hover:bg-sky-700 transition"
            >
              <Twitter className="w-5 h-5" /> Twitter
            </button>
          </div>
        </div>

        {/* Indicar por Formulário */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-4">Indicar por E-mail/Telefone</h2>
          {enviado && (
            <div className="mb-4 p-3 bg-emerald-500/20 border border-emerald-500/50 rounded-xl text-emerald-400 text-center">
              ✅ Indicação enviada com sucesso!
            </div>
          )}
          <form onSubmit={enviarIndicacao} className="space-y-4">
            <input
              type="text"
              placeholder="Nome do amigo"
              value={indicado.nome}
              onChange={(e) => setIndicado({ ...indicado, nome: e.target.value })}
              className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl focus:outline-none focus:border-yellow-500"
              required
            />
            <input
              type="tel"
              placeholder="Telefone"
              value={indicado.telefone}
              onChange={(e) => setIndicado({ ...indicado, telefone: e.target.value })}
              className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl focus:outline-none focus:border-yellow-500"
            />
            <input
              type="email"
              placeholder="E-mail"
              value={indicado.email}
              onChange={(e) => setIndicado({ ...indicado, email: e.target.value })}
              className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl focus:outline-none focus:border-yellow-500"
            />
            <button
              type="submit"
              className="w-full py-3 bg-yellow-500 text-black rounded-xl font-bold hover:bg-yellow-600 transition"
            >
              <Send className="w-4 h-4 inline mr-2" />
              Enviar Indicação
            </button>
          </form>
        </div>

        {/* Banner de Retorno */}
        <div className="mt-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-zinc-400 hover:text-yellow-500 transition">
            ← Voltar para a Home
          </Link>
        </div>
      </div>
    </div>
  )
}