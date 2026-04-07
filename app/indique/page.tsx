'use client'

import { useState, Suspense, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Check, ArrowLeft, Users, Building, User, Briefcase, Store, CreditCard, QrCode, Smartphone, Download, Zap } from 'lucide-react'

function IndicationContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const type = searchParams.get('tipo') || 'amigo'
  const codigo = searchParams.get('codigo') || Date.now().toString()
  
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    tipoPessoa: 'fisica',
    nomeEmpresa: '',
    cnpj: '',
    plano: 'basico'
  })
  const [installed, setInstalled] = useState(false)

  // Salvar QR Code único no localStorage
  useEffect(() => {
    const qrCodes = localStorage.getItem('qr_codes_gerados')
    if (qrCodes) {
      const codes = JSON.parse(qrCodes)
      if (!codes.includes(codigo)) {
        codes.push(codigo)
        localStorage.setItem('qr_codes_gerados', JSON.stringify(codes))
      }
    } else {
      localStorage.setItem('qr_codes_gerados', JSON.stringify([codigo]))
    }
  }, [codigo])

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value })
  }

  const handleSubmit = () => {
    // Salvar dados mínimos do usuário
    const userData = {
      ...formData,
      codigoIndicacao: codigo,
      dataCadastro: new Date().toISOString(),
      instalado: true,
      qrCodeUnico: codigo
    }
    localStorage.setItem('user_data', JSON.stringify(userData))
    localStorage.setItem('user_logged_in', 'true')
    
    // Registrar indicação
    const indicacoes = localStorage.getItem('indicacoes_registradas')
    const novasIndicacoes = indicacoes ? JSON.parse(indicacoes) : []
    novasIndicacoes.push({
      codigo,
      nome: formData.nome,
      tipo: type,
      data: new Date().toISOString(),
      status: 'pendente'
    })
    localStorage.setItem('indicacoes_registradas', JSON.stringify(novasIndicacoes))
    
    setInstalled(true)
    
    // Redirecionar após 2 segundos
    setTimeout(() => {
      router.push('/')
    }, 2000)
  }

  if (installed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Instalação concluída! ✅</h2>
          <p className="text-gray-600 mb-4">O ícone do Valente Conecta foi adicionado à sua tela inicial</p>
          <p className="text-sm text-gray-500">Redirecionando para o app...</p>
          <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
            <div className="bg-green-500 rounded-full h-2 w-full animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  if (step === 1) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600">
        <div className="p-4">
          <Link href="/" className="inline-block p-2 bg-white/20 rounded-lg text-white">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </div>

        <div className="flex flex-col items-center justify-center px-4 py-8">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-xl">
            {/* Logo e ícone */}
            <div className="text-center mb-6">
              <img src="/icone.png" alt="Valente Conecta" className="w-24 h-24 mx-auto mb-3" />
              <h1 className="text-2xl font-bold">Valente Conecta</h1>
              <p className="text-gray-500 text-sm">PDV Colaborativo</p>
            </div>

            {/* QR Code técnico */}
            <div className="bg-gray-100 p-4 rounded-xl mb-6 text-center">
              <p className="text-xs text-gray-500 mb-2 font-mono">Código de indicação único</p>
              <div className="bg-white p-3 rounded-xl inline-block mx-auto shadow-sm">
                <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="120" height="120" fill="white"/>
                  <g fill="black">
                    <rect x="6" y="6" width="18" height="18" />
                    <rect x="7" y="7" width="16" height="16" fill="white" />
                    <rect x="10" y="10" width="10" height="10" />
                    <rect x="96" y="6" width="18" height="18" />
                    <rect x="97" y="7" width="16" height="16" fill="white" />
                    <rect x="100" y="10" width="10" height="10" />
                    <rect x="6" y="96" width="18" height="18" />
                    <rect x="7" y="97" width="16" height="16" fill="white" />
                    <rect x="10" y="100" width="10" height="10" />
                    <rect x="30" y="6" width="6" height="6" />
                    <rect x="42" y="6" width="6" height="6" />
                    <rect x="54" y="6" width="6" height="6" />
                    <rect x="66" y="6" width="6" height="6" />
                    <rect x="78" y="6" width="6" height="6" />
                    <rect x="30" y="18" width="6" height="6" />
                    <rect x="48" y="18" width="6" height="6" />
                    <rect x="60" y="18" width="6" height="6" />
                    <rect x="72" y="18" width="6" height="6" />
                    <rect x="84" y="18" width="6" height="6" />
                    <rect x="36" y="30" width="6" height="6" />
                    <rect x="54" y="30" width="6" height="6" />
                    <rect x="66" y="30" width="6" height="6" />
                    <rect x="78" y="30" width="6" height="6" />
                    <rect x="90" y="30" width="6" height="6" />
                    <rect x="102" y="30" width="6" height="6" />
                    <rect x="30" y="42" width="6" height="6" />
                    <rect x="42" y="42" width="6" height="6" />
                    <rect x="60" y="42" width="6" height="6" />
                    <rect x="78" y="42" width="6" height="6" />
                    <rect x="96" y="42" width="6" height="6" />
                    <rect x="36" y="54" width="6" height="6" />
                    <rect x="48" y="54" width="6" height="6" />
                    <rect x="66" y="54" width="6" height="6" />
                    <rect x="84" y="54" width="6" height="6" />
                    <rect x="102" y="54" width="6" height="6" />
                    <rect x="30" y="66" width="6" height="6" />
                    <rect x="42" y="66" width="6" height="6" />
                    <rect x="54" y="66" width="6" height="6" />
                    <rect x="72" y="66" width="6" height="6" />
                    <rect x="90" y="66" width="6" height="6" />
                    <rect x="36" y="78" width="6" height="6" />
                    <rect x="48" y="78" width="6" height="6" />
                    <rect x="60" y="78" width="6" height="6" />
                    <rect x="78" y="78" width="6" height="6" />
                    <rect x="96" y="78" width="6" height="6" />
                    <rect x="108" y="78" width="6" height="6" />
                    <rect x="30" y="90" width="6" height="6" />
                    <rect x="42" y="90" width="6" height="6" />
                    <rect x="60" y="90" width="6" height="6" />
                    <rect x="72" y="90" width="6" height="6" />
                    <rect x="90" y="90" width="6" height="6" />
                    <rect x="102" y="90" width="6" height="6" />
                    <rect x="36" y="102" width="6" height="6" />
                    <rect x="54" y="102" width="6" height="6" />
                    <rect x="66" y="102" width="6" height="6" />
                    <rect x="78" y="102" width="6" height="6" />
                    <rect x="96" y="102" width="6" height="6" />
                    <rect x="108" y="102" width="6" height="6" />
                  </g>
                </svg>
              </div>
              <p className="text-xs text-gray-400 mt-2 font-mono">ID: {codigo.slice(-8)}</p>
            </div>

            <p className="text-center text-gray-600 mb-6">
              Complete seu cadastro em menos de 1 minuto
            </p>

            <button
              onClick={() => setStep(2)}
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2"
            >
              <Smartphone className="w-5 h-5" />
              Começar agora
            </button>

            <p className="text-xs text-center text-gray-400 mt-4">
              ✅ Ícone será adicionado automaticamente à sua tela inicial
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-4">
        <button onClick={() => setStep(1)} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>

      <div className="flex flex-col items-center justify-center px-4 py-4">
        <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-lg">
          <div className="text-center mb-6">
            <img src="/icone.png" alt="Logo" className="w-16 h-16 mx-auto mb-2" />
            <h2 className="text-xl font-bold">Complete seu cadastro</h2>
            <p className="text-sm text-gray-500">Apenas informações básicas</p>
          </div>

          <div className="space-y-4">
            {/* Tipo de pessoa */}
            <div>
              <label className="block text-sm font-medium mb-2">Você é:</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleChange('tipoPessoa', 'fisica')}
                  className={`p-3 rounded-xl text-center transition border-2 ${
                    formData.tipoPessoa === 'fisica' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200'
                  }`}
                >
                  <User className="w-6 h-6 mx-auto mb-1 text-blue-500" />
                  <span className="text-sm">Pessoa Física</span>
                </button>
                <button
                  onClick={() => handleChange('tipoPessoa', 'juridica')}
                  className={`p-3 rounded-xl text-center transition border-2 ${
                    formData.tipoPessoa === 'juridica' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200'
                  }`}
                >
                  <Building className="w-6 h-6 mx-auto mb-1 text-purple-500" />
                  <span className="text-sm">Pessoa Jurídica</span>
                </button>
              </div>
            </div>

            {/* Nome */}
            <div>
              <label className="block text-sm font-medium mb-1">
                {formData.tipoPessoa === 'fisica' ? 'Nome completo' : 'Nome da empresa'}
              </label>
              <input
                type="text"
                value={formData.nome}
                onChange={(e) => handleChange('nome', e.target.value)}
                className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={formData.tipoPessoa === 'fisica' ? 'Digite seu nome' : 'Nome da empresa'}
              />
            </div>

            {/* CNPJ para PJ */}
            {formData.tipoPessoa === 'juridica' && (
              <div>
                <label className="block text-sm font-medium mb-1">CNPJ</label>
                <input
                  type="text"
                  value={formData.cnpj}
                  onChange={(e) => handleChange('cnpj', e.target.value)}
                  className="w-full px-4 py-3 border rounded-xl"
                  placeholder="00.000.000/0001-00"
                />
              </div>
            )}

            {/* Telefone */}
            <div>
              <label className="block text-sm font-medium mb-1">WhatsApp</label>
              <input
                type="tel"
                value={formData.telefone}
                onChange={(e) => handleChange('telefone', e.target.value)}
                className="w-full px-4 py-3 border rounded-xl"
                placeholder="(00) 00000-0000"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-1">E-mail</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full px-4 py-3 border rounded-xl"
                placeholder="seu@email.com"
              />
            </div>

            {/* Planos */}
            <div>
              <label className="block text-sm font-medium mb-2">Escolha seu plano</label>
              <div className="space-y-2">
                <label className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition ${
                  formData.plano === 'basico' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}>
                  <div className="flex items-center gap-3">
                    <Zap className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="font-semibold">Básico</p>
                      <p className="text-xs text-gray-500">Busca + QR Code + Bônus</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">Grátis</p>
                    <input
                      type="radio"
                      name="plano"
                      value="basico"
                      checked={formData.plano === 'basico'}
                      onChange={(e) => handleChange('plano', e.target.value)}
                      className="hidden"
                    />
                  </div>
                </label>

                <label className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition ${
                  formData.plano === 'pdv' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}>
                  <div className="flex items-center gap-3">
                    <Store className="w-5 h-5 text-purple-500" />
                    <div>
                      <p className="font-semibold">PDV Completo</p>
                      <p className="text-xs text-gray-500">PDV + Academia + Busca</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">R$ 49,90/mês</p>
                    <input
                      type="radio"
                      name="plano"
                      value="pdv"
                      checked={formData.plano === 'pdv'}
                      onChange={(e) => handleChange('plano', e.target.value)}
                      className="hidden"
                    />
                  </div>
                </label>

                <label className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition ${
                  formData.plano === 'empresarial' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}>
                  <div className="flex items-center gap-3">
                    <Briefcase className="w-5 h-5 text-orange-500" />
                    <div>
                      <p className="font-semibold">Empresarial</p>
                      <p className="text-xs text-gray-500">Tudo + Relatórios + Suporte</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">R$ 99,90/mês</p>
                    <input
                      type="radio"
                      name="plano"
                      value="empresarial"
                      checked={formData.plano === 'empresarial'}
                      onChange={(e) => handleChange('plano', e.target.value)}
                      className="hidden"
                    />
                  </div>
                </label>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={!formData.nome || !formData.telefone}
              className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-5 h-5" />
              Instalar App
            </button>

            <p className="text-xs text-center text-gray-400">
              Ao instalar, você concorda com nossos termos de uso
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function IndiquePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Carregando...</div>}>
      <IndicationContent />
    </Suspense>
  )
}