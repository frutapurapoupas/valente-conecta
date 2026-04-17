'use client'

import { useState, useEffect } from 'react'
import { 
  Search, 
  MapPin, 
  Filter, 
  ShoppingCart, 
  ExternalLink,
  Star,
  DollarSign,
  Package,
  ChevronRight,
  Loader2,
  X
} from 'lucide-react'

interface Product {
  id: string
  name: string
  description: string
  price: number
  image: string
  category: string
  store: {
    id: string
    name: string
    location: {
      lat: number
      lng: number
      address: string
    }
  }
  distance?: number
  rating?: number
  inStock: boolean
}

interface Filters {
  category: string
  minPrice: number
  maxPrice: number
}

export default function BuscaProdutosPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [googleSearching, setGoogleSearching] = useState(false)
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null)
  const [filters, setFilters] = useState<Filters>({
    category: '',
    minPrice: 0,
    maxPrice: Infinity
  })
  const [categories] = useState<string[]>([])

  useEffect(() => {
    carregarCategorias()
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        (error) => {
          console.error('Erro ao obter localização:', error)
        }
      )
    }
  }, [])

  const carregarCategorias = async () => {
    try {
      const response = await fetch('/api/search-products')
      const data = await response.json()
      const uniqueCategories = [...new Set(data.products.map((p: Product) => p.category))]
      setCategories(uniqueCategories)
    } catch (error) {
      console.error('Erro ao carregar categorias:', error)
    }
  }

  const buscarProdutos = async () => {
    if (!query.trim()) return
    
    setLoading(true)
    try {
      const params = new URLSearchParams({
        q: query,
        category: filters.category,
        minPrice: filters.minPrice.toString(),
        maxPrice: filters.maxPrice.toString(),
        lat: userLocation?.lat.toString(),
        lng: userLocation?.lng.toString(),
        page: page.toString()
      })
      
      const response = await fetch(`/api/search-products?${params}`)
      const data = await response.json()
      
      // Verificar se há resultados do Google Maps
      const hasGoogleResults = data.products.some((p: any) => p.isGoogleResult)
      
      if (hasGoogleResults) {
        setGoogleSearching(true)
        // Mostrar mensagem por 3 segundos
        setTimeout(() => setGoogleSearching(false), 3000)
      }
      
      if (page === 1) {
        setProducts(data.products)
      } else {
        setProducts(prev => [...prev, ...data.products])
      }
      
      setHasMore(data.hasMore)
    } catch (error) {
      console.error('Erro na busca:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim()) {
        buscarProdutos()
      }
    }, 500)
    
    return () => clearTimeout(timeoutId)
  }, [query, filters, userLocation, page])

  const formatDistance = (distance?: number) => {
    if (!distance) return null
    if (distance < 1) return `${Math.round(distance * 1000)}m`
    if (distance < 10) return `${distance.toFixed(1)}km`
    return `${distance.toFixed(0)}km`
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price)
  }

  const clearFilters = () => {
    setFilters({
      category: '',
      minPrice: 0,
      maxPrice: Infinity
    })
    setPage(1)
  }

  const applyFilters = () => {
    setPage(1)
    setShowFilters(false)
  }

  const loadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-900 text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-zinc-900/95 backdrop-blur border-b border-zinc-800">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-400" />
              <input
                type="text"
                placeholder="Buscar produtos..."
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setPage(1)
                }}
                className="w-full bg-zinc-700 border border-zinc-600 rounded-xl pl-10 pr-4 py-3 text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded hover:bg-zinc-600 transition"
                >
                  <X className="w-4 h-4 text-zinc-400" />
                </button>
              )}
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-3 rounded-xl transition ${
                showFilters ? 'bg-yellow-500 text-zinc-900' : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
              }`}
            >
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Filtros */}
      {showFilters && (
        <div className="sticky top-20 z-40 bg-zinc-800 border-b border-zinc-700 p-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Filtros</h3>
              <button
                onClick={() => setShowFilters(false)}
                className="p-2 rounded-lg bg-zinc-700 hover:bg-zinc-600 transition"
              >
                <X className="w-5 h-5 text-zinc-400" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Categoria */}
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Categoria</label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({...filters, category: e.target.value})}
                  className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                >
                  <option value="">Todas</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Preço Mínimo */}
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Preço Mínimo</label>
                <input
                  type="number"
                  value={filters.minPrice}
                  onChange={(e) => setFilters({...filters, minPrice: parseFloat(e.target.value) || 0})}
                  className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  placeholder="R$ 0,00"
                />
              </div>

              {/* Preço Máximo */}
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Preço Máximo</label>
                <input
                  type="number"
                  value={filters.maxPrice === Infinity ? '' : filters.maxPrice}
                  onChange={(e) => setFilters({...filters, maxPrice: e.target.value ? parseFloat(e.target.value) : Infinity})}
                  className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  placeholder="Sem limite"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <button
                onClick={clearFilters}
                className="flex-1 bg-zinc-700 text-zinc-300 py-2 rounded-lg hover:bg-zinc-600 transition"
              >
                Limpar
              </button>
              <button
                onClick={applyFilters}
                className="flex-1 bg-yellow-500 text-zinc-900 py-2 rounded-lg hover:bg-yellow-400 transition"
              >
                Aplicar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Localização do Usuário */}
      {userLocation && (
        <div className="bg-blue-500/20 border border-blue-500/30 p-3">
          <div className="max-w-6xl mx-auto flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-400" />
            <span className="text-blue-400 text-sm">
              Buscando produtos próximos da sua localização
            </span>
          </div>
        </div>
      )}

      {/* Resultados */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">
            {products.length > 0 ? `${products.length} produtos encontrados` : 'Nenhum produto encontrado'}
          </h2>
          {userLocation && (
            <div className="text-sm text-zinc-400">
              Ordenado por distância da sua localização
            </div>
          )}
        </div>

        {/* Grid de Produtos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product, index) => (
            <div key={product.id} className="bg-zinc-800 rounded-xl overflow-hidden hover:ring-2 hover:ring-yellow-500 transition-all">
              {/* Imagem */}
              <div className="aspect-square relative">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                
                {/* Badge de Externo */}
                {product.store.location.address.includes('Salvador') || 
                 product.store.location.address.includes('Juazeiro') || 
                 product.store.location.address.includes('Feira') || 
                 product.store.location.address.includes('CE') ? (
                  <div className="absolute top-2 right-2 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <ExternalLink className="w-3 h-3" />
                    Fora
                  </div>
                ) : null}

                {/* Badge de Estoque */}
                {!product.inStock && (
                  <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                    Esgotado
                  </div>
                )}
              </div>

              {/* Informações do Produto */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-white text-lg flex-1">{product.name}</h3>
                  <div className="text-right">
                    <div className="text-green-400 font-bold text-xl">{formatPrice(product.price)}</div>
                    {product.rating && (
                      <div className="flex items-center gap-1 text-yellow-400 text-sm">
                        <Star className="w-4 h-4 fill-current" />
                        {product.rating}
                      </div>
                    )}
                  </div>
                </div>

                <p className="text-zinc-400 text-sm mb-3 line-clamp-2">{product.description}</p>

                {/* Loja e Distância */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-zinc-400">
                    <ShoppingCart className="w-4 h-4" />
                    <span>{product.store.name}</span>
                  </div>
                  
                  {product.distance && (
                    <div className="flex items-center gap-2 text-zinc-400">
                      <MapPin className="w-4 h-4" />
                      <span>{formatDistance(product.distance)}</span>
                    </div>
                  )}
                </div>

                {/* Categoria */}
                <div className="flex items-center gap-2 mt-2">
                  <Package className="w-4 h-4 text-zinc-400" />
                  <span className="text-zinc-400">{product.category}</span>
                </div>
              </div>

              {/* Botão de Ação */}
              <div className="mt-4 pt-4 border-t border-zinc-700">
                <button className="w-full bg-yellow-500 text-zinc-900 py-3 rounded-lg font-bold hover:bg-yellow-400 transition flex items-center justify-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Ver Detalhes
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
          </div>
        )}

        {/* Carregar Mais */}
        {!loading && hasMore && products.length > 0 && (
          <div className="flex justify-center py-6">
            <button
              onClick={loadMore}
              className="bg-zinc-700 text-zinc-300 px-6 py-3 rounded-lg hover:bg-zinc-600 transition flex items-center gap-2"
            >
              <Loader2 className="w-5 h-5" />
              Carregar mais produtos
            </button>
          </div>
        )}

        {/* Nenhum resultado */}
        {!loading && products.length === 0 && query.trim() && (
          <div className="text-center py-12">
            <div className="bg-zinc-800 rounded-xl p-8 max-w-md mx-auto">
              <Search className="w-16 h-16 text-zinc-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Nenhum produto local encontrado</h3>
              <p className="text-zinc-400 mb-4">
                Não encontramos produtos para "{query}" em Valente
              </p>
              <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4">
                <p className="text-yellow-400 text-sm font-medium">
                  <span className="inline-block">📍</span> Mostrando 3 produtos mais próximos de outras cidades
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Mensagem de busca no Google Maps */}
        {googleSearching && (
          <div className="fixed top-20 left-0 right-0 z-50 bg-blue-500/90 backdrop-blur-sm p-4">
            <div className="max-w-md mx-auto flex items-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <p className="text-white text-sm font-medium">
                🔍 Buscando com Google Maps em outras cidades...
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
