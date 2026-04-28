'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { 
  Zap, 
  ArrowRight, 
  CheckCircle, 
  Package, 
  Upload, 
  Search,
  Monitor,
  Database,
  ArrowUpRight,
  ArrowDownRight,
  HelpCircle,
  Clock,
  BarChart3
} from 'lucide-react'

interface Respostas {
  temSistema: boolean
  erp?: string
  agente: string
  origem: string
}

interface TrackingData {
  agente: string
  origem: string
  fluxoEscolhido?: string
  sucesso: boolean
  dataInicio: string
  dataFim?: string
}

function OnboardingContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [passo, setPasso] = useState(1)
  const [respostas, setRespostas] = useState<Respostas>({
    temSistema: false,
    agente: '',
    origem: ''
  })
  const [loading, setLoading] = useState(false)
  const [tracking, setTracking] = useState<TrackingData | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    // Carregar parâmetros da URL
    const agente = searchParams.get('agente') || ''
    const origem = searchParams.get('origem') || ''
    const nivel = searchParams.get('nivel') || 'simples'

    setRespostas(prev => ({
      ...prev,
      agente,
      origem
    }))

    // Salvar tracking inicial
    const trackingData: TrackingData = {
      agente,
      origem,
      dataInicio: new Date().toISOString(),
      sucesso: false
    }
    setTracking(trackingData)
    localStorage.setItem('onboarding_tracking', JSON.stringify(trackingData))
  }, [searchParams])

  const decidirFluxo = () => {
    if (respostas.erp === "Bling") return "bling"
    if (respostas.erp === "Tiny ERP") return "tiny"
    if (respostas.erp === "Não sei") return "descoberta"
    if (respostas.temSistema === false) return "manual"
    return "desconhecido"
  }

  const proximoPasso = () => {
    if (passo === 1 && !respostas.temSistema) {
      // Se não tem sistema, vai direto para upload
      router.push('/importar')
      return
    }

    if (passo === 1 && respostas.temSistema) {
      setPasso(2)
      return
    }

    if (passo === 2) {
      const fluxo = decidirFluxo()
      
      // Atualizar tracking
      const trackingAtualizado = {
        ...tracking!,
        fluxoEscolhido: fluxo,
        dataFim: new Date().toISOString(),
        sucesso: true
      }
      setTracking(trackingAtualizado)
      localStorage.setItem('onboarding_tracking', JSON.stringify(trackingAtualizado))

      // Redirecionar para o fluxo correto
      switch (fluxo) {
        case "bling":
          router.push('/integracoes/bling')
          break
        case "tiny":
          router.push('/integracoes/tiny')
          break
        case "descoberta":
          router.push('/ajuda-deteccao')
          break
        case "manual":
          router.push('/importar')
          break
        default:
          router.push('/importar')
      }
    }
  }

  const passoAnterior = () => {
    if (passo > 1) {
      setPasso(passo - 1)
    }
  }

  const handleUploadPrint = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Aqui você pode implementar a lógica de upload e análise
      console.log('Upload de print:', file)
      // Implementar detecção de sistema baseado no print
    }
  }

  const handleUploadXML = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Aqui você pode implementar a lógica de upload e análise
      console.log('Upload de XML:', file)
      // Implementar detecção de sistema baseado no XML
    }
  }

  const getProgresso = () => {
    const total = respostas.temSistema ? 2 : 1
    return (passo / total) * 100
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-full mb-4">
            <Zap className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Valente Conecta
          </h1>
          <p className="text-lg text-gray-600">
            Configuração inteligente do seu sistema
          </p>
          <div className="flex items-center justify-center space-x-2 mt-4">
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                passo >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                1
              </div>
              <span className="ml-2 text-sm font-medium text-gray-700">Sistema Atual</span>
            </div>
            {respostas.temSistema && (
              <>
                <div className="w-8 h-0.5 bg-gray-300"></div>
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    passo >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    2
                  </div>
                  <span className="ml-2 text-sm font-medium text-gray-700">Identificação</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${getProgresso()}%` }}
            ></div>
          </div>
        </div>

        {/* Conteúdo do Passo 1 */}
        {passo === 1 && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Você já utiliza um sistema de gestão?
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <button
                onClick={() => setRespostas({...respostas, temSistema: true})}
                className={`p-6 rounded-lg border-2 transition-all ${
                  respostas.temSistema 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center mb-4">
                  <Monitor className="w-8 h-8 text-blue-600 mr-3" />
                  <h3 className="text-lg font-semibold text-gray-900">Sim</h3>
                </div>
                <p className="text-gray-600">
                  Já uso um sistema ERP/PDV e quero integrar com o Valente Conecta
                </p>
                {respostas.temSistema && (
                  <div className="mt-4 flex items-center text-green-600">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    <span className="font-medium">Selecionado</span>
                  </div>
                )}
              </button>

              <button
                onClick={() => setRespostas({...respostas, temSistema: false})}
                className={`p-6 rounded-lg border-2 transition-all ${
                  !respostas.temSistema 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center mb-4">
                  <Package className="w-8 h-8 text-green-600 mr-3" />
                  <h3 className="text-lg font-semibold text-gray-900">Não</h3>
                </div>
                <p className="text-gray-600">
                  Quero começar do zero e cadastrar meus produtos manualmente
                </p>
                {!respostas.temSistema && (
                  <div className="mt-4 flex items-center text-green-600">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    <span className="font-medium">Selecionado</span>
                  </div>
                )}
              </button>
            </div>

            <div className="flex justify-end">
              <button
                onClick={proximoPasso}
                disabled={respostas.temSistema === undefined}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center"
              >
                Continuar
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
            </div>
          </div>
        )}

        {/* Conteúdo do Passo 2 */}
        {passo === 2 && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Qual sistema você utiliza atualmente?
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <button
                onClick={() => setRespostas({...respostas, erp: "Bling"})}
                className={`p-6 rounded-lg border-2 transition-all ${
                  respostas.erp === "Bling" 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Bling</h3>
                <p className="text-gray-600">
                  Sistema de gestão ERP popular no varejo
                </p>
                {respostas.erp === "Bling" && (
                  <div className="mt-4 flex items-center text-green-600">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    <span className="font-medium">Selecionado</span>
                  </div>
                )}
              </button>

              <button
                onClick={() => setRespostas({...respostas, erp: "Tiny ERP"})}
                className={`p-6 rounded-lg border-2 transition-all ${
                  respostas.erp === "Tiny ERP" 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Tiny ERP</h3>
                <p className="text-gray-600">
                  Sistema completo para e-commerce e varejo
                </p>
                {respostas.erp === "Tiny ERP" && (
                  <div className="mt-4 flex items-center text-green-600">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    <span className="font-medium">Selecionado</span>
                  </div>
                )}
              </button>

              <button
                onClick={() => setRespostas({...respostas, erp: "Não sei"})}
                className={`p-6 rounded-lg border-2 transition-all ${
                  respostas.erp === "Não sei" 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Não sei</h3>
                <p className="text-gray-600">
                  Preciso de ajuda para identificar meu sistema
                </p>
                {respostas.erp === "Não sei" && (
                  <div className="mt-4 flex items-center text-green-600">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    <span className="font-medium">Selecionado</span>
                  </div>
                )}
              </button>

              <button
                onClick={() => setRespostas({...respostas, erp: "Outro"})}
                className={`p-6 rounded-lg border-2 transition-all ${
                  respostas.erp === "Outro" 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Outro</h3>
                <p className="text-gray-600">
                  Uso um sistema diferente dos listados
                </p>
                {respostas.erp === "Outro" && (
                  <div className="mt-4 flex items-center text-green-600">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    <span className="font-medium">Selecionado</span>
                  </div>
                )}
              </button>
            </div>

            {/* Opções de Upload */}
            <div className="border-t pt-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Ou envie arquivos para identificarmos automaticamente
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <label className="cursor-pointer">
                    <span className="text-sm text-gray-600">Enviar print da tela</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleUploadPrint}
                      className="hidden"
                    />
                  </label>
                </div>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  <Database className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <label className="cursor-pointer">
                    <span className="text-sm text-gray-600">Enviar XML de produtos</span>
                    <input
                      type="file"
                      accept=".xml,.csv"
                      onChange={handleUploadXML}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={passoAnterior}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Voltar
              </button>
              <button
                onClick={proximoPasso}
                disabled={!respostas.erp}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center"
              >
                Continuar
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
            </div>
          </div>
        )}

        {/* Cards de Informação */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 shadow">
            <div className="flex items-center mb-2">
              <ArrowUpRight className="w-5 h-5 text-green-500 mr-2" />
              <h4 className="font-semibold text-gray-900">Integração Rápida</h4>
            </div>
            <p className="text-sm text-gray-600">
              Conectamos seu sistema atual em minutos
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow">
            <div className="flex items-center mb-2">
              <Clock className="w-5 h-5 text-blue-500 mr-2" />
              <h4 className="font-semibold text-gray-900">Economia de Tempo</h4>
            </div>
            <p className="text-sm text-gray-600">
              Não perca tempo cadastrando produtos manualmente
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow">
            <div className="flex items-center mb-2">
              <BarChart3 className="w-5 h-5 text-purple-500 mr-2" />
              <h4 className="font-semibold text-gray-900">Analytics Completo</h4>
            </div>
            <p className="text-sm text-gray-600">
              Tenha visão completa do seu negócio
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Carregando...</div>}>
      <OnboardingContent />
    </Suspense>
  )
}
