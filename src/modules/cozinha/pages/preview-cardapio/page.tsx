// src/modules/cozinha/pages/preview-cardapio/page.tsx
// ============================================
// PÁGINA PREVIEW CARDÁPIO
// ============================================

'use client'

import React, { useState, useEffect } from 'react'
import {
  Menu,
  Search,
  Filter,
  Utensils,
  Star,
  Clock,
  DollarSign,
  ChefHat,
  Grid3x3,
  LayoutGrid,
  Sparkles,
  Info,
  ShoppingCart
} from 'lucide-react'
import { CardMetric } from '../../components/CardMetric'
import { StatusBadge } from '../../components/StatusBadge'
import { formatCurrency, formatTime } from '../../utils/formatadores'

// Dados mockados
const mockPratos = [
  { 
    id: 'PRA-001', 
    nome: 'Feijoada Completa', 
    categoria: 'Prato Principal', 
    preco: 45.00, 
    tempoPreparo: 60,
    descricao: 'Feijoada tradicional com arroz, couve e farofa',
    destaque: true,
    imagem: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&h=200&fit=crop'
  },
  { 
    id: 'PRA-002', 
    nome: 'Strogonoff de Frango', 
    categoria: 'Prato Principal', 
    preco: 35.00, 
    tempoPreparo: 30,
    descricao: 'Strogonoff cremoso com arroz e batata palha',
    destaque: false,
    imagem: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=200&h=200&fit=crop'
  },
  { 
    id: 'PRA-003', 
    nome: 'Lasanha Bolonhesa', 
    categoria: 'Massas', 
    preco: 32.00, 
    tempoPreparo: 45,
    descricao: 'Lasanha com molho bolonhesa e queijo gratinado',
    destaque: true,
    imagem: 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=200&h=200&fit=crop'
  },
  { 
    id: 'PRA-005', 
    nome: 'Pudim de Leite', 
    categoria: 'Sobremesa', 
    preco: 15.00, 
    tempoPreparo: 90,
    descricao: 'Pudim de leite condensado com calda de caramelo',
    destaque: true,
    imagem: 'https://images.unsplash.com/photo-1546069901-d5bfd2cbfb1f?w=200&h=200&fit=crop'
  }
]

export default function PreviewCardapioPage() {
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('Todos')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])

  const categorias = ['Todos', ...new Set(mockPratos.map(p => p.categoria))]
  const pratosDestaque = mockPratos.filter(p => p.destaque)

  const filteredPratos = mockPratos.filter(p => {
    const matchSearch = p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        p.descricao.toLowerCase().includes(searchTerm.toLowerCase())
    const matchCategoria = categoriaSelecionada === 'Todos' || p.categoria === categoriaSelecionada
    return matchSearch && matchCategoria
  })

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-20 bg-gray-200 rounded mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-64"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Menu className="text-orange-500" />
            Preview Cardápio
          </h1>
          <p className="text-gray-500">Visualize o cardápio como o cliente vê</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
            <Sparkles className="h-4 w-4" />
            Publicar Cardápio
          </button>
        </div>
      </div>

      {/* Destaques */}
      {pratosDestaque.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Star className="text-yellow-500 h-6 w-6" />
            Destaques do Cardápio
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {pratosDestaque.map(prato => (
              <div key={prato.id} className="bg-gradient-to-r from-orange-50 to-white rounded-lg border border-orange-200 p-4">
                <div className="flex items-start gap-3">
                  <div className="w-16 h-16 bg-orange-100 rounded-lg flex items-center justify-center text-3xl">
                    🍽️
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{prato.nome}</h3>
                    <p className="text-sm text-gray-600">{prato.descricao}</p>
                    <div className="flex items-center gap-3 mt-2 text-sm">
                      <span className="font-bold text-orange-600">{formatCurrency(prato.preco)}</span>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-500">{formatTime(prato.tempoPreparo)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Buscar no cardápio..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {categorias.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoriaSelecionada(cat)}
              className={px-4 py-2 rounded-lg transition-colors whitespace-nowrap }
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="flex gap-1 border rounded-lg overflow-hidden">
          <button
            onClick={() => setViewMode('grid')}
            className={p-2 transition-colors }
          >
            <Grid3x3 className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={p-2 transition-colors }
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Grid de Pratos */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPratos.map(prato => (
            <div key={prato.id} className="bg-white rounded-lg border shadow-sm overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-48 bg-gray-100 flex items-center justify-center">
                <span className="text-6xl">🍽️</span>
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-lg">{prato.nome}</h3>
                  {prato.destaque && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />}
                </div>
                <p className="text-sm text-gray-600 mt-1">{prato.descricao}</p>
                <div className="flex items-center gap-3 mt-3 text-sm">
                  <span className="font-bold text-orange-600">{formatCurrency(prato.preco)}</span>
                  <span className="text-gray-300">|</span>
                  <span className="text-gray-500 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatTime(prato.tempoPreparo)}
                  </span>
                </div>
                <button className="w-full mt-3 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm flex items-center justify-center gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  Pedir
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
          <div className="divide-y">
            {filteredPratos.map(prato => (
              <div key={prato.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center gap-4">
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-2xl flex-shrink-0">
                  🍽️
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{prato.nome}</h3>
                    {prato.destaque && <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />}
                    <span className="text-xs text-gray-400">{prato.categoria}</span>
                  </div>
                  <p className="text-sm text-gray-600 truncate">{prato.descricao}</p>
                  <div className="flex items-center gap-3 mt-1 text-sm">
                    <span className="font-bold text-orange-600">{formatCurrency(prato.preco)}</span>
                    <span className="text-gray-300">|</span>
                    <span className="text-gray-500 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatTime(prato.tempoPreparo)}
                    </span>
                  </div>
                </div>
                <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  Pedir
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rodapé */}
      <div className="mt-6 text-center text-sm text-gray-400">
        <span className="flex items-center justify-center gap-2">
          <Info className="h-4 w-4" />
          Cardápio atualizado em {new Date().toLocaleString('pt-BR')}
        </span>
      </div>
    </div>
  )
}
