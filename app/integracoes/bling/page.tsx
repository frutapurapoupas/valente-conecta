'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  CheckCircle, 
  AlertCircle, 
  Database, 
  Key, 
  Globe, 
  Package, 
  Settings, 
  ArrowRight,
  Clock,
  BarChart3,
  Zap,
  Shield,
  RefreshCw
} from 'lucide-react'

interface BlingConfig {
  apiKey: string
  numeroLoja: string
  ativo: boolean
  dataSincronizacao?: string
  erro?: string
}

export default function IntegracaoBling() {
  const router = useRouter()
  const [config, setConfig] = useState<BlingConfig>({
    apiKey: '',
    numeroLoja: '',
    ativo: false
  })
  const [loading, setLoading] = useState(false)
  const [testando, setTestando] = useState(false)
  const [passo, setPasso] = useState(1)

  useEffect(() => {
    carregarConfig()
  }, [])

  const carregarConfig = () => {
    try {
      const salvo = localStorage.getItem('bling_config')
      if (salvo) {
        const configSalva = JSON.parse(salvo)
        setConfig(configSalva)
      }
    } catch (error) {
      console.error('Erro ao carregar config:', error)
    }
  }

  const salvarConfig = () => {
    try {
      localStorage.setItem('bling_config', JSON.stringify(config))
      alert('Configuração salva com sucesso!')
    } catch (error) {
      console.error('Erro ao salvar config:', error)
      alert('Erro ao salvar configuração')
    }
  }

  const testarConexao = async () => {
    if (!config.apiKey || !config.numeroLoja) {
      alert('Preencha API Key e Número da Loja')
      return
    }

    setTestando(true)
    setLoading(true)

    try {
      // Simular teste de conexão com API do Bling
      const response = await fetch(`https://bling.com.br/Api/v3/produtos&apikey=${config.apiKey}&idLoja=${config.numeroLoja}&limite=1`)
      
      if (response.ok) {
        const data = await response.json()
        if (data.retorno.produtos && data.retorno.produtos.length > 0) {
          setConfig(prev => ({
            ...prev,
            ativo: true,
            dataSincronizacao: new Date().toISOString(),
            erro: undefined
          }))
          alert('Conexão com Bling estabelecida com sucesso!')
        } else {
          throw new Error('Nenhum produto encontrado')
        }
      } else {
        throw new Error('Erro na API')
      }
    } catch (error) {
      console.error('Erro ao testar conexão:', error)
      setConfig(prev => ({
        ...prev,
        ativo: false,
        erro: error instanceof Error ? error.message : 'Erro desconhecido'
      }))
      alert('Erro ao conectar com Bling. Verifique suas credenciais.')
    } finally {
      setLoading(false)
      setTestando(false)
    }
  }

  const proximoPasso = () => {
    if (passo < 3) {
      setPasso(passo + 1)
    }
  }

  const passoAnterior = () => {
    if (passo > 1) {
      setPasso(passo - 1)
    }
  }

  const concluirIntegracao = () => {
    salvarConfig()
    router.push('/pdv/colaborativo')
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
              <h1 className="text-xl font-semibold text-gray-900">Integração Bling</h1>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                config.ativo 
                  ? 'bg-green-100 text-green-800' 
                  : config.erro 
                    ? 'bg-red-100 text-red-800' 
                    : 'bg-gray-100 text-gray-800'
              }`}>
                {config.ativo ? 'Conectado' : config.erro ? 'Erro' : 'Não configurado'}
              </div>
              <button
                onClick={testarConexao}
                disabled={testando}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {testando ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Testando...</span>
                  </>
                ) : (
                  <>
                    <Database className="w-4 h-4" />
                    <span>Testar</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar com Passos */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Passos da Integração</h2>
              
              <div className="space-y-4">
                {[
                  { numero: 1, titulo: 'Configurar API', descricao: 'Obter chave de acesso', concluido: !!config.apiKey },
                  { numero: 2, titulo: 'Conectar Loja', descricao: 'Identificar número da loja', concluido: !!config.numeroLoja },
                  { numero: 3, titulo: 'Testar Conexão', descricao: 'Validar integração', concluido: config.ativo }
                ].map((item) => (
                  <div 
                    key={item.numero}
                    className={`flex items-center space-x-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      item.numero === passo 
                        ? 'border-blue-500 bg-blue-50' 
                        : item.concluido 
                          ? 'border-green-500 bg-green-50' 
                          : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setPasso(item.numero)}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      item.concluido 
                        ? 'bg-green-500 text-white' 
                        : item.numero === passo 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-300 text-gray-600'
                    }`}>
                      {item.concluido ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <span className="text-sm font-medium">{item.numero}</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.titulo}</p>
                      <p className="text-sm text-gray-600">{item.descricao}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Status da Integração</span>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      config.ativo 
                        ? 'bg-green-100 text-green-800' 
                        : config.erro 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-gray-100 text-gray-800'
                    }`}>
                      {config.ativo ? 'Ativo' : config.erro ? 'Erro' : 'Pendente'}
                    </div>
                  </div>
                  {config.dataSincronizacao && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Última Sincronização</span>
                      <span className="text-sm text-gray-900">
                        {new Date(config.dataSincronizacao).toLocaleString('pt-BR')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Conteúdo Principal */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-8">
              {passo === 1 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Passo 1: Configurar API Bling</h3>
                    <p className="text-gray-600 mb-6">
                      Para começar, você precisa obter sua chave de API no painel do Bling.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Key className="inline w-4 h-4 mr-2" />
                        Chave da API
                      </label>
                      <input
                        type="password"
                        value={config.apiKey}
                        onChange={(e) => setConfig({...config, apiKey: e.target.value})}
                        placeholder="Cole sua chave de API aqui"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-medium text-blue-900 mb-2">Como obter sua chave?</h4>
                      <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
                        <li>Acesse o painel do Bling</li>
                        <li>Vá para Configurações → API</li>
                        <li>Clique em "Gerar Nova Chave"</li>
                        <li>Copie a chave gerada</li>
                        <li>Cole no campo acima</li>
                      </ol>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={proximoPasso}
                      disabled={!config.apiKey}
                      className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                      <span>Próximo Passo</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {passo === 2 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Passo 2: Identificar Loja</h3>
                    <p className="text-gray-600 mb-6">
                      Agora precisamos identificar qual loja do Bling será sincronizada.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Package className="inline w-4 h-4 mr-2" />
                        Número da Loja
                      </label>
                      <input
                        type="text"
                        value={config.numeroLoja}
                        onChange={(e) => setConfig({...config, numeroLoja: e.target.value})}
                        placeholder="Ex: 123456"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h4 className="font-medium text-yellow-900 mb-2">Onde encontrar este número?</h4>
                      <ol className="list-decimal list-inside space-y-2 text-sm text-yellow-800">
                        <li>No painel do Bling, vá em "Minha Loja"</li>
                        <li>O número está visível na URL ou no rodapé da página</li>
                        <li>Geralmente é um número de 6 dígitos</li>
                        <li>Ex: https://bling.com.br/loja/<strong>123456</strong></li>
                      </ol>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <button
                      onClick={passoAnterior}
                      className="flex items-center space-x-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Anterior</span>
                    </button>
                    <button
                      onClick={proximoPasso}
                      disabled={!config.numeroLoja}
                      className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                      <span>Próximo Passo</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {passo === 3 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Passo 3: Testar Conexão</h3>
                    <p className="text-gray-600 mb-6">
                      Vamos validar se a conexão com o Bling está funcionando corretamente.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-2">Status da Configuração</h4>
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <Key className="w-4 h-4 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-600">API Key:</span>
                            <span className={`ml-2 text-sm font-medium ${
                              config.apiKey ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {config.apiKey ? 'Configurada ✓' : 'Não configurada ✗'}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <Package className="w-4 h-4 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-600">Loja:</span>
                            <span className={`ml-2 text-sm font-medium ${
                              config.numeroLoja ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {config.numeroLoja ? 'Configurada ✓' : 'Não configurada ✗'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-medium text-blue-900 mb-2">Teste de Conexão</h4>
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <Database className="w-4 h-4 text-blue-400 mr-2" />
                            <span className="text-sm text-blue-800">Status:</span>
                            <span className={`ml-2 text-sm font-medium ${
                              config.ativo ? 'text-green-600' : config.erro ? 'text-red-600' : 'text-gray-600'
                            }`}>
                              {config.ativo ? 'Conectado ✓' : config.erro ? 'Erro ✗' : 'Não testado ?'}
                            </span>
                          </div>
                          {config.erro && (
                            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                              <p className="text-sm text-red-800">
                                <strong>Erro:</strong> {config.erro}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h4 className="font-medium text-green-900 mb-2">Próximos Passos</h4>
                      <ol className="list-decimal list-inside space-y-2 text-sm text-green-800">
                        <li>Após testar com sucesso, clique em "Concluir Integração"</li>
                        <li>Você será redirecionado para o PDV Colaborativo</li>
                        <li>A sincronização de produtos começará automaticamente</li>
                        <li>Seus dados do Bling estarão integrados ao sistema</li>
                      </ol>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <button
                      onClick={passoAnterior}
                      className="flex items-center space-x-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Anterior</span>
                    </button>
                    <button
                      onClick={concluirIntegracao}
                      disabled={!config.ativo}
                      className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                    >
                      <Zap className="w-4 h-4" />
                      <span>Concluir Integração</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
