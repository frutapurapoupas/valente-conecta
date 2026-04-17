'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
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
  isGoogleResult?: boolean
  isUserPublished?: boolean
  isPrecoDaHora?: boolean
  precoMinimo?: number
  precoMaximo?: number
  estabelecimentos?: number
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

  useEffect(() => {
    // Obter localização do usuário
    if (navigator.geolocation) {
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

  useEffect(() => {
    // Verificar se há parâmetro de busca na URL
    const urlParams = new URLSearchParams(window.location.search)
    const urlQuery = urlParams.get('q')
    if (urlQuery) {
      setQuery(urlQuery)
    }
  }, [])

  useEffect(() => {
    if (query) {
      buscarProdutos()
    }
  }, [query, filters, page])

  const buscarProdutos = async () => {
    if (!query.trim()) return
    
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.append('q', query)
      params.append('category', filters.category)
      params.append('minPrice', filters.minPrice.toString())
      params.append('maxPrice', filters.maxPrice.toString())
      if (userLocation?.lat) params.append('lat', userLocation.lat.toString())
      if (userLocation?.lng) params.append('lng', userLocation.lng.toString())
      params.append('page', page.toString())
      
      const response = await fetch(`/api/search-products?${params}`)
      const data = await response.json()
      
      // Debug: Log da resposta
      console.log('Resposta da API:', data)
      console.log('Parâmetros enviados:', params.toString())
      
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

  const formatarPreco = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price)
  }

  const formatarDistancia = (distance?: number) => {
    if (!distance) return ''
    return `${distance.toFixed(1)} km`
  }

  const categories = [
    { value: '', label: 'Todas' },
    { value: 'eletronicos', label: 'Eletrônicos' },
    { value: 'alimentos', label: 'Alimentos' },
    { value: 'roupas', label: 'Roupas' },
    { value: 'moveis', label: 'Móveis' },
    { value: 'servicos', label: 'Serviços' }
  ]

  return (
    <div className="min-h-screen bg-zinc-900 text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-zinc-900/95 backdrop-blur border-b border-zinc-800">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="p-2 rounded-xl bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 transition">
              <ChevronRight className="w-5 h-5 text-zinc-400 rotate-180" />
            </Link>
            <div className="flex-1">
              <h1 className="text-xl font-bold">Buscar Produtos</h1>
              <p className="text-zinc-400 text-sm">Encontre produtos próximos de você</p>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-lg transition ${
                showFilters ? 'bg-yellow-500 text-zinc-900' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Barra de Busca */}
        <div className="bg-zinc-800 rounded-xl p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-400" />
            <input
              type="text"
              placeholder="Buscar produtos..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-zinc-700 border border-zinc-600 rounded-lg pl-10 pr-4 py-3 text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
          </div>
        </div>

        {/* Filtros */}
        {showFilters && (
          <div className="bg-zinc-800 rounded-xl p-4 mb-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Categoria</label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({...filters, category: e.target.value})}
                  className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">Preço Mínimo</label>
                  <input
                    type="number"
                    placeholder="R$ 0"
                    value={filters.minPrice || ''}
                    onChange={(e) => setFilters({...filters, minPrice: parseFloat(e.target.value) || 0})}
                    className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-2 text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">Preço Máximo</label>
                  <input
                    type="number"
                    placeholder="R$ 1000"
                    value={filters.maxPrice === Infinity ? '' : filters.maxPrice}
                    onChange={(e) => setFilters({...filters, maxPrice: parseFloat(e.target.value) || Infinity})}
                    className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-2 text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>
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
                <span className="inline-block">Google Maps</span> Buscando em outras cidades...
              </p>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
          </div>
        )}

        {/* Resultados */}
        <div className="space-y-4">
          {products.map((product) => (
            <div key={product.id} className="bg-zinc-800 rounded-xl p-4">
              <div className="flex gap-4">
                <div className="w-20 h-20 bg-zinc-700 rounded-lg overflow-hidden flex-shrink-0">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-bold text-white">{product.name}</h3>
                      <p className="text-zinc-400 text-sm">{product.description}</p>
                    </div>
                    <div className="flex gap-2">
                      {product.isUserPublished && (
                        <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded-lg">
                          Usuário
                        </span>
                      )}
                      {product.isPrecoDaHora && (
                        <span className="bg-purple-500/20 text-purple-400 text-xs px-2 py-1 rounded-lg">
                          Preço da Hora
                        </span>
                      )}
                      {product.isGoogleResult && (
                        <span className="bg-blue-500/20 text-blue-400 text-xs px-2 py-1 rounded-lg">
                          Google Maps
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-zinc-400 mb-2">
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      <span className="text-green-400 font-bold">{formatarPreco(product.price)}</span>
                    </div>
                    {product.isPrecoDaHora && product.precoMinimo && product.precoMaximo && (
                      <div className="flex items-center gap-1 text-xs">
                        <span className="text-purple-400">R$ {product.precoMinimo.toFixed(2)} - R$ {product.precoMaximo.toFixed(2)}</span>
                      </div>
                    )}
                    {product.distance && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{formatarDistancia(product.distance)}</span>
                      </div>
                    )}
                    {product.isPrecoDaHora && product.estabelecimentos && (
                      <div className="flex items-center gap-1 text-xs">
                        <Package className="w-3 h-3" />
                        <span className="text-purple-400">{product.estabelecimentos} lojas</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-zinc-400">
                      <span className="font-medium">{product.store.name}</span>
                      <span className="text-xs ml-2">({product.store.location.address})</span>
                    </div>
                    <button className="bg-yellow-500 text-zinc-900 px-3 py-1 rounded-lg text-sm font-medium hover:bg-yellow-400 transition">
                      Ver Detalhes
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Carregar mais */}
        {hasMore && products.length > 0 && (
          <div className="text-center mt-6">
            <button
              onClick={() => setPage(prev => prev + 1)}
              disabled={loading}
              className="bg-zinc-700 text-white px-6 py-2 rounded-lg hover:bg-zinc-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Carregando...</span>
                </div>
              ) : (
                'Carregar mais produtos'
              )}
            </button>
          </div>
        )}

        {/* Nenhum resultado */}
        {!loading && products.length === 0 && query.trim() && (
          <div className="text-center py-12">
            <div className="bg-zinc-800 rounded-xl p-8 max-w-md mx-auto">
              <Search className="w-16 h-16 text-zinc-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Nenhum produto de usuário encontrado</h3>
              <p className="text-zinc-400 mb-4">
                Não encontramos produtos publicados por usuários para "{query}"
              </p>
              <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
                <p className="text-blue-400 text-sm font-medium">
                  <span className="inline-block">Google Maps</span> Buscando 3 produtos mais próximos em outras cidades...
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Estado inicial */}
        {!query && !loading && (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-zinc-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Buscar Produtos</h3>
            <p className="text-zinc-400">
              Digite o nome do produto que você está procurando
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
