'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { CheckCircle, Smartphone, ArrowRight, Zap, Phone, User, MapPin } from 'lucide-react'

export default function InstalarQRPage() {
  const params = useParams()
  const router = useRouter()
  const code = params.code as string

  const [formData, setFormData] = useState({
    nome: '',
    whatsapp: '',
    cidadeBase: ''
  })
  const [loading, setLoading] = useState(false)
  const [sucesso, setSucesso] = useState(false)

  const aplicarMascaraWhatsApp = (valor: string) => {
    const numeros = valor.replace(/\D/g, '')
    if (numeros.length <= 2) return numeros
    if (numeros.length <= 7) return `(${numeros.slice(0, 2)}) ${numeros.slice(2)}`
    return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7, 11)}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validação simples
    if (!formData.nome || !formData.whatsapp || !formData.cidadeBase) {
      alert('Por favor, preencha todos os campos')
      return
    }

    const whatsappLimpo = formData.whatsapp.replace(/\D/g, '')
    if (whatsappLimpo.length < 10 || whatsappLimpo.length > 11) {
      alert('Por favor, insira um WhatsApp válido com DDD')
      return
    }

    setLoading(true)

    // Salvar dados básicos no localStorage
    localStorage.setItem('usuario_cadastro_basico', JSON.stringify({
      nome: formData.nome,
      whatsapp: whatsappLimpo,
      cidadeBase: formData.cidadeBase,
      codigoIndicacao: code,
      dataCadastro: new Date().toISOString()
    }))

    // Simular cadastro
    setTimeout(() => {
      setSucesso(true)
      setLoading(false)
      
      // Redirecionar para home após 2 segundos
      setTimeout(() => {
        router.push('/')
      }, 2000)
    }, 1000)
  }

  if (sucesso) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-black">Cadastro Realizado!</h1>
          <p className="text-zinc-400">Redirecionando para o app...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-500 to-orange-600 text-black px-4 py-6">
        <div className="max-w-md mx-auto text-center">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Zap className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black italic">Instalar Valente Conecta</h1>
          <p className="text-sm opacity-90 mt-1">Código de indicação: {code}</p>
        </div>
      </div>

      <main className="max-w-md mx-auto px-4 py-8 space-y-6">
        {/* Informações */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <Smartphone className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-white">Cadastro Rápido</p>
              <p className="text-sm text-zinc-400 mt-1">
                Preencha apenas 3 campos para começar a usar o Valente Conecta.
              </p>
            </div>
          </div>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome */}
          <div>
            <label className="text-xs font-bold text-zinc-500 uppercase mb-2 block">
              Seu Nome
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500 w-5 h-5" />
              <input
                type="text"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Como quer ser chamado?"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-white placeholder-zinc-600 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
                required
              />
            </div>
          </div>

          {/* WhatsApp */}
          <div>
            <label className="text-xs font-bold text-zinc-500 uppercase mb-2 block">
              WhatsApp
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500 w-5 h-5" />
              <input
                type="tel"
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: aplicarMascaraWhatsApp(e.target.value) })}
                placeholder="(75) 99999-9999"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-white placeholder-zinc-600 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
                required
              />
            </div>
            <p className="text-xs text-zinc-500 mt-1">Número com DDD para contato</p>
          </div>

          {/* Cidade Base */}
          <div>
            <label className="text-xs font-bold text-zinc-500 uppercase mb-2 block">
              Cidade Base
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500 w-5 h-5" />
              <input
                type="text"
                value={formData.cidadeBase}
                onChange={(e) => setFormData({ ...formData, cidadeBase: e.target.value })}
                placeholder="Ex: Valente - BA"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-white placeholder-zinc-600 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
                required
              />
            </div>
            <p className="text-xs text-zinc-500 mt-1">Sua cidade principal de atuação</p>
          </div>

          {/* Botão Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 text-black py-4 rounded-xl font-black text-lg active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
                Processando...
              </>
            ) : (
              <>
                Começar Agora
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        {/* Info adicional */}
        <div className="text-center">
          <p className="text-xs text-zinc-600">
            Ao continuar, você concorda com os termos de uso do Valente Conecta.
          </p>
        </div>
      </main>
    </div>
  )
}
