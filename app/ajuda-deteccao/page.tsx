'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  Upload, 
  Camera, 
  Search, 
  CheckCircle, 
  AlertCircle, 
  ArrowRight,
  Monitor,
  Database,
  Zap,
  HelpCircle,
  BarChart3,
  Eye,
  RefreshCw
} from 'lucide-react'

interface SistemaDetectado {
  nome: string
  probabilidade: number
  caracteristicas: string[]
}

export default function AjudaDetecao() {
  const router = useRouter()
  const [imagem, setImagem] = useState<File | null>(null)
  const [detectando, setDetectando] = useState(false)
  const [sistemas, setSistemas] = useState<SistemaDetectado[]>([])
  const [imagemPreview, setImagemPreview] = useState<string | null>(null)

  useEffect(() => {
    // Simular sistemas conhecidos
    setSistemas([
      {
        nome: 'Bling ERP',
        probabilidade: 0,
        caracteristicas: ['Interface azul e branca', 'Logo Bling', 'Layout de produtos em grade']
      },
      {
        nome: 'Tiny ERP',
        probabilidade: 0,
        caracteristicas: ['Interface verde', 'Logo Tiny', 'Menu lateral']
      },
      {
        nome: 'Mercado Livre',
        probabilidade: 0,
        caracteristicas: ['Interface laranja', 'Logo ML', 'Dashboard de vendas']
      },
      {
        nome: 'Sistema Personalizado',
        probabilidade: 0,
        caracteristicas: ['Layout customizado', 'Cores próprias', 'Sem identificação clara']
      }
    ])
  }, [])

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setImagem(file)
      setImagemPreview(URL.createObjectURL(file))
      
      // Simular detecção automática
      setTimeout(() => {
        analisarImagem(file)
      }, 1000)
    }
  }

  const analisarImagem = (file: File) => {
    setDetectando(true)
    
    // Simular análise de imagem
    setTimeout(() => {
      const reader = new FileReader()
      reader.onload = (e) => {
        // Aqui você implementaria IA real para análise
        // Por enquanto, vamos simular detecção baseada em padrões
        
        const sistemasAtualizados = sistemas.map(sistema => {
          let probabilidade = Math.random() * 100
          
          // Simular detecção baseada em "análise"
          if (sistema.nome === 'Bling ERP') {
            probabilidade = 75 + Math.random() * 20
          } else if (sistema.nome === 'Tiny ERP') {
            probabilidade = 60 + Math.random() * 25
          } else if (sistema.nome === 'Mercado Livre') {
            probabilidade = 45 + Math.random() * 30
          } else {
            probabilidade = 20 + Math.random() * 40
          }
          
          return {
            ...sistema,
            probabilidade: Math.round(probabilidade)
          }
        })
        
        setSistemas(sistemasAtualizados.sort((a, b) => b.probabilidade - a.probabilidade))
      }
      reader.readAsDataURL(file)
    }, 2000)
    
    setTimeout(() => {
      setDetectando(false)
    }, 3000)
  }

  const selecionarSistema = (sistema: SistemaDetectado) => {
    // Salvar sistema detectado
    localStorage.setItem('sistema_detectado', JSON.stringify({
      nome: sistema.nome,
      probabilidade: sistema.probabilidade,
      data: new Date().toISOString()
    }))
    
    // Redirecionar para integração correspondente
    switch (sistema.nome) {
      case 'Bling ERP':
        router.push('/integracoes/bling')
        break
      case 'Tiny ERP':
        router.push('/integracoes/tiny')
        break
      default:
        router.push('/importar')
    }
  }

  const limparAnalise = () => {
    setImagem(null)
    setImagemPreview(null)
    setSistemas(sistemas.map(s => ({ ...s, probabilidade: 0 })))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900">Detecção Inteligente de Sistema</h1>
            </div>
            <button
              onClick={limparAnalise}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Limpar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload de Imagem */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Analisar Sistema</h2>
            
            <div className="space-y-6">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
                <div className="text-center">
                  {imagemPreview ? (
                    <div className="space-y-4">
                      <img 
                        src={imagemPreview} 
                        alt="Print do sistema" 
                        className="max-w-full h-48 object-contain rounded-lg"
                      />
                      <button
                        onClick={limparAnalise}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Trocar imagem
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Camera className="w-12 h-12 text-gray-400 mx-auto" />
                      <h3 className="text-lg font-medium text-gray-900">
                        Tire um print da tela
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Capture a tela principal do seu sistema atual
                      </p>
                      <label className="w-full">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                        <div className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer text-center transition-colors">
                          {detectando ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin inline-block" />
                              <span>Analisando...</span>
                            </>
                          ) : (
                            <>
                              <Upload className="w-4 h-4 inline-block mr-2" />
                              <span>Enviar Print</span>
                            </>
                          )}
                        </div>
                      </label>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Dicas para melhor análise:</h4>
                <ul className="list-disc list-inside space-y-2 text-sm text-blue-800">
                  <li>Capture a tela principal do sistema</li>
                  <li>Inclua o logo e menu principal</li>
                  <li>Evite capturar apenas uma parte</li>
                  <li>Garanta boa qualidade da imagem</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Resultados da Análise */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Sistemas Detectados</h2>
            
            {detectando ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent animate-spin rounded-full" />
                <p className="mt-4 text-gray-600">Analisando imagem...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sistemas.map((sistema, index) => (
                  <div 
                    key={sistema.nome}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      sistema.probabilidade > 70 
                        ? 'border-green-500 bg-green-50' 
                        : sistema.probabilidade > 40 
                          ? 'border-yellow-500 bg-yellow-50' 
                          : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => sistema.probabilidade > 0 && selecionarSistema(sistema)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">{sistema.nome}</h3>
                        <div className="flex items-center mt-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-500 ${
                                sistema.probabilidade > 70 ? 'bg-green-500' :
                                sistema.probabilidade > 40 ? 'bg-yellow-500' : 'bg-gray-400'
                              }`}
                              style={{ width: `${sistema.probabilidade}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-gray-600">
                            {sistema.probabilidade}%
                          </span>
                        </div>
                      </div>
                      
                      {sistema.probabilidade > 0 && (
                        <button className="text-blue-600 hover:text-blue-800">
                          <Eye className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                    
                    {sistema.probabilidade > 0 && (
                      <div className="mt-3">
                        <p className="text-sm text-gray-600 mb-2">Características detectadas:</p>
                        <div className="flex flex-wrap gap-2">
                          {sistema.caracteristicas.map((caracteristica, idx) => (
                            <span 
                              key={idx}
                              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                            >
                              {caracteristica}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {sistemas.every(s => s.probabilidade === 0) && (
                  <div className="text-center py-8">
                    <HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">
                      Envie um print para análise automática
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Ações Rápidas */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Ações Rápidas</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => router.push('/importar')}
              className="flex items-center space-x-3 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Database className="w-5 h-5 text-gray-600" />
              <div className="text-left">
                <p className="font-medium text-gray-900">Importar Manualmente</p>
                <p className="text-sm text-gray-600">Upload de CSV/XML</p>
              </div>
            </button>

            <button
              onClick={() => router.push('/integracoes/bling')}
              className="flex items-center space-x-3 p-4 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
            >
              <Monitor className="w-5 h-5 text-blue-600" />
              <div className="text-left">
                <p className="font-medium text-gray-900">Integrar Bling</p>
                <p className="text-sm text-gray-600">Configurar API</p>
              </div>
            </button>

            <button
              onClick={() => router.push('/integracoes/tiny')}
              className="flex items-center space-x-3 p-4 border border-green-300 rounded-lg hover:bg-green-50 transition-colors"
            >
              <Database className="w-5 h-5 text-green-600" />
              <div className="text-left">
                <p className="font-medium text-gray-900">Integrar Tiny ERP</p>
                <p className="text-sm text-gray-600">Configurar token</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
