'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Search, Filter, MapPin, ShoppingCart, Plus, Minus, X, 
  Store, Package, Clock, Star, ChevronDown, ChevronUp,
  Send, User, Phone, Mail, Navigation, Check
} from 'lucide-react'

interface Product {
  id: string
  name: string
  price: number
  ean_code: string
  category: string
  store_id: string
  store_name: string
  store_address: string
  store_phone: string
  stock: number
  image_url: string
  rating?: number
  distance?: number
}

interface CartItem {
  product: Product
  quantity: number
}

export default function CatalogPage() {
  const [isClient, setIsClient] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('todos')
  const [selectedStore, setSelectedStore] = useState('todas')
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [showCart, setShowCart] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState('nome')
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null)

  useEffect(() => { setIsClient(true) }, [])

  useEffect(() => {
    // Carregar produtos mockados (integrar com Supabase depois)
    const mockProducts: Product[] = [
      {
        id: '1',
        name: 'Arroz Tipo 1 5kg',
        price: 25.90,
        ean_code: '7891000013105',
        category: 'alimentos',
        store_id: '1',
        store_name: 'Mercado Central Valente',
        store_address: 'Rua Principal, 123 - Centro',
        store_phone: '(77) 3451-1234',
        stock: 50,
        image_url: 'https://picsum.photos/seed/arroz/200/200',
        rating: 4.5,
        distance: 1.2
      },
      {
        id: '2',
        name: 'Feijão Carioca 1kg',
        price: 8.90,
        ean_code: '7891000033105',
        category: 'alimentos',
        store_id: '1',
        store_name: 'Mercado Central Valente',
        store_address: 'Rua Principal, 123 - Centro',
        store_phone: '(77) 3451-1234',
        stock: 30,
        image_url: 'https://picsum.photos/seed/feijao/200/200',
        rating: 4.7,
        distance: 1.2
      },
      {
        id: '3',
        name: 'Óleo de Soja Liza 900ml',
        price: 12.90,
        ean_code: '7891916000115',
        category: 'alimentos',
        store_id: '2',
        store_name: 'Atacadão de Valente',
        store_address: 'BR-116, Km 123 - Zona Rural',
        store_phone: '(77) 3451-5678',
        stock: 40,
        image_url: 'https://picsum.photos/seed/oleo/200/200',
        rating: 4.3,
        distance: 3.5
      },
      {
        id: '4',
        name: 'Serviço de Barbearia',
        price: 25.00,
        ean_code: '',
        category: 'servicos',
        store_id: '3',
        store_name: 'Barbearia Valente',
        store_address: 'Rua das Flores, 456',
        store_phone: '(77) 3451-9012',
        stock: 1,
        image_url: 'https://picsum.photos/seed/barbearia/200/200',
        rating: 4.9,
        distance: 0.8
      },
      {
        id: '5',
        name: 'Açúcar Refinado 1kg',
        price: 5.50,
        ean_code: '7896002100175',
        category: 'alimentos',
        store_id: '1',
        store_name: 'Mercado Central Valente',
        store_address: 'Rua Principal, 123 - Centro',
        store_phone: '(77) 3451-1234',
        stock: 60,
        image_url: 'https://picsum.photos/seed/acucar/200/200',
        rating: 4.4,
        distance: 1.2
      }
    ]
    setProducts(mockProducts)
    setFilteredProducts(mockProducts)
  }, [])

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
        (error) => console.log('Erro ao obter localização:', error)
      )
    }
  }, [])

  useEffect(() => {
    let filtered = products

    // Filtrar por termo de busca
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.store_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filtrar por categoria
    if (selectedCategory !== 'todos') {
      filtered = filtered.filter(product => product.category === selectedCategory)
    }

    // Filtrar por loja
    if (selectedStore !== 'todas') {
      filtered = filtered.filter(product => product.store_id === selectedStore)
    }

    // Ordenar
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'preco':
          return a.price - b.price
        case 'distancia':
          return (a.distance || 0) - (b.distance || 0)
        case 'avaliacao':
          return (b.rating || 0) - (a.rating || 0)
        default:
          return a.name.localeCompare(b.name)
      }
    })

    setFilteredProducts(filtered)
  }, [searchTerm, selectedCategory, selectedStore, sortBy, products])

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id)
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prev, { product, quantity: 1 }]
    })
  }

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId))
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId)
    } else {
      setCart(prev =>
        prev.map(item =>
          item.product.id === productId
            ? { ...item, quantity }
            : item
        )
      )
    }
  }

  const getTotalItems = () => cart.reduce((sum, item) => sum + item.quantity, 0)
  const getTotalPrice = () => cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)

  const [showCheckout, setShowCheckout] = useState(false)
  const [customerData, setCustomerData] = useState({
    name: '',
    phone: '',
    address: '',
    notes: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [orderStatus, setOrderStatus] = useState<'idle' | 'submitted' | 'processing' | 'confirmed'>('idle')
  const [orderResponse, setOrderResponse] = useState<any>(null)

  const sendToAdmin = async () => {
    if (!customerData.name || !customerData.phone) {
      alert('Por favor, preencha seus dados para continuar.')
      setShowCheckout(true)
      return
    }

    setIsSubmitting(true)
    setOrderStatus('processing')

    // Enviar pedido para admin do catálogo
    const orderData = {
      id: `order_${Date.now()}`,
      items: cart.map(item => ({
        product_id: item.product.id,
        name: item.product.name,
        quantity: item.quantity,
        price: item.product.price,
        store: item.product.store_name,
        store_address: item.product.store_address
      })),
      total: getTotalPrice(),
      customer: customerData,
      timestamp: new Date().toISOString(),
      customer_location: userLocation,
      status: 'pending'
    }

    try {
      // Simular envio para admin (integrar com Supabase depois)
      console.log('Enviando pedido para admin:', orderData)
      
      // Simular resposta do admin após 2 segundos
      setTimeout(() => {
        const adminResponse = {
          order_id: orderData.id,
          status: 'confirmed',
          treatment: 'pickup', // ou 'delivery'
          message: 'Seu pedido foi confirmado! Pode retirar na loja em 30 minutos.',
          estimated_time: '30 minutos',
          store_address: 'Rua Principal, 123 - Centro - Mercado Central Valente',
          phone: '(77) 3451-1234'
        }
        
        setOrderResponse(adminResponse)
        setOrderStatus('confirmed')
        setIsSubmitting(false)
        
        // Salvar no localStorage para persistência
        localStorage.setItem('lastOrder', JSON.stringify({
          order: orderData,
          response: adminResponse
        }))
        
        // Mostrar notificação
        alert(`Pedido confirmado! ${adminResponse.message}`)
      }, 2000)
      
    } catch (error) {
      console.error('Erro ao enviar pedido:', error)
      setIsSubmitting(false)
      setOrderStatus('idle')
      alert('Erro ao enviar pedido. Tente novamente.')
    }
  }

  const handleCheckout = () => {
    setShowCheckout(true)
  }

  const categories = [
    { value: 'todos', label: 'Todos' },
    { value: 'alimentos', label: 'Alimentos' },
    { value: 'servicos', label: 'Serviços' },
    { value: 'limpeza', label: 'Limpeza' },
    { value: 'higiene', label: 'Higiene' }
  ]

  const stores = [
    { value: 'todas', label: 'Todas as Lojas' },
    { value: '1', label: 'Mercado Central Valente' },
    { value: '2', label: 'Atacadão de Valente' },
    { value: '3', label: 'Barbearia Valente' }
  ]

  if (!isClient) return <div className="min-h-screen bg-black" />

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-40">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-zinc-950/95 border-b border-zinc-800/50 h-16 flex items-center justify-between px-4 backdrop-blur-md">
        <Link href="/" className="text-zinc-400">
          <X className="w-6 h-6" />
        </Link>
        <div className="text-center font-black uppercase italic bg-yellow-500 text-black px-4 py-1 rounded-sm shadow-[4px_4px_0px_#854d0e] skew-x-[-12deg]">
          Catálogo
        </div>
        <button 
          onClick={() => setShowCart(!showCart)}
          className="relative text-yellow-500"
        >
          <ShoppingCart className="w-6 h-6" />
          {getTotalItems() > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-black">
              {getTotalItems()}
            </span>
          )}
        </button>
      </header>

      <main className="max-w-2xl mx-auto px-4 pt-6">
        {/* Barra de Busca */}
        <section className="relative mb-6">
          <div className="absolute inset-0 bg-blue-600 rounded-[32px] blur-3xl opacity-30" />
          <div className="relative flex items-center gap-3 p-5 bg-blue-600 rounded-[32px] shadow-2xl">
            <Search className="w-5 h-5 text-white" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar produtos, serviços ou lojas..."
              className="flex-1 bg-transparent text-white placeholder-white/70 outline-none"
            />
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="text-white hover:bg-white/10 p-2 rounded-lg transition-all"
            >
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </section>

        {/* Filtros */}
        {showFilters && (
          <section className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-zinc-400 text-xs uppercase font-black mb-2 block">Categoria</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white"
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-zinc-400 text-xs uppercase font-black mb-2 block">Loja</label>
                <select
                  value={selectedStore}
                  onChange={(e) => setSelectedStore(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white"
                >
                  {stores.map(store => (
                    <option key={store.value} value={store.value}>{store.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-zinc-400 text-xs uppercase font-black mb-2 block">Ordenar por</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white"
                >
                  <option value="nome">Nome</option>
                  <option value="preco">Preço</option>
                  <option value="distancia">Distância</option>
                  <option value="avaliacao">Avaliação</option>
                </select>
              </div>
            </div>
          </section>
        )}

        {/* Resultados */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-black text-white">
              {filteredProducts.length} resultados
            </h2>
            {userLocation && (
              <div className="flex items-center gap-2 text-zinc-400 text-sm">
                <Navigation className="w-4 h-4" />
                <span>Localização ativa</span>
              </div>
            )}
          </div>

          <div className="space-y-4">
            {filteredProducts.map(product => (
              <div key={product.id} className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4">
                <div className="flex gap-4">
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-20 h-20 rounded-xl object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-bold text-white mb-1">{product.name}</h3>
                        <div className="flex items-center gap-2 text-zinc-400 text-sm mb-2">
                          <Store className="w-3 h-3" />
                          <span>{product.store_name}</span>
                          {product.distance && (
                            <span>· {product.distance}km</span>
                          )}
                        </div>
                        {product.rating && (
                          <div className="flex items-center gap-1 text-yellow-400 text-sm">
                            <Star className="w-3 h-3 fill-current" />
                            <span>{product.rating}</span>
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-black text-emerald-500">
                          R$ {product.price.toFixed(2)}
                        </div>
                        <div className="text-xs text-zinc-400">
                          Estoque: {product.stock}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-zinc-400 text-sm">
                        <MapPin className="w-3 h-3" />
                        <span>{product.store_address}</span>
                      </div>
                      <button
                        onClick={() => addToCart(product)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all"
                      >
                        <Plus className="w-4 h-4" />
                        Adicionar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Carrinho Flutuante */}
      {showCart && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-end">
          <div className="bg-zinc-900 w-full max-h-[70vh] overflow-y-auto rounded-t-3xl">
            <div className="sticky top-0 bg-zinc-900 border-b border-zinc-800 p-4 flex items-center justify-between">
              <h2 className="text-xl font-black text-white">Carrinho</h2>
              <button onClick={() => setShowCart(false)}>
                <X className="w-6 h-6 text-zinc-400" />
              </button>
            </div>
            
            <div className="p-4">
              {cart.length === 0 ? (
                <div className="text-center py-8 text-zinc-400">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Seu carrinho está vazio</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4 mb-6">
                    {cart.map(item => (
                      <div key={item.product.id} className="flex items-center gap-4 bg-zinc-800/50 rounded-xl p-3">
                        <img
                          src={item.product.image_url}
                          alt={item.product.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-white">{item.product.name}</h4>
                          <p className="text-sm text-zinc-400">{item.product.store_name}</p>
                          <p className="text-emerald-500 font-bold">R$ {item.product.price.toFixed(2)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="w-8 h-8 bg-zinc-700 rounded-lg flex items-center justify-center"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-8 text-center font-bold">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="w-8 h-8 bg-zinc-700 rounded-lg flex items-center justify-center"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-t border-zinc-800 pt-4">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-lg font-bold text-white">Total:</span>
                      <span className="text-2xl font-black text-emerald-500">
                        R$ {getTotalPrice().toFixed(2)}
                      </span>
                    </div>
                    <button
                      onClick={handleCheckout}
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:from-blue-600 hover:to-purple-700 transition-all"
                    >
                      <ShoppingCart className="w-5 h-5" />
                      Finalizar Compra
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Checkout */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 w-full max-w-md rounded-3xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-zinc-900 border-b border-zinc-800 p-4 flex items-center justify-between">
              <h2 className="text-xl font-black text-white">Finalizar Compra</h2>
              <button onClick={() => setShowCheckout(false)}>
                <X className="w-6 h-6 text-zinc-400" />
              </button>
            </div>
            
            <div className="p-4">
              {orderStatus === 'confirmed' && orderResponse ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-black text-emerald-500 mb-4">Pedido Confirmado!</h3>
                  <div className="bg-zinc-800/50 rounded-xl p-4 mb-4">
                    <p className="text-white font-medium mb-2">{orderResponse.message}</p>
                    <div className="text-zinc-400 text-sm space-y-1">
                      <p><strong>Pedido:</strong> {orderResponse.order_id}</p>
                      <p><strong>Tempo estimado:</strong> {orderResponse.estimated_time}</p>
                      <p><strong>Endereço:</strong> {orderResponse.store_address}</p>
                      <p><strong>Telefone:</strong> {orderResponse.phone}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowCheckout(false)
                      setShowCart(false)
                      setCart([])
                      setOrderStatus('idle')
                      setOrderResponse(null)
                    }}
                    className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white py-3 rounded-xl font-bold"
                  >
                    Entendido
                  </button>
                </div>
              ) : orderStatus === 'processing' ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                    <Clock className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-black text-white mb-2">Processando Pedido...</h3>
                  <p className="text-zinc-400">Aguarde a confirmação do administrador</p>
                </div>
              ) : (
                <>
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-white mb-4">Seus Dados</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-zinc-400 text-sm uppercase font-black mb-2 block">Nome Completo</label>
                        <input
                          type="text"
                          value={customerData.name}
                          onChange={(e) => setCustomerData({...customerData, name: e.target.value})}
                          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500"
                          placeholder="Seu nome completo"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-zinc-400 text-sm uppercase font-black mb-2 block">Telefone</label>
                        <input
                          type="tel"
                          value={customerData.phone}
                          onChange={(e) => setCustomerData({...customerData, phone: e.target.value})}
                          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500"
                          placeholder="(77) 9XXXX-XXXX"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-zinc-400 text-sm uppercase font-black mb-2 block">Endereço (opcional)</label>
                        <input
                          type="text"
                          value={customerData.address}
                          onChange={(e) => setCustomerData({...customerData, address: e.target.value})}
                          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500"
                          placeholder="Seu endereço para entrega"
                        />
                      </div>
                      <div>
                        <label className="text-zinc-400 text-sm uppercase font-black mb-2 block">Observações</label>
                        <textarea
                          value={customerData.notes}
                          onChange={(e) => setCustomerData({...customerData, notes: e.target.value})}
                          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 h-20"
                          placeholder="Alguma observação especial?"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-zinc-800 pt-4">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-lg font-bold text-white">Total:</span>
                      <span className="text-2xl font-black text-emerald-500">
                        R$ {getTotalPrice().toFixed(2)}
                      </span>
                    </div>
                    <button
                      onClick={sendToAdmin}
                      disabled={isSubmitting || !customerData.name || !customerData.phone}
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <Clock className="w-5 h-5 animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          Enviar Pedido
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
