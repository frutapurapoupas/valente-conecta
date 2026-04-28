'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  Upload, 
  FileText, 
  Database, 
  CheckCircle, 
  AlertCircle, 
  ArrowRight,
  Package,
  BarChart3,
  Zap,
  Download,
  Filter
} from 'lucide-react'

interface ProdutoImportado {
  id: string
  nome: string
  codigo: string
  preco: number
  estoque: number
  categoria: string
  descricao?: string
}

export default function ImportarPage() {
  const router = useRouter()
  const [arquivo, setArquivo] = useState<File | null>(null)
  const [importando, setImportando] = useState(false)
  const [produtos, setProdutos] = useState<ProdutoImportado[]>([])
  const [erro, setErro] = useState<string | null>(null)
  const [sucesso, setSucesso] = useState<string | null>(null)
  const [preview, setPreview] = useState<ProdutoImportado[]>([])

  useEffect(() => {
    carregarProdutosExistentes()
  }, [])

  const carregarProdutosExistentes = () => {
    try {
      const produtosSalvos = localStorage.getItem('produtos_estoque')
      if (produtosSalvos) {
        setProdutos(JSON.parse(produtosSalvos))
      }
    } catch (error) {
      console.error('Erro ao carregar produtos:', error)
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setArquivo(file)
      setErro(null)
      setSucesso(null)
      
      // Fazer preview se for CSV/XML
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        lerCSV(file)
      } else if (file.type === 'text/xml' || file.name.endsWith('.xml')) {
        lerXML(file)
      } else {
        setErro('Formato de arquivo não suportado. Use CSV ou XML.')
      }
    }
  }

  const lerCSV = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        const linhas = text.split('\n')
        const cabecalho = linhas[0].split(',')
        
        const produtos: ProdutoImportado[] = []
        
        for (let i = 1; i < linhas.length; i++) {
          const valores = linhas[i].split(',')
          if (valores.length >= 4) {
            produtos.push({
              id: Date.now().toString() + i,
              nome: valores[0]?.replace(/"/g, '') || '',
              codigo: valores[1]?.replace(/"/g, '') || '',
              preco: parseFloat(valores[2]?.replace(/"/g, '') || '0'),
              estoque: parseInt(valores[3]?.replace(/"/g, '') || '0'),
              categoria: valores[4]?.replace(/"/g, '') || 'Geral',
              descricao: valores[5]?.replace(/"/g, '') || ''
            })
          }
        }
        
        setPreview(produtos.slice(0, 5)) // Mostrar apenas 5 produtos no preview
      } catch (error) {
        setErro('Erro ao ler arquivo CSV. Verifique o formato.')
      }
    }
    reader.readAsText(file)
  }

  const lerXML = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        const parser = new DOMParser()
        const xmlDoc = parser.parseFromString(text, 'text/xml')
        
        const produtos: ProdutoImportado[] = []
        const produtosNodes = xmlDoc.getElementsByTagName('produto')
        
        for (let i = 0; i < produtosNodes.length; i++) {
          const produto = produtosNodes[i]
          produtos.push({
            id: Date.now().toString() + i,
            nome: produto.getElementsByTagName('nome')[0]?.textContent || '',
            codigo: produto.getElementsByTagName('codigo')[0]?.textContent || '',
            preco: parseFloat(produto.getElementsByTagName('preco')[0]?.textContent || '0'),
            estoque: parseInt(produto.getElementsByTagName('estoque')[0]?.textContent || '0'),
            categoria: produto.getElementsByTagName('categoria')[0]?.textContent || 'Geral',
            descricao: produto.getElementsByTagName('descricao')[0]?.textContent || ''
          })
        }
        
        setPreview(produtos.slice(0, 5)) // Mostrar apenas 5 produtos no preview
      } catch (error) {
        setErro('Erro ao ler arquivo XML. Verifique o formato.')
      }
    }
    reader.readAsText(file)
  }

  const confirmarImportacao = () => {
    if (!arquivo || preview.length === 0) {
      setErro('Selecione um arquivo válido para importar.')
      return
    }

    setImportando(true)
    setErro(null)
    setSucesso(null)

    try {
      // Ler arquivo completo
      if (arquivo.type === 'text/csv' || arquivo.name.endsWith('.csv')) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const text = e.target?.result as string
          const linhas = text.split('\n')
          const cabecalho = linhas[0].split(',')
          
          const produtosCompletos: ProdutoImportado[] = []
          
          for (let i = 1; i < linhas.length; i++) {
            const valores = linhas[i].split(',')
            if (valores.length >= 4 && valores[0]) {
              produtosCompletos.push({
                id: Date.now().toString() + i,
                nome: valores[0]?.replace(/"/g, '') || '',
                codigo: valores[1]?.replace(/"/g, '') || '',
                preco: parseFloat(valores[2]?.replace(/"/g, '') || '0'),
                estoque: parseInt(valores[3]?.replace(/"/g, '') || '0'),
                categoria: valores[4]?.replace(/"/g, '') || 'Geral',
                descricao: valores[5]?.replace(/"/g, '') || ''
              })
            }
          }
          
          // Mesclar com produtos existentes
          const produtosAtualizados = [...produtos, ...produtosCompletos]
          localStorage.setItem('produtos_estoque', JSON.stringify(produtosAtualizados))
          setProdutos(produtosAtualizados)
          setSucesso(`${produtosCompletos.length} produtos importados com sucesso!`)
          setArquivo(null)
          setPreview([])
        }
        reader.readAsText(arquivo)
      } else if (arquivo.type === 'text/xml' || arquivo.name.endsWith('.xml')) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const text = e.target?.result as string
          const parser = new DOMParser()
          const xmlDoc = parser.parseFromString(text, 'text/xml')
          
          const produtosCompletos: ProdutoImportado[] = []
          const produtosNodes = xmlDoc.getElementsByTagName('produto')
          
          for (let i = 0; i < produtosNodes.length; i++) {
            const produto = produtosNodes[i]
            const nome = produto.getElementsByTagName('nome')[0]?.textContent
            if (nome) {
              produtosCompletos.push({
                id: Date.now().toString() + i,
                nome: nome,
                codigo: produto.getElementsByTagName('codigo')[0]?.textContent || '',
                preco: parseFloat(produto.getElementsByTagName('preco')[0]?.textContent || '0'),
                estoque: parseInt(produto.getElementsByTagName('estoque')[0]?.textContent || '0'),
                categoria: produto.getElementsByTagName('categoria')[0]?.textContent || 'Geral',
                descricao: produto.getElementsByTagName('descricao')[0]?.textContent || ''
              })
            }
          }
          
          // Mesclar com produtos existentes
          const produtosAtualizados = [...produtos, ...produtosCompletos]
          localStorage.setItem('produtos_estoque', JSON.stringify(produtosAtualizados))
          setProdutos(produtosAtualizados)
          setSucesso(`${produtosCompletos.length} produtos importados com sucesso!`)
          setArquivo(null)
          setPreview([])
        }
        reader.readAsText(arquivo)
      }
    } catch (error) {
      console.error('Erro na importação:', error)
      setErro('Erro ao importar produtos. Tente novamente.')
    } finally {
      setImportando(false)
    }
  }

  const baixarModeloCSV = () => {
    const modelo = [
      ['nome', 'codigo', 'preco', 'estoque', 'categoria', 'descricao'],
      ['Produto Exemplo', '123456', '29.90', '10', 'Geral', 'Descrição do produto aqui'],
      ['Outro Produto', '789012', '15.50', '25', 'Bebidas', 'Outra descrição']
    ]

    const csv = modelo.map(linha => linha.map(campo => `"${campo}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', 'modelo_importacao_produtos.csv')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const baixarModeloXML = () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<produtos>
  <produto>
    <nome>Produto Exemplo</nome>
    <codigo>123456</codigo>
    <preco>29.90</preco>
    <estoque>10</estoque>
    <categoria>Geral</categoria>
    <descricao>Descrição do produto aqui</descricao>
  </produto>
  <produto>
    <nome>Outro Produto</nome>
    <codigo>789012</codigo>
    <preco>15.50</preco>
    <estoque>25</estoque>
    <categoria>Bebidas</categoria>
    <descricao>Outra descrição</descricao>
  </produto>
</produtos>`

    const blob = new Blob([xml], { type: 'text/xml;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', 'modelo_importacao_produtos.xml')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
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
              <h1 className="text-xl font-semibold text-gray-900">Importar Produtos</h1>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={baixarModeloCSV}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Modelo CSV</span>
              </button>
              <button
                onClick={baixarModeloXML}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Modelo XML</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Importar Arquivo</h2>
            
            <div className="space-y-6">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
                <div className="text-center">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {arquivo ? arquivo.name : 'Selecione um arquivo'}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Formatos aceitos: CSV e XML
                  </p>
                  <label className="w-full">
                    <input
                      type="file"
                      accept=".csv,.xml"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <div className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer text-center transition-colors">
                      {arquivo ? 'Trocar Arquivo' : 'Escolher Arquivo'}
                    </div>
                  </label>
                </div>
              </div>

              {erro && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
                    <span className="text-sm text-red-800">{erro}</span>
                  </div>
                </div>
              )}

              {sucesso && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <span className="text-sm text-green-800">{sucesso}</span>
                  </div>
                </div>
              )}

              {preview.length > 0 && (
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Preview ({preview.length} produtos)</h4>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Código</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Preço</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Estoque</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {preview.map((produto, index) => (
                          <tr key={index}>
                            <td className="px-4 py-2 text-sm text-gray-900">{produto.nome}</td>
                            <td className="px-4 py-2 text-sm text-gray-900">{produto.codigo}</td>
                            <td className="px-4 py-2 text-sm text-gray-900">R$ {produto.preco.toFixed(2)}</td>
                            <td className="px-4 py-2 text-sm text-gray-900">{produto.estoque}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {preview.length > 0 && (
                <button
                  onClick={confirmarImportacao}
                  disabled={importando}
                  className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  {importando ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin" />
                      <span>Importando...</span>
                    </>
                  ) : (
                    <>
                      <Package className="w-4 h-4" />
                      <span>Importar {preview.length} Produtos</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Estatísticas */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Estátisticas</h2>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <Package className="w-8 h-8 text-blue-600 mr-3" />
                    <div>
                      <p className="text-2xl font-semibold text-blue-900">{produtos.length}</p>
                      <p className="text-sm text-blue-700">Produtos Atuais</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <BarChart3 className="w-8 h-8 text-green-600 mr-3" />
                    <div>
                      <p className="text-2xl font-semibold text-green-900">{preview.length}</p>
                      <p className="text-sm text-green-700">Para Importar</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Formatos Suportados</h4>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <FileText className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-700">
                      <strong>CSV:</strong> Separado por vírgula, com cabeçalho
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Database className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-700">
                      <strong>XML:</strong> Estrutura padrão de produtos
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-medium text-yellow-900 mb-3">Dicas de Importação</h4>
                <ul className="list-disc list-inside space-y-2 text-sm text-yellow-800">
                  <li>Use os modelos fornecidos para garantir compatibilidade</li>
                  <li>Verifique se todos os campos obrigatórios estão preenchidos</li>
                  <li>Produtos com mesmo código serão atualizados</li>
                  <li>Faça backup antes de importar grandes volumes</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
