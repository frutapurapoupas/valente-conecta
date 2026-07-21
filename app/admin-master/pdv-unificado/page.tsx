'use client'

import { useState, useEffect } from 'react'
import { 
  ShoppingCart, 
  Package, 
  Wallet, 
  CreditCard, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  TrendingUp,
  DollarSign,
  Users,
  Store
} from 'lucide-react'

interface Produto {
  id: string
  nome: string
  preco: number
  estoque: number
  categoria: string
  sku: string
}

interface Venda {
  id: string
  produtos: Produto[]
  total: number
  formaPagamento: string
  cliente: string
  data: string
  status: 'concluida' | 'pendente' | 'cancelada'
}

interface Fiado {
  id: string
  cliente: string
  valor: number
  produtos: string[]
  dataVencimento: string
  status: 'aberto' | 'pago' | 'vencido'
}

export default function PDVUnificadoPage() {
  const [activeTab, setActiveTab] = useState<'vendas' | 'estoque' | 'caixa' | 'fiado'>('vendas')
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [vendas, setVendas] = useState<Venda[]>([])
  const [fiados, setFiados] = useState<Fiado[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddProduct, setShowAddProduct] = useState(false)
  const [showAddFiado, setShowAddFiado] = useState(false)
  const [caixaAberto, setCaixaAberto] = useState(true)
  const [saldoCaixa, setSaldoCaixa] = useState(1567.50)

  // Dados mock para demonstraÃ§Ã£o
  useEffect(() => {
    // Mock de produtos
    setProdutos([
      { id: '1', nome: 'Arroz 5kg', preco: 25.90, estoque: 50, categoria: 'Alimentos', sku: 'ARROZ001' },
      { id: '2', nome: 'FeijÃ£o 1kg', preco: 8.50, estoque: 100, categoria: 'Alimentos', sku: 'FEIJ001' },
      { id: '3', nome: 'Ã“leo de Soja 900ml', preco: 12.90, estoque: 30, categoria: 'Alimentos', sku: 'OLEO001' },
      { id: '4', nome: 'Refrigerante 2L', preco: 8.00, estoque: 25, categoria: 'Bebidas', sku: 'REFR001' },
      { id: '5', nome: 'SabÃ£o em PÃ³ 1kg', preco: 15.90, estoque: 40, categoria: 'Limpeza', sku: 'SABA001' }
    ])

    // Mock de vendas
    setVendas([
      { id: '1', produtos: [{ id: '1', nome: 'Arroz 5kg', preco: 25.90, estoque: 50, categoria: 'Alimentos', sku: 'ARROZ001' }], total: 25.90, formaPagamento: 'PIX', cliente: 'JoÃ£o Silva', data: '2026-05-04', status: 'concluida' },
      { id: '2', produtos: [{ id: '2', nome: 'FeijÃ£o 1kg', preco: 8.50, estoque: 100, categoria: 'Alimentos', sku: 'FEIJ001' }], total: 8.50, formaPagamento: 'Dinheiro', cliente: 'Maria Santos', data: '2026-05-04', status: 'concluida' }
    ])

    // Mock de fiados
    setFiados([
      { id: '1', cliente: 'Carlos Pereira', valor: 45.80, produtos: ['Arroz 5kg', 'FeijÃ£o 1kg'], dataVencimento: '2026-05-10', status: 'aberto' },
      { id: '2', cliente: 'Ana Costa', valor: 28.90, produtos: ['Ã“leo de Soja', 'SabÃ£o em PÃ³'], dataVencimento: '2026-05-08', status: 'vencido' }
    ])
  }, [])

  const filteredProdutos = produtos.filter(produto => 
    produto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    produto.categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
    produto.sku.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const stats = {
    totalProdutos: produtos.length,
    valorEstoque: produtos.reduce((acc, p) => acc + (p.preco * p.estoque), 0),
    vendasHoje: vendas.filter(v => v.data === new Date().toISOString().split('T')[0]).length,
    fiadosAbertos: fiados.filter(f => f.status === 'aberto').length
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">PDV Unificado - Admin Master</h1>
        <p className="text-gray-400">Controle completo de vendas, estoque, caixa e fiado</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <Package className="w-8 h-8 text-blue-400" />
            <span className="text-2xl font-bold">{stats.totalProdutos}</span>
          </div>
          <p className="text-gray-400 text-sm">Total Produtos</p>
          <p className="text-green-400 text-xs mt-1">R$ {stats.valorEstoque.toFixed(2)} em estoque</p>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <ShoppingCart className="w-8 h-8 text-green-400" />
            <span className="text-2xl font-bold">{stats.vendasHoje}</span>
          </div>
          <p className="text-gray-400 text-sm">Vendas Hoje</p>
          <p className="text-green-400 text-xs mt-1">+15% vs ontem</p>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <Wallet className="w-8 h-8 text-yellow-400" />
            <span className="text-2xl font-bold">R$ {saldoCaixa.toFixed(2)}</span>
          </div>
          <p className="text-gray-400 text-sm">Saldo Caixa</p>
          <p className={`text-xs mt-1 ${caixaAberto ? 'text-green-400' : 'text-red-400'}`}>
            {caixaAberto ? 'Caixa Aberto' : 'Caixa Fechado'}
          </p>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <CreditCard className="w-8 h-8 text-orange-400" />
            <span className="text-2xl font-bold">{stats.fiadosAbertos}</span>
          </div>
          <p className="text-gray-400 text-sm">Fiados Abertos</p>
          <p className="text-orange-400 text-xs mt-1">R$ {fiados.reduce((acc, f) => acc + f.valor, 0).toFixed(2)} total</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-800 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('vendas')}
          className={`flex-1 py-2 px-4 rounded-md transition-colors ${
            activeTab === 'vendas' 
              ? 'bg-gray-700 text-white' 
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Vendas
        </button>
        <button
          onClick={() => setActiveTab('estoque')}
          className={`flex-1 py-2 px-4 rounded-md transition-colors ${
            activeTab === 'estoque' 
              ? 'bg-gray-700 text-white' 
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Estoque
        </button>
        <button
          onClick={() => setActiveTab('caixa')}
          className={`flex-1 py-2 px-4 rounded-md transition-colors ${
            activeTab === 'caixa' 
              ? 'bg-gray-700 text-white' 
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Caixa
        </button>
        <button
          onClick={() => setActiveTab('fiado')}
          className={`flex-1 py-2 px-4 rounded-md transition-colors ${
            activeTab === 'fiado' 
              ? 'bg-gray-700 text-white' 
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Fiado
        </button>
      </div>

      {/* Tab Content */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
        {/* VENDAS TAB */}
        {activeTab === 'vendas' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Vendas</h2>
              <button className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Nova Venda
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-4">ID</th>
                    <th className="text-left py-3 px-4">Cliente</th>
                    <th className="text-left py-3 px-4">Produtos</th>
                    <th className="text-left py-3 px-4">Total</th>
                    <th className="text-left py-3 px-4">Pagamento</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-left py-3 px-4">AÃ§Ãµes</th>
                  </tr>
                </thead>
                <tbody>
                  {vendas.map((venda) => (
                    <tr key={venda.id} className="border-b border-gray-700">
                      <td className="py-3 px-4">{venda.id}</td>
                      <td className="py-3 px-4">{venda.cliente}</td>
                      <td className="py-3 px-4">{venda.produtos.map(p => p.nome).join(', ')}</td>
                      <td className="py-3 px-4">R$ {venda.total.toFixed(2)}</td>
                      <td className="py-3 px-4">{venda.formaPagamento}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-xs ${
                          venda.status === 'concluida' ? 'bg-green-600' : 'bg-yellow-600'
                        }`}>
                          {venda.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <button className="text-blue-400 hover:text-blue-300 mr-2">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="text-red-400 hover:text-red-300">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ESTOQUE TAB */}
        {activeTab === 'estoque' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Estoque</h2>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar produtos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
                <button 
                  onClick={() => setShowAddProduct(true)}
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Novo Produto
                </button>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-4">SKU</th>
                    <th className="text-left py-3 px-4">Produto</th>
                    <th className="text-left py-3 px-4">Categoria</th>
                    <th className="text-left py-3 px-4">PreÃ§o</th>
                    <th className="text-left py-3 px-4">Estoque</th>
                    <th className="text-left py-3 px-4">Valor Total</th>
                    <th className="text-left py-3 px-4">AÃ§Ãµes</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProdutos.map((produto) => (
                    <tr key={produto.id} className="border-b border-gray-700">
                      <td className="py-3 px-4 font-mono text-sm">{produto.sku}</td>
                      <td className="py-3 px-4 font-medium">{produto.nome}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-gray-700 rounded text-xs">{produto.categoria}</span>
                      </td>
                      <td className="py-3 px-4">R$ {produto.preco.toFixed(2)}</td>
                      <td className="py-3 px-4">
                        <span className={`font-medium ${
                          produto.estoque < 10 ? 'text-red-400' : 'text-green-400'
                        }`}>
                          {produto.estoque}
                        </span>
                      </td>
                      <td className="py-3 px-4">R$ {(produto.preco * produto.estoque).toFixed(2)}</td>
                      <td className="py-3 px-4">
                        <button className="text-blue-400 hover:text-blue-300 mr-2">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="text-red-400 hover:text-red-300">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* CAIXA TAB */}
        {activeTab === 'caixa' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Controle de Caixa</h2>
              <button 
                onClick={() => setCaixaAberto(!caixaAberto)}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                  caixaAberto 
                    ? 'bg-red-600 hover:bg-red-700' 
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {caixaAberto ? (
                  <>
                    <Wallet className="w-4 h-4" />
                    Fechar Caixa
                  </>
                ) : (
                  <>
                    <DollarSign className="w-4 h-4" />
                    Abrir Caixa
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="font-bold mb-3 text-green-400">Entradas</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Vendas Dinheiro</span>
                    <span className="text-green-400">R$ 450.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Vendas PIX</span>
                    <span className="text-green-400">R$ 320.50</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Pagamentos Fiado</span>
                    <span className="text-green-400">R$ 156.80</span>
                  </div>
                  <div className="border-t border-gray-600 pt-2 mt-2">
                    <div className="flex justify-between font-bold">
                      <span>Total Entradas</span>
                      <span className="text-green-400">R$ 927.30</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="font-bold mb-3 text-red-400">SaÃ­das</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Sangrias</span>
                    <span className="text-red-400">R$ 100.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Despesas</span>
                    <span className="text-red-400">R$ 89.80</span>
                  </div>
                  <div className="border-t border-gray-600 pt-2 mt-2">
                    <div className="flex justify-between font-bold">
                      <span>Total SaÃ­das</span>
                      <span className="text-red-400">R$ 189.80</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="font-bold mb-3 text-yellow-400">Resumo</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Saldo Inicial</span>
                    <span>R$ 830.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Entradas</span>
                    <span className="text-green-400">+R$ 927.30</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">SaÃ­das</span>
                    <span className="text-red-400">-R$ 189.80</span>
                  </div>
                  <div className="border-t border-gray-600 pt-2 mt-2">
                    <div className="flex justify-between font-bold text-xl">
                      <span>Saldo Atual</span>
                      <span className="text-yellow-400">R$ {saldoCaixa.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* FIADO TAB */}
        {activeTab === 'fiado' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Controle de Fiado</h2>
              <button 
                onClick={() => setShowAddFiado(true)}
                className="bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Novo Fiado
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-4">ID</th>
                    <th className="text-left py-3 px-4">Cliente</th>
                    <th className="text-left py-3 px-4">Produtos</th>
                    <th className="text-left py-3 px-4">Valor</th>
                    <th className="text-left py-3 px-4">Vencimento</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-left py-3 px-4">AÃ§Ãµes</th>
                  </tr>
                </thead>
                <tbody>
                  {fiados.map((fiado) => (
                    <tr key={fiado.id} className="border-b border-gray-700">
                      <td className="py-3 px-4">{fiado.id}</td>
                      <td className="py-3 px-4 font-medium">{fiado.cliente}</td>
                      <td className="py-3 px-4 text-sm text-gray-400">{fiado.produtos.join(', ')}</td>
                      <td className="py-3 px-4 font-medium">R$ {fiado.valor.toFixed(2)}</td>
                      <td className="py-3 px-4">{fiado.dataVencimento}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-xs ${
                          fiado.status === 'aberto' ? 'bg-yellow-600' : 
                          fiado.status === 'pago' ? 'bg-green-600' : 'bg-red-600'
                        }`}>
                          {fiado.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <button className="text-green-400 hover:text-green-300 mr-2">
                          <DollarSign className="w-4 h-4" />
                        </button>
                        <button className="text-blue-400 hover:text-blue-300 mr-2">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="text-red-400 hover:text-red-300">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modals (simplificados para demonstraÃ§Ã£o) */}
      {showAddProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Adicionar Produto</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Nome do Produto"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg"
              />
              <input
                type="text"
                placeholder="SKU"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg"
              />
              <input
                type="number"
                placeholder="PreÃ§o"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg"
              />
              <input
                type="number"
                placeholder="Estoque"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg"
              />
              <select className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg">
                <option>Alimentos</option>
                <option>Bebidas</option>
                <option>Limpeza</option>
                <option>Outros</option>
              </select>
            </div>
            <div className="flex gap-2 mt-6">
              <button 
                onClick={() => setShowAddProduct(false)}
                className="flex-1 bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg"
              >
                Cancelar
              </button>
              <button 
                onClick={() => setShowAddProduct(false)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddFiado && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Registrar Fiado</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Nome do Cliente"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg"
              />
              <input
                type="number"
                placeholder="Valor Total"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg"
              />
              <input
                type="date"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg"
              />
              <textarea
                placeholder="Produtos (separados por vÃ­rgula)"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg h-24"
              />
            </div>
            <div className="flex gap-2 mt-6">
              <button 
                onClick={() => setShowAddFiado(false)}
                className="flex-1 bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg"
              >
                Cancelar
              </button>
              <button 
                onClick={() => setShowAddFiado(false)}
                className="flex-1 bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded-lg"
              >
                Registrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

