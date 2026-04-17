'use client'

import { useState, useEffect } from 'react'
import { Search, Mic, MapPin, AlertCircle, Info } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useVoiceSearch } from '@/hooks/useVoiceSearch'

interface SearchSuggestion {
  id: string
  text: string
  type: 'recent' | 'popular' | 'location' | 'trending'
  category?: string
  store?: string
  distance?: number
}

export default function SmartSearchBar() {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [showSuggestions, setShowSuggestions] = useState(false)
  
  const router = useRouter()
  const forceSupported = typeof window !== 'undefined' && 
    ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)
  const { 
    isSupported, 
    isListening, 
    transcript, 
    startListening, 
    error, 
    browserInfo 
  } = useVoiceSearch({
    onResult: (text: string) => {
      setQuery(text)
      handleSearch(text)
    },
    onError: (errorMessage: string) => {
      console.log('Erro na busca por voz:', errorMessage)
    },
    // Ativar microfone automaticamente no mobile
  })

  // 📍 Geolocalização automática
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        (error) => {
          console.log('Erro de geolocalização:', error)
        }
      )
    }
  }, [])

  // 🧠 Buscar sugestões inteligentes
  const fetchSuggestions = async (searchText: string) => {
    if (searchText.length < 2) {
      setSuggestions([])
      return
    }

    try {
      // Buscar sugestões populares
      const popularResponse = await fetch(`/api/search-suggestions?q=${encodeURIComponent(searchText)}&limit=5`)
      const popularData = await popularResponse.json()
      
      // Buscar sugestões baseadas em localização
      let locationSuggestions = []
      if (userLocation) {
        const nearbyResponse = await fetch(`/api/nearby-stores?lat=${userLocation.lat}&lng=${userLocation.lng}&limit=3`)
        const nearbyData = await nearbyResponse.json()
        locationSuggestions = nearbyData.stores.map((store: any) => ({
          id: `loc_${store.id}`,
          text: `${store.name} - ${store.distance.toFixed(1)}km`,
          type: 'location',
          store: store.name,
          distance: store.distance
        }))
      }

      // Combinar todas as sugestões
      const allSuggestions = [
        ...locationSuggestions,
        ...popularData.suggestions,
        ...popularData.trending
      ].slice(0, 8)

      setSuggestions(allSuggestions)
    } catch (error) {
      console.error('Erro ao buscar sugestões:', error)
    }
  }

  const handleSearch = (searchText: string) => {
    if (!searchText.trim()) return

    // Redirecionar com parâmetros de geolocalização
    const params = new URLSearchParams({
      q: searchText,
      ...(userLocation && { lat: userLocation.lat.toString(), lng: userLocation.lng.toString() })
    })

    router.push(`/produtos?${params.toString()}`)
    setShowSuggestions(false)
  }

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.text)
    setSuggestions([])
    handleSearch(suggestion.text)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    
    // Buscar sugestões automaticamente
    if (value.length >= 2) {
      fetchSuggestions(value)
    }
  }

  const handleInputFocus = () => {
    if (query.length >= 2) {
      fetchSuggestions(query)
    }
    setShowSuggestions(true)
  }

  const handleInputBlur = () => {
    setTimeout(() => setShowSuggestions(false), 200)
  }

  // 🎨 Componente de feedback para busca por voz
  const VoiceSearchFeedback = () => {
    if (!forceSupported) {
      return (
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10">
          <div className="relative group">
            <button
              className="p-2 rounded-full text-gray-400"
              title="Busca por texto"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>
        </div>
      )
    }

    return (
      <div className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10">
        <button
          onClick={() => {
            if (isSupported) {
              startListening()
            }
          }}
          className={`p-2 rounded-full transition-all ${
            isListening ? 'bg-red-500 text-white animate-pulse' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
          }`}
          title={isListening ? 'Ouvindo...' : 'Buscar com voz'}
        >
          <Mic className="w-5 h-5" />
        </button>
      </div>
    )
  }

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className="relative">
        <div className="flex items-center bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          {/* 📍 Status de Localização */}
          <div className="absolute left-2 top-1/2 transform -translate-y-1/2">
            {userLocation ? (
              <div className="p-1 rounded-full bg-green-100">
                <MapPin className="w-4 h-4 text-green-500" />
              </div>
            ) : (
              <div className="p-1 rounded-full bg-gray-100">
                <MapPin className="w-4 h-4 text-gray-500" />
              </div>
            )}
          </div>

          {/* 🔍 Campo de Busca */}
          <div className="relative flex-1">
            <input
              type="text"
              value={query}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              placeholder="Buscar produtos, lojas ou categorias..."
              className="w-full px-4 py-3 pl-12 pr-20 text-gray-900 dark:text-white bg-transparent border-0 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoComplete="off"
            />

            {/* 🔍 Ícone de Busca */}
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <Search className="w-5 h-5" />
            </div>

            {/* 🎤 Botão de Busca por Voz */}
            <VoiceSearchFeedback />

            {/* ❌ Limpar Sugestões */}
            {(showSuggestions) && (
              <button
                onClick={() => {
                  setSuggestions([])
                  setShowSuggestions(false)
                }}
                className="absolute right-12 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* 🧠 Sugestões Inteligentes */}
        {suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 max-h-96 overflow-y-auto">
            <div className="p-4">
              <div className="space-y-2">
                {/* 📍 Sugestões por Localização */}
                {suggestions.filter(s => s.type === 'location').length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-2">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span>Próximo a você</span>
                    </div>
                    {suggestions.filter(s => s.type === 'location').map((suggestion) => (
                      <button
                        key={suggestion.id}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="w-full text-left p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center justify-between group"
                      >
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 dark:text-white">{suggestion.text}</div>
                          {suggestion.distance && (
                            <div className="text-sm text-gray-500 dark:text-gray-400">{suggestion.distance}km</div>
                          )}
                        </div>
                        {suggestion.store && (
                          <div className="text-xs text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                            {suggestion.store}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {/* 🔥 Sugestões Populares */}
                {suggestions.filter(s => s.type === 'popular').length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-2">
                      <Search className="w-4 h-4 mr-2" />
                      <span>Populares</span>
                    </div>
                    {suggestions.filter(s => s.type === 'popular').map((suggestion) => (
                      <button
                        key={suggestion.id}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="w-full text-left p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center justify-between group"
                      >
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 dark:text-white">{suggestion.text}</div>
                        </div>
                        {suggestion.category && (
                          <div className="text-xs text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">
                            {suggestion.category}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {/* 🕐 Sugestões Recentes */}
                {suggestions.filter(s => s.type === 'recent').length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-2">
                      <Info className="w-4 h-4 mr-2" />
                      <span>Recentes</span>
                    </div>
                    {suggestions.filter(s => s.type === 'recent').map((suggestion) => (
                      <button
                        key={suggestion.id}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="w-full text-left p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center justify-between group"
                      >
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 dark:text-white">{suggestion.text}</div>
                        </div>
                        <div className="text-xs text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                          Recente
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* 📈 Sugestões em Tendência */}
                {suggestions.filter(s => s.type === 'trending').length > 0 && (
                  <div>
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-2">
                      <Search className="w-4 h-4 mr-2" />
                      <span>Em alta</span>
                    </div>
                    {suggestions.filter(s => s.type === 'trending').map((suggestion) => (
                      <button
                        key={suggestion.id}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="w-full text-left p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center justify-between group"
                      >
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 dark:text-white">{suggestion.text}</div>
                          {suggestion.category && (
                            <div className="text-xs text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900 px-2 py-1 rounded">
                              {suggestion.category}
                            </div>
                          )}
                        </div>
                        <div className="text-xs text-orange-400 dark:text-orange-500 bg-orange-100 dark:bg-orange-900 px-2 py-1 rounded">
                          Trending
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
