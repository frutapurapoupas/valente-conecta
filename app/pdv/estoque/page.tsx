'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus, Edit, Trash2, Package, Search, AlertCircle, X, Save, Upload, AlertTriangle, Globe, Star, TrendingDown, FileText } from 'lucide-react'
import { useEstoquePage } from '@/hooks/useEstoquePage'
import ExtratoEstoque from './_ExtratoEstoque'

export default function EstoquePage() {
  const {
    produtos,
    searchTerm,
    setSearchTerm,
    showModal,
    setShowModal,
    editando,
    planoPago,
    formData,
    updateFormData,
    handleSubmit,
    handleEdit,
    handleDelete,
    abrirNovoProduto,
    produtosFiltrados,
    produtosVencidos,
    produtosProximosVencer,
    showCatalogo,
    setShowCatalogo,
    produtosAprovados,
  } = useEstoquePage()

  const [mostrarExtrato, setMostrarExtrato] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {mostrarExtrato && (
        <ExtratoEstoque
          produtos={produtosFiltrados}
          onClose={() => setMostrarExtrato(false)}
        />
      )}
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white sticky top-0 z-20">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Link href="/pdv/colaborativo" className="p-2 hover:bg-white/20 rounded-lg">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <img src="/logo.png" alt="Logo" className="w-8 h-8" />
            <span className="font-bold text-lg">Estoque</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMostrarExtrato(true)}
              className="bg-white/20 px-3 py-1 rounded-full text-sm flex items-center gap-1 hover:bg-white/30 transition"
            >
              <FileText className="w-4 h-4" />
              Extrato
            </button>
            <button
              onClick={() => setShowCatalogo(true)}
              className="bg-white/20 px-3 py-1 rounded-full text-sm flex items-center gap-1 hover:bg-white/30 transition"
            >
              <Globe className="w-4 h-4" />
              Catálogo
            </button>
            <button
              onClick={abrirNovoProduto}
              className="bg-white/20 px-3 py-1 rounded-full text-sm flex items-center gap-1 hover:bg-white/30 transition"
            >
              <Plus className="w-4 h-4" />
              Novo
            </button>
          </div>
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
                onClick={abrirNovoProduto}
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
                      {produto.emPromocao && (
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <TrendingDown className="w-3 h-3" /> Em promoção
                        </span>
                      )}
                      {produto.validade && new Date(produto.validade) < new Date() && planoPago && (
                        <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full">Vencido</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">Código: {produto.codigo}</p>
                    <div className="flex flex-wrap gap-4 mt-2">
                      <div className="flex items-center gap-1.5 text-sm">
                        <span>Preço:</span>
                        {produto.emPromocao && produto.precoAnterior != null && (
                          <span className="text-gray-400 line-through text-xs">R$ {produto.precoAnterior.toFixed(2)}</span>
                        )}
                        <span className={`font-bold ${produto.emPromocao ? 'text-red-600' : 'text-green-600'}`}>R$ {produto.preco.toFixed(2)}</span>
                      </div>
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
                  onChange={(e) => updateFormData('nome', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: Arroz Integral"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Código de barras (EAN) *</label>
                <input
                  type="text"
                  value={formData.codigo}
                  onChange={(e) => updateFormData('codigo', e.target.value)}
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
                    onChange={(e) => updateFormData('preco', e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0,00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Quantidade em estoque *</label>
                  <input
                    type="number"
                    value={formData.quantidade}
                    onChange={(e) => updateFormData('quantidade', e.target.value)}
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
                      onChange={(e) => updateFormData('fornecedor', e.target.value)}
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
                        onChange={(e) => updateFormData('precoCompra', e.target.value)}
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
                        onChange={(e) => updateFormData('validade', e.target.value)}
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

      {/* Modal Catálogo Online */}
      {showCatalogo && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-end justify-center">
          <div className="bg-white w-full max-w-lg rounded-t-3xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <div>
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <Globe className="w-5 h-5 text-blue-500" /> Como aparece na internet
                </h2>
                <p className="text-xs text-gray-400">{produtosAprovados.length} produto(s) publicado(s) no catálogo</p>
              </div>
              <button onClick={() => setShowCatalogo(false)} className="p-2 hover:bg-gray-100 rounded-xl">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Simulação visual do catálogo público */}
            <div className="overflow-y-auto flex-1 p-4">
              {/* Header fake de loja */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-4 mb-4 text-white text-center">
                <div className="w-14 h-14 bg-white/30 rounded-full mx-auto mb-2 flex items-center justify-center">
                  <Package className="w-8 h-8" />
                </div>
                <p className="font-bold">Minha Loja</p>
                <p className="text-xs text-blue-200">Valente, BA · Catálogo Online</p>
              </div>

              {produtosAprovados.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  <Globe className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="font-semibold">Nenhum produto publicado ainda</p>
                  <p className="text-xs mt-1">Produtos aguardam aprovação do Admin Master para aparecer aqui.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {produtosAprovados.map(p => (
                    <div key={p.id} className="bg-white border border-gray-100 rounded-2xl p-3 shadow-sm">
                      <div className="w-full h-24 bg-gray-100 rounded-xl mb-3 flex items-center justify-center">
                        {p.foto
                          ? <img src={p.foto} className="w-full h-full object-cover rounded-xl" />
                          : <Package className="w-8 h-8 text-gray-300" />
                        }
                      </div>
                      <p className="font-semibold text-sm leading-tight text-gray-800">{p.nome}</p>
                      <p className="text-green-600 font-bold mt-1">R$ {p.preco.toFixed(2)}</p>
                      {p.quantidade < 10 && (
                        <span className="text-[10px] text-orange-500 font-bold">Últimas unidades</span>
                      )}
                      <div className="mt-2 flex items-center gap-1">
                        {[1,2,3,4,5].map(s => <Star key={s} className="w-3 h-3 text-amber-400 fill-amber-400" />)}
                      </div>
                      <button className="mt-2 w-full text-xs bg-blue-600 text-white rounded-lg py-1.5 font-bold">
                        Ver detalhes
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <p className="text-center text-xs text-gray-400 mt-6 pb-2">
                Este é um preview de como os clientes veem seu catálogo no app e no site.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}