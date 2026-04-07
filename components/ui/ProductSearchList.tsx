'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Search, Package, Plus, AlertCircle, Loader2, ImageIcon } from 'lucide-react'

interface Produto {
  id: string
  nome: string
  codigo_barras: string | null
  preco: number | null
  foto: string | null
  estoque: number
  status: string
}

interface ProductSearchListProps {
  onSelectProduct: (produto: Produto) => void
  onCadastroRapido: (nome: string) => void
  lojaId: string
  usuarioId: string
}

export default function ProductSearchList({ 
  onSelectProduct, 
  onCadastroRapido, 
  lojaId, 
  usuarioId 
}: ProductSearchListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [loading, setLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const debounceTimer = useRef<NodeJS.Timeout>()

  // Buscar produtos com debounce
  const buscarProdutos = useCallback(async (termo: string) => {
    if (!termo || termo.length < 2) {
      setProdutos([])
      setShowDropdown(false)
      return
    }

    setLoading(true)
    
    try {
      // Buscar do localStorage (simulação) ou Supabase
      const saved = localStorage.getItem('produtos_estoque')
      const todosProdutos = saved ? JSON.parse(saved) : []
      
      const filtrados = todosProdutos.filter((p: any) => 
        p.nome.toLowerCase().includes(termo.toLowerCase())
      ).slice(0, 10)
      
      setProdutos(filtrados)
      setShowDropdown(true)
      setSelectedIndex(-1)
    } catch (error) {
      console.error('Erro ao buscar produtos:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  // Debounce da busca
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }
    
    debounceTimer.current = setTimeout(() => {
      buscarProdutos(searchTerm)
    }, 300)
    
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }
    }
  }, [searchTerm, buscarProdutos])

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
          inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Navegação por teclado
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || produtos.length === 0) return
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => (prev + 1) % produtos.length)
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => (prev - 1 + produtos.length) % produtos.length)
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && produtos[selectedIndex]) {
          onSelectProduct(produtos[selectedIndex])
          setSearchTerm('')
          setShowDropdown(false)
        }
        break
      case 'Escape':
        setShowDropdown(false)
        break
    }
  }

  const handleCadastroRapido = () => {
    if (searchTerm.trim()) {
      onCadastroRapido(searchTerm.trim())
      setSearchTerm('')
      setShowDropdown(false)
    }
  }

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => searchTerm.length >= 2 && setShowDropdown(true)}
          placeholder="Buscar produto pelo nome..."
          className="w-full pl-10 pr-4 py-3 border-2 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 animate-spin" />
        )}
      </div>

      {/* Dropdown de resultados */}
      {showDropdown && produtos.length > 0 && (
        <div 
          ref={dropdownRef}
          className="absolute z-50 left-0 right-0 mt-1 bg-white border rounded-xl shadow-lg max-h-80 overflow-auto"
        >
          {produtos.map((produto, idx) => (
            <button
              key={produto.id}
              onClick={() => {
                onSelectProduct(produto)
                setSearchTerm('')
                setShowDropdown(false)
              }}
              className={`w-full p-3 text-left hover:bg-gray-50 flex items-center gap-3 border-b last:border-b-0 transition ${
                idx === selectedIndex ? 'bg-blue-50' : ''
              }`}
            >
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                {produto.foto ? (
                  <img src={produto.foto} alt={produto.nome} className="w-10 h-10 object-cover rounded" />
                ) : (
                  <Package className="w-6 h-6 text-gray-400" />
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">{produto.nome}</p>
                <div className="flex gap-3 text-xs text-gray-500">
                  {produto.preco ? (
                    <span className="text-green-600 font-semibold">R$ {produto.preco.toFixed(2)}</span>
                  ) : (
                    <span className="text-yellow-600">Preço não definido</span>
                  )}
                  <span>Estoque: {produto.estoque}</span>
                </div>
              </div>
              {produto.status === 'pendente_validacao' && (
                <div className="text-xs text-yellow-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Pendente
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Botão para cadastro rápido */}
      {searchTerm.length >= 2 && produtos.length === 0 && !loading && (
        <div className="mt-2 p-3 bg-yellow-50 rounded-xl border border-yellow-200">
          <p className="text-sm text-yellow-800 mb-2">
            Produto "{searchTerm}" não encontrado
          </p>
          <button
            onClick={handleCadastroRapido}
            className="w-full py-2 bg-yellow-500 text-white rounded-lg text-sm font-semibold flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Cadastrar novo produto
          </button>
        </div>
      )}
    </div>
  )
}