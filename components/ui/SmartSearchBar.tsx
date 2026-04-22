'use client'

import { Search, Mic, MapPin, X, Sparkles, Clock, TrendingUp } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

interface SmartSearchBarProps {
  placeholder?: string
}

export default function SmartSearchBar({ placeholder = "Buscar produtos, lojas ou serviços..." }: SmartSearchBarProps) {
  const [searchText, setSearchText] = useState('')
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [buscasRecentes, setBuscasRecentes] = useState<string[]>([])
  const searchRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Carregar buscas recentes do localStorage
  useEffect(() => {
    const recentes = localStorage.getItem('buscas_recentes')
    if (recentes) {
      setBuscasRecentes(JSON.parse(recentes))
    }
  }, [])

  // Salvar busca recente
  const salvarBuscaRecente = (termo: string) => {
    const recentes = [termo, ...buscasRecentes.filter(b => b !== termo)].slice(0, 5)
    setBuscasRecentes(recentes)
    localStorage.setItem('buscas_recentes', JSON.stringify(recentes))
  }

  // Buscar sugestões da API unificada
  const buscarSugestoes = async (termo: string) => {
    if (termo.length < 2) {
      setSuggestions([])
      return
    }
    
    setIsLoading(true)
    try {
      const response = await fetch(`/api/busca?q=${encodeURIComponent(termo)}`)
      const data = await response.json()
      
      const sugestoes = data.suggestions?.map((sug: string) => ({
        id: sug,
        text: sug,
        type: 'produto'
      })) || []
      
      // Adicionar produtos encontrados como sugestões
      const produtosSugestao = data.results?.slice(0, 5).map((r: any) => ({
        id: r.id,
        text: `${r.nome} - ${r.loja}`,
        type: 'produto',
        value: r.nome
      })) || []
      
      setSuggestions([...produtosSugestao, ...sugestoes].slice(0, 8))
    } catch (error) {
      console.error('Erro ao buscar sugestões:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchText.length >= 2) {
        buscarSugestoes(searchText)
        setShowSuggestions(true)
      } else {
        setSuggestions([])
        setShowSuggestions(false)
      }
    }, 300)
    
    return () => clearTimeout(delayDebounce)
  }, [searchText])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearch = async (query: string) => {
    if (!query.trim()) return
    
    salvarBuscaRecente(query)
    setShowSuggestions(false)
    setSearchText('')
    
    // Redirecionar para a página de busca com resultados
    router.push(`/busca?q=${encodeURIComponent(query)}`)
  }

  const handleVoiceSearch = () => {
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
    if (!SpeechRecognition) {
      alert('Seu navegador não suporta busca por voz')
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = 'pt-BR'
    recognition.continuous = false
    recognition.interimResults = false

    recognition.onstart = () => setIsListening(true)
    recognition.onend = () => setIsListening(false)
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      setSearchText(transcript)
      handleSearch(transcript)
    }
    recognition.onerror = () => setIsListening(false)
    recognition.start()
  }

  return (
    <div className="relative" ref={searchRef}>
      <div className="flex items-center bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchText}
            onChange={(e) => {
              setSearchText(e.target.value)
              setShowSuggestions(true)
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch(searchText)}
            placeholder={placeholder}
            className="w-full px-4 py-3 pl-10 pr-12 bg-transparent text-white placeholder-white/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-yellow-500/50"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-4 h-4" />
          
          {searchText && (
            <button
              onClick={() => setSearchText('')}
              className="absolute right-12 top-1/2 transform -translate-y-1/2 p-1 rounded-full text-white/50 hover:text-white"
            >
              <X className="w-3 h-3" />
            </button>
          )}
          
          <button
            onClick={handleVoiceSearch}
            className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full transition-all ${
              isListening ? 'text-red-400 animate-pulse' : 'text-white/50 hover:text-white'
            }`}
          >
            <Mic className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Sugestões */}
      {showSuggestions && (suggestions.length > 0 || buscasRecentes.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-50 max-h-96 overflow-y-auto">
          
          {/* Buscas recentes */}
          {buscasRecentes.length > 0 && (
            <div className="p-2 border-b border-zinc-800">
              <p className="text-xs text-zinc-500 px-3 py-1 flex items-center gap-1">
                <Clock className="w-3 h-3" /> Buscas recentes
              </p>
              {buscasRecentes.map((busca, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSearch(busca)}
                  className="w-full text-left px-3 py-2 hover:bg-zinc-800 rounded-xl transition-colors flex items-center gap-2"
                >
                  <Search className="w-4 h-4 text-zinc-500" />
                  <span className="text-white text-sm">{busca}</span>
                </button>
              ))}
            </div>
          )}
          
          {/* Sugestões de produtos */}
          {suggestions.length > 0 && (
            <div className="p-2">
              <p className="text-xs text-zinc-500 px-3 py-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-yellow-400" /> Sugestões
              </p>
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion.id}
                  onClick={() => handleSearch(suggestion.value || suggestion.text)}
                  className="w-full text-left px-3 py-2 hover:bg-zinc-800 rounded-xl transition-colors flex items-center gap-2"
                >
                  {suggestion.type === 'location' ? (
                    <MapPin className="w-4 h-4 text-yellow-400" />
                  ) : (
                    <PackageIcon className="w-4 h-4 text-blue-400" />
                  )}
                  <div className="flex-1">
                    <p className="text-white text-sm">{suggestion.text}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* Indicador de carregamento */}
      {isLoading && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-2xl p-4 text-center">
          <div className="flex items-center justify-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-500"></div>
            <span className="text-sm text-zinc-400">Buscando...</span>
          </div>
        </div>
      )}
    </div>
  )
}

// Import necessário
import { Package as PackageIcon } from 'lucide-react'