'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, Package, Barcode, Plus, Loader2, ImageIcon } from 'lucide-react'

interface Produto {
  id: string
  nome: string
  ean: string | null
  preco: number | null
  imagem: string | null
  estoque: number
}

interface BuscaProdutoProps {
  onSelectProduct: (produto: Produto) => void
  onCadastroManual: () => void
  onDigitarEAN: () => void
}

export default function BuscaProduto({ onSelectProduct, onCadastroManual, onDigitarEAN }: BuscaProdutoProps) {
  const [buscaTermo, setBuscaTermo] = useState('')
  const [resultados, setResultados] = useState<Produto[]>([])
  const [buscando, setBuscando] = useState(false)
  const [mostrarResultados, setMostrarResultados] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceTimer = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    
    if (buscaTermo.length >= 2) {
      debounceTimer.current = setTimeout(() => {
        buscarProdutos(buscaTermo)
      }, 300)
    } else {
      setResultados([])
      setMostrarResultados(false)
    }
    
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current)
    }
  }, [buscaTermo])

  const buscarProdutos = async (termo: string) => {
    setBuscando(true)
    try {
      const saved = localStorage.getItem('produtos_estoque')
      const todosProdutos = saved ? JSON.parse(saved) : []
      
      const filtrados = todosProdutos
        .filter((p: any) => p.nome.toLowerCase().includes(termo.toLowerCase()))
        .slice(0, 8)
        .map((p: any) => ({
          id: p.id,
          nome: p.nome,
          ean: p.codigo,
          preco: p.preco,
          imagem: p.imagem || null,
          estoque: p.estoque
        }))
      
      setResultados(filtrados)
      setMostrarResultados(true)
    } catch (error) {
      console.error('Erro na busca:', error)
    } finally {
      setBuscando(false)
    }
  }

  const handleSelect = (produto: Produto) => {
    onSelectProduct(produto)
    setBuscaTermo('')
    setMostrarResultados(false)
    if (inputRef.current) inputRef.current.focus()
  }

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={buscaTermo}
          onChange={(e) => setBuscaTermo(e.target.value)}
          placeholder="Digite o nome do produto..."
          className="w-full pl-10 pr-10 py-3 border-2 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
          autoFocus
        />
        {buscando && (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 animate-spin" />
        )}
      </div>

      {/* Lista de resultados */}
      {mostrarResultados && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-white border rounded-xl shadow-lg max-h-80 overflow-auto">
          {resultados.length > 0 ? (
            <>
              {resultados.map((produto) => (
                <button
                  key={produto.id}
                  onClick={() => handleSelect(produto)}
                  className="w-full p-3 text-left hover:bg-gray-50 flex items-center gap-3 border-b last:border-b-0 transition"
                >
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    {produto.imagem ? (
                      <img src={produto.imagem} alt={produto.nome} className="w-10 h-10 object-cover rounded" />
                    ) : (
                      <Package className="w-6 h-6 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{produto.nome}</p>
                    <div className="flex gap-3 text-xs">
                      {produto.preco ? (
                        <span className="text-green-600 font-semibold">R$ {produto.preco.toFixed(2)}</span>
                      ) : (
                        <span className="text-yellow-600">Preço não definido</span>
                      )}
                      {produto.ean && (
                        <span className="text-gray-400 font-mono">EAN: {produto.ean.slice(-6)}</span>
                      )}
                    </div>
                  </div>
                  <span className="text-blue-500 text-sm font-bold">+</span>
                </button>
              ))}
              
              {/* Última opção - Digitar EAN */}
              <button
                onClick={onDigitarEAN}
                className="w-full p-3 text-left hover:bg-gray-50 flex items-center gap-3 border-t border-gray-200 bg-gray-50"
              >
                <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                  <Barcode className="w-6 h-6 text-gray-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">Produto não encontrado?</p>
                  <p className="text-xs text-gray-500">Digitar código de barras (EAN)</p>
                </div>
                <span className="text-blue-500 text-sm">→</span>
              </button>
            </>
          ) : (
            <div className="p-4 text-center">
              <p className="text-gray-500 text-sm">Nenhum produto encontrado</p>
              <button
                onClick={onCadastroManual}
                className="mt-2 text-blue-500 text-sm flex items-center justify-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Cadastrar novo produto
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}