'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus, Edit, Trash2, Camera, Package, Search, AlertCircle, X, Save, Upload, AlertTriangle } from 'lucide-react'

interface Produto {
  id: string
  nome: string
  codigo: string
  preco: number
  quantidade: number
  foto?: string
  fornecedor?: string
  precoCompra?: number
  validade?: string
  pendenteAprovacao?: boolean
  dataCadastro?: string
}

export default function EstoquePage() {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editando, setEditando] = useState<Produto | null>(null)
  const [planoPago, setPlanoPago] = useState(false) // Simular - verificar plano do usuário
  const [formData, setFormData] = useState({
    nome: '',
    codigo: '',
    preco: '',
    quantidade: '',
    fornecedor: '',
    precoCompra: '',
    validade: ''
  })

  useEffect(() => {
    // Carregar produtos do localStorage
    const saved = localStorage.getItem('produtos_estoque')
    if (saved) {
      setProdutos(JSON.parse(saved))
    } else {
      // Produtos de exemplo
      const exemplos: Produto[] = [
        { 
          id: '1', 
          nome: 'Arroz Integral 1kg', 
          codigo: '7891234567890', 
          preco: 8.90, 
          quantidade: 50, 
          fornecedor: 'Distribuidora A', 
          precoCompra: 6.50, 
          validade: '2025-12-31',
          dataCadastro: new Date().toISOString()
        },
        { 
          id: '2', 
          nome: 'Feijão Preto 1kg', 
          codigo: '7891234567891', 
          preco: 7.90, 
          quantidade: 30, 
          fornecedor: 'Distribuidora A', 
          precoCompra: 5.80, 
          validade: '2025-10-15',
          dataCadastro: new Date().toISOString()
        },
        { 
          id: '3', 
          nome: 'Açúcar 1kg', 
          codigo: '7891234567892', 
          preco: 4.50, 
          quantidade: 100, 
          fornecedor: 'Distribuidora B', 
          precoCompra: 3.20, 
          validade: '2026-01-20',
          dataCadastro: new Date().toISOString()
        },
        { 
          id: '4', 
          nome: 'Café 500g', 
          codigo: '7891234567893', 
          preco: 12.90, 
          quantidade: 25, 
          fornecedor: 'Distribuidora C', 
          precoCompra: 9.50, 
          validade: '2025-08-10',
          dataCadastro: new Date().toISOString()
        }
      ]
      setProdutos(exemplos)
      localStorage.setItem('produtos_estoque', JSON.stringify(exemplos))
    }
  }, [])

  const handleSubmit = () => {
    if (!formData.nome || !formData.codigo || !formData.preco || !formData.quantidade) {
      alert('Preencha os campos obrigatórios: Nome, Código, Preço e Quantidade')
      return
    }

    const novoProduto: Produto = {
      id: editando?.id || Date.now().toString(),
      nome: formData.nome,
      codigo: formData.codigo,
      preco: parseFloat(formData.preco),
      quantidade: parseInt(formData.quantidade),
      fornecedor: formData.fornecedor || undefined,
      precoCompra: formData.precoCompra ? parseFloat(formData.precoCompra) : undefined,
      validade: formData.validade || undefined,
      pendenteAprovacao: !editando, // Se for novo, precisa de aprovação do Admin Master
      dataCadastro: editando?.dataCadastro || new Date().toISOString()
    }

    let novosProdutos
    if (editando) {
      novosProdutos = produtos.map(p => p.id === editando.id ? novoProduto : p)
    } else {
      novosProdutos = [...produtos, novoProduto]
    }

    setProdutos(novosProdutos)
    localStorage.setItem('produtos_estoque', JSON.stringify(novosProdutos))
    
    // Alertar Admin Master se for produto novo
    if (!editando) {
      alert('✅ Produto adicionado! Aguardando aprovação do Admin Master para publicação no catálogo.')
    } else {
      alert('✅ Produto atualizado com sucesso!')
    }
    
    // Atualizar catálogo automático
    const catalogo = localStorage.getItem('catalogo_automatico')
    const novoCatalogo = catalogo ? JSON.parse(catalogo) : []
    const indexCatalogo = novoCatalogo.findIndex((p: any) => p.codigo === formData.codigo)
    if (indexCatalogo !== -1) {
      novoCatalogo[indexCatalogo] = { ...novoProduto, dataAtualizacao: new Date().toISOString() }
    } else {
      novoCatalogo.push({ ...novoProduto, dataCadastro: new Date().toISOString() })
    }
    localStorage.setItem('catalogo_automatico', JSON.stringify(novoCatalogo))
    
    setShowModal(false)
    setEditando(null)
    setFormData({ nome: '', codigo: '', preco: '', quantidade: '', fornecedor: '', precoCompra: '', validade: '' })
  }

  const handleEdit = (produto: Produto) => {
    setEditando(produto)
    setFormData({
      nome: produto.nome,
      codigo: produto.codigo,
      preco: produto.preco.toString(),
      quantidade: produto.quantidade.toString(),
      fornecedor: produto.fornecedor || '',
      precoCompra: produto.precoCompra?.toString() || '',
      validade: produto.validade || ''
    })
    setShowModal(true)
  }

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita.')) {
      const novosProdutos = produtos.filter(p => p.id !== id)
      setProdutos(novosProdutos)
      localStorage.setItem('produtos_estoque', JSON.stringify(novosProdutos))
      
      // Remover do catálogo automático
      const catalogo = localStorage.getItem('catalogo_automatico')
      if (catalogo) {
        const catalogoArray = JSON.parse(catalogo)
        const novoCatalogo = catalogoArray.filter((p: any) => p.id !== id)
        localStorage.setItem('catalogo_automatico', JSON.stringify(novoCatalogo))
      }
      
      alert('✅ Produto excluído com sucesso!')
    }
  }

  const produtosFiltrados = produtos.filter(p => 
    p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.codigo.includes(searchTerm)
  )

  const produtosVencidos = produtos.filter(p => p.validade && new Date(p.validade) < new Date())
  const produtosProximosVencer = produtos.filter(p => {
    if (!p.validade) return false
    const diasRestantes = Math.ceil((new Date(p.validade).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    return diasRestantes <= 30 && diasRestantes > 0
  })

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white sticky top-0 z-20">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Link href="/pdv" className="p-2 hover:bg-white/20 rounded-lg">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <img src="/logo.png" alt="Logo" className="w-8 h-8" />
            <span className="font-bold text-lg">Estoque</span>
          </div>
          <button
            onClick={() => { setEditando(null); setFormData({ nome: '', codigo: '', preco: '', quantidade: '', fornecedor: '', precoCompra: '', validade: '' }); setShowModal(true) }}
            className="bg-white/20 px-3 py-1 rounded-full text-sm flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Novo Produto
          </button>
        </div>
      </header>

      <main className="p-4 max-w-7xl mx-auto">
        {/* Alertas de validade (apenas plano pago) */}
        {planoPago && (produtosVencidos.length > 0 || produtosProximosVencer.length > 0) && (
          <div className="space-y-2 mb-6">
            {produtosVencidos.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <span className="font-semibold text-red-800">Produtos com validade vencida</span>
                </div>
                <div className="space-y-1">
                  {produtosVencidos.map(p => (
                    <p key={p.id} className="text-sm text-red-700">• {p.nome} - Venceu em {new Date(p.validade!).toLocaleDateString()}</p>
                  ))}
                </div>
              </div>
            )}
            {produtosProximosVencer.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                  <span className="font-semibold text-yellow-800">Produtos próximos ao vencimento</span>
                </div>
                <div className="space-y-1">
                  {produtosProximosVencer.map(p => (
                    <p key={p.id} className="text-sm text-yellow-700">• {p.nome} - Vence em {new Date(p.validade!).toLocaleDateString()}</p>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {!planoPago && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <p className="text-sm text-blue-800">
              💡 <strong>Plano Grátis:</strong> Controle básico de estoque. 
              <Link href="/carteira" className="underline ml-1">Atualize para o plano pago</Link> e tenha alertas de validade, relatórios completos e muito mais!
            </p>
          </div>
        )}

        {/* Busca */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nome ou código de barras..."
              className="w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Estatísticas rápidas */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-xl p-3 text-center shadow-sm">
            <p className="text-2xl font-bold text-blue-600">{produtos.length}</p>
            <p className="text-xs text-gray-500">Produtos</p>
          </div>
          <div className="bg-white rounded-xl p-3 text-center shadow-sm">
            <p className="text-2xl font-bold text-green-600">
              {produtos.reduce((sum, p) => sum + p.quantidade, 0)}
            </p>
            <p className="text-xs text-gray-500">Unidades</p>
          </div>
          <div className="bg-white rounded-xl p-3 text-center shadow-sm">
            <p className="text-2xl font-bold text-purple-600">
              R$ {produtos.reduce((sum, p) => sum + (p.preco * p.quantidade), 0).toFixed(0)}
            </p>
            <p className="text-xs text-gray-500">Valor total</p>
          </div>
        </div>

        {/* Lista de produtos */}
        <div className="space-y-3">
          {produtosFiltrados.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center">
              <Package className="w-12 h-12 mx-auto text-gray-400 mb-2" />
              <p className="text-gray-500">Nenhum produto encontrado</p>
              <button
                onClick={() => { setEditando(null); setFormData({ nome: '', codigo: '', preco: '', quantidade: '', fornecedor: '', precoCompra: '', validade: '' }); setShowModal(true) }}
                className="mt-3 text-blue-500 text-sm"
              >
                + Adicionar primeiro produto
              </button>
            </div>
          ) : (
            produtosFiltrados.map(produto => (
              <div key={produto.id} className="bg-white rounded-xl shadow-sm p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <Package className="w-5 h-5 text-blue-500" />
                      <h3 className="font-semibold">{produto.nome}</h3>
                      {produto.pendenteAprovacao && (
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">Aguardando aprovação</span>
                      )}
                      {produto.validade && new Date(produto.validade) < new Date() && planoPago && (
                        <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full">Vencido</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">Código: {produto.codigo}</p>
                    <div className="flex flex-wrap gap-4 mt-2">
                      <p className="text-sm">Preço: <span className="font-bold text-green-600">R$ {produto.preco.toFixed(2)}</span></p>
                      <p className="text-sm">Estoque: <span className={`font-bold ${produto.quantidade < 10 ? 'text-red-500' : 'text-gray-700'}`}>{produto.quantidade} un</span></p>
                      {planoPago && produto.fornecedor && (
                        <p className="text-xs text-gray-500">Fornecedor: {produto.fornecedor}</p>
                      )}
                    </div>
                    {produto.quantidade < 10 && (
                      <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Estoque baixo! Recomendamos reabastecer.
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(produto)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg">
                      <Edit className="w-5 h-5" />
                    </button>
                    <button onClick={() => handleDelete(produto.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Modal de Produto */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-auto">
            <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold">{editando ? 'Editar Produto' : 'Novo Produto'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nome do produto *</label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => setFormData({...formData, nome: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: Arroz Integral"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Código de barras (EAN) *</label>
                <input
                  type="text"
                  value={formData.codigo}
                  onChange={(e) => setFormData({...formData, codigo: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="7891234567890"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Preço de venda (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.preco}
                    onChange={(e) => setFormData({...formData, preco: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0,00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Quantidade em estoque *</label>
                  <input
                    type="number"
                    value={formData.quantidade}
                    onChange={(e) => setFormData({...formData, quantidade: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Foto do produto */}
              <div>
                <label className="block text-sm font-medium mb-1">Foto do produto</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-500 transition">
                  <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">Clique para adicionar foto</p>
                  <p className="text-xs text-gray-400">A foto será analisada pelo Admin Master</p>
                </div>
              </div>

              {/* Campos para plano pago */}
              <div className="border-t pt-4 mt-2">
                <p className="text-sm font-medium mb-3 flex items-center gap-2">
                  <span>📊 Informações adicionais</span>
                  {!planoPago && <span className="text-xs text-gray-400">(Plano Pago)</span>}
                </p>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Fornecedor</label>
                    <input
                      type="text"
                      value={formData.fornecedor}
                      onChange={(e) => setFormData({...formData, fornecedor: e.target.value})}
                      className={`w-full px-4 py-2 border rounded-lg ${!planoPago ? 'bg-gray-50' : ''}`}
                      placeholder="Digite o fornecedor"
                      disabled={!planoPago}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Preço de compra (R$)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.precoCompra}
                        onChange={(e) => setFormData({...formData, precoCompra: e.target.value})}
                        className={`w-full px-4 py-2 border rounded-lg ${!planoPago ? 'bg-gray-50' : ''}`}
                        placeholder="0,00"
                        disabled={!planoPago}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Data de validade</label>
                      <input
                        type="date"
                        value={formData.validade}
                        onChange={(e) => setFormData({...formData, validade: e.target.value})}
                        className={`w-full px-4 py-2 border rounded-lg ${!planoPago ? 'bg-gray-50' : ''}`}
                        disabled={!planoPago}
                      />
                    </div>
                  </div>
                  {!planoPago && (
                    <p className="text-xs text-center text-gray-400 bg-gray-50 p-2 rounded-lg">
                      💡 <Link href="/carteira" className="text-blue-500">Atualize para o plano pago</Link> e tenha acesso a estas funcionalidades
                    </p>
                  )}
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-xs text-blue-800">
                  ℹ️ <strong>Como funciona?</strong> Produtos novos precisam de aprovação do Admin Master para serem publicados no catálogo online.
                  Enquanto isso, você já pode vender no seu PDV.
                </p>
              </div>

              <button
                onClick={handleSubmit}
                className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                {editando ? 'Salvar Alterações' : 'Adicionar Produto'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}