'use client'

import { useState } from 'react'
import { Search, Package, Image, CheckCircle, XCircle, Eye, Edit, Trash2, Upload, Filter, Clock, AlertCircle } from 'lucide-react'

interface Produto {
  id: string
  nome: string
  codigo: string
  empresaId: string
  empresaNome: string
  preco: number
  quantidade: number
  categoria: string
  status: 'aprovado' | 'pendente' | 'rejeitado'
  fotos: string[]
  dataCadastro: string
  fornecedor?: string
  validade?: string
}

export default function AdminCatalogo() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filtroStatus, setFiltroStatus] = useState<'todos' | 'aprovado' | 'pendente' | 'rejeitado'>('todos')
  const [showModal, setShowModal] = useState(false)
  const [produtoSelecionado, setProdutoSelecionado] = useState<Produto | null>(null)

  const [produtos, setProdutos] = useState<Produto[]>([
    { 
      id: '1', 
      nome: 'Arroz Integral 1kg', 
      codigo: '7891234567890',
      empresaId: '1',
      empresaNome: 'Supermercado Valente',
      preco: 8.90,
      quantidade: 50,
      categoria: 'Alimentação',
      status: 'aprovado',
      fotos: ['/produto1.jpg'],
      dataCadastro: '01/04/2026',
      fornecedor: 'Distribuidora A',
      validade: '2025-12-31'
    },
    { 
      id: '2', 
      nome: 'Feijão Preto 1kg', 
      codigo: '7891234567891',
      empresaId: '1',
      empresaNome: 'Supermercado Valente',
      preco: 7.90,
      quantidade: 30,
      categoria: 'Alimentação',
      status: 'aprovado',
      fotos: ['/produto2.jpg'],
      dataCadastro: '01/04/2026',
      fornecedor: 'Distribuidora A',
      validade: '2025-10-15'
    },
    { 
      id: '3', 
      nome: 'Pão Francês', 
      codigo: '7891234567892',
      empresaId: '2',
      empresaNome: 'Padaria do Zé',
      preco: 0.80,
      quantidade: 200,
      categoria: 'Padaria',
      status: 'pendente',
      fotos: [],
      dataCadastro: '05/04/2026'
    },
    { 
      id: '4', 
      nome: 'Café 500g', 
      codigo: '7891234567893',
      empresaId: '1',
      empresaNome: 'Supermercado Valente',
      preco: 12.90,
      quantidade: 25,
      categoria: 'Bebidas',
      status: 'aprovado',
      fotos: ['/produto4.jpg'],
      dataCadastro: '28/03/2026',
      fornecedor: 'Distribuidora C',
      validade: '2025-08-10'
    },
  ])

  const produtosFiltrados = produtos.filter(p => {
    if (filtroStatus !== 'todos' && p.status !== filtroStatus) return false
    if (searchTerm && !p.nome.toLowerCase().includes(searchTerm.toLowerCase()) && !p.empresaNome.toLowerCase().includes(searchTerm.toLowerCase())) return false
    return true
  })

  const aprovarProduto = (id: string) => {
    setProdutos(produtos.map(p => p.id === id ? { ...p, status: 'aprovado' } : p))
    alert('✅ Produto aprovado e publicado no catálogo!')
  }

  const rejeitarProduto = (id: string) => {
    setProdutos(produtos.map(p => p.id === id ? { ...p, status: 'rejeitado' } : p))
    alert('❌ Produto rejeitado. Notificação enviada ao lojista.')
  }

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'aprovado': return <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Aprovado</span>
      case 'pendente': return <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs flex items-center gap-1"><Clock className="w-3 h-3" /> Pendente</span>
      case 'rejeitado': return <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs flex items-center gap-1"><XCircle className="w-3 h-3" /> Rejeitado</span>
      default: return null
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Catálogo de Produtos</h1>
          <p className="text-gray-500">Gerencie e aprove produtos para o catálogo online</p>
        </div>
        <div className="flex gap-2">
          <button className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-600">
            <Upload className="w-5 h-5" />
            Importar em Lote
          </button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm text-center">
          <Package className="w-8 h-8 text-blue-500 mx-auto mb-2" />
          <p className="text-2xl font-bold">{produtos.length}</p>
          <p className="text-sm text-gray-500">Total de Produtos</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm text-center">
          <Clock className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
          <p className="text-2xl font-bold">{produtos.filter(p => p.status === 'pendente').length}</p>
          <p className="text-sm text-gray-500">Aguardando Aprovação</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm text-center">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="text-2xl font-bold">{produtos.filter(p => p.status === 'rejeitado').length}</p>
          <p className="text-sm text-gray-500">Rejeitados</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por produto ou empresa..."
                className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm"
              />
            </div>
          </div>
          <div className="flex gap-2">
            {['todos', 'pendente', 'aprovado', 'rejeitado'].map(status => (
              <button
                key={status}
                onClick={() => setFiltroStatus(status as any)}
                className={`px-4 py-2 rounded-lg text-sm capitalize ${
                  filtroStatus === status 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status === 'todos' ? 'Todos' : status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Lista de Produtos */}
      <div className="space-y-3">
        {produtosFiltrados.map(produto => (
          <div key={produto.id} className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <h3 className="font-bold text-lg">{produto.nome}</h3>
                  {getStatusBadge(produto.status)}
                  <span className="text-sm text-gray-500">Código: {produto.codigo}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                  <div>
                    <p className="text-gray-500">Empresa</p>
                    <p className="font-medium">{produto.empresaNome}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Preço</p>
                    <p className="font-bold text-green-600">R$ {produto.preco.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Estoque</p>
                    <p>{produto.quantidade} unidades</p>
                  </div>
                </div>
                {produto.fornecedor && (
                  <p className="text-xs text-gray-500 mt-2">Fornecedor: {produto.fornecedor}</p>
                )}
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setProdutoSelecionado(produto); setShowModal(true) }} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg">
                  <Eye className="w-5 h-5" />
                </button>
                {produto.status === 'pendente' && (
                  <>
                    <button onClick={() => aprovarProduto(produto.id)} className="p-2 text-green-500 hover:bg-green-50 rounded-lg" title="Aprovar">
                      <CheckCircle className="w-5 h-5" />
                    </button>
                    <button onClick={() => rejeitarProduto(produto.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg" title="Rejeitar">
                      <XCircle className="w-5 h-5" />
                    </button>
                  </>
                )}
                <button className="p-2 text-orange-500 hover:bg-orange-50 rounded-lg">
                  <Edit className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de Detalhes */}
      {showModal && produtoSelecionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold">{produtoSelecionado.nome}</h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                ✕
              </button>
            </div>
            <div className="p-4 space-y-3">
              <div className="bg-gray-100 rounded-lg p-4 text-center">
                <Image className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">Fotos do produto</p>
                <p className="text-xs text-gray-400">{produtoSelecionado.fotos.length} foto(s)</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Código de barras</p>
                <p className="font-mono">{produtoSelecionado.codigo}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Categoria</p>
                <p>{produtoSelecionado.categoria}</p>
              </div>
              {produtoSelecionado.validade && (
                <div>
                  <p className="text-sm text-gray-500">Validade</p>
                  <p className={new Date(produtoSelecionado.validade) < new Date() ? 'text-red-500' : ''}>
                    {produtoSelecionado.validade}
                  </p>
                </div>
              )}
              <div className="border-t pt-3 mt-2">
                <p className="text-sm text-gray-500">Data de cadastro</p>
                <p>{produtoSelecionado.dataCadastro}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}