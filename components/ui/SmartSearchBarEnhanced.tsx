'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, Mic, MapPin, Clock, TrendingUp, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useVoiceSearch } from '@/hooks/useVoiceSearch'

interface SearchSuggestion {
  id: string
  text: string
  type: 'recent' | 'popular' | 'location' | 'trending'
  category?: string
  store?: string
  price?: number
  distance?: number
}

interface UserBehavior {
  lastSearches: string[]
  preferredCategories: string[]
  preferredStores: string[]
  searchFrequency: { [key: string]: number }
  locationPermission: boolean
  sessionDuration: number
}

export default function SmartSearchBarEnhanced() {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [isFocused, setIsFocused] = useState(false)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [userBehavior, setUserBehavior] = useState<UserBehavior>({
    lastSearches: [],
    preferredCategories: [],
    preferredStores: [],
    searchFrequency: {},
    locationPermission: false,
    sessionDuration: 0
  })
  
  const router = useRouter()
  const searchRef = useRef<HTMLDivElement>(null)
  const { startListening, isListening, transcript, error, isSupported } = useVoiceSearch({
    onTranscript: (text) => {
      setQuery(text)
      handleSearch(text)
    }
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
          setUserBehavior(prev => ({ ...prev, locationPermission: true }))
        },
        (error) => {
          console.log('Erro de geolocalização:', error)
          setUserBehavior(prev => ({ ...prev, locationPermission: false }))
        }
      )
    }
  }, [])

  // 🧠 Autocomplete inteligente
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
      let locationSuggestions: SearchSuggestion[] = []
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

      // Buscar sugestões recentes
      const recentSearches = userBehavior.lastSearches.slice(-3).map((search, index) => ({
        id: `recent_${index}`,
        text: search,
        type: 'recent'
      }))

      // Buscar tendências
      const trendingResponse = await fetch(`/api/trending-searches?limit=3`)
      const trendingData = await trendingResponse.json()
      const trendingSuggestions = trendingData.trends.map((trend: any, index) => ({
        id: `trending_${index}`,
        text: trend.query,
        type: 'trending',
        category: trend.category
      }))

      const allSuggestions = [
        ...locationSuggestions,
        ...popularData.suggestions,
        ...recentSearches,
        ...trendingSuggestions
      ].slice(0, 8)

      setSuggestions(allSuggestions)
    } catch (error) {
      console.error('Erro ao buscar sugestões:', error)
    }
  }

  // 📊 Análise de comportamento do usuário
  const analyzeUserBehavior = () => {
    // Atualizar duração da sessão
    setUserBehavior(prev => ({ ...prev, sessionDuration: Date.now() - (prev.sessionStartTime || Date.now()) }))

    // Detectar padrões de busca
    const searchPatterns = {
      morningSearches: userBehavior.lastSearches.filter(s => s.includes('café') || s.includes('pão')).length,
      eveningSearches: userBehavior.lastSearches.filter(s => s.includes('jantar') || s.includes('ceia')).length,
      weekendSearches: userBehavior.lastSearches.filter(s => {
        const day = new Date().getDay()
        return day === 0 || day === 6 // Sábado ou Domingo
      }).length
    }

    // Salvar análise
    fetch('/api/user-behavior', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        patterns: searchPatterns,
        currentSession: userBehavior.sessionDuration,
        locationData: {
          enabled: userBehavior.locationPermission,
          coordinates: userLocation
        }
      })
    }).catch(console.error)
  }

  const handleSearch = (searchText: string) => {
    if (!searchText.trim()) return

    // Salvar busca no comportamento do usuário
    setUserBehavior(prev => ({
      ...prev,
      lastSearches: [...prev.lastSearches.slice(-9), searchText],
      searchFrequency: {
        ...prev.searchFrequency,
        [searchText.toLowerCase()]: (prev.searchFrequency[searchText.toLowerCase()] || 0) + 1
      }
    }))

    // Redirecionar com parâmetros de geolocalização
    const params = new URLSearchParams({
      q: searchText,
      ...(userLocation && { lat: userLocation.lat.toString(), lng: userLocation.lng.toString() })
    })

    router.push(`/produtos?${params.toString()}`)
    setShowSuggestions(false)
    setIsFocused(false)
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
    setIsFocused(true)
    if (query.length >= 2) {
      fetchSuggestions(query)
    }
  }

  const handleInputBlur = () => {
    setTimeout(() => {
      if (!searchRef.current?.contains(document.activeElement)) {
        setShowSuggestions(false)
        setIsFocused(false)
      }
    }, 200)
  }

  const getLocationStatus = () => {
    if (!userLocation) {
      return { icon: MapPin, text: 'Localização desativada', color: 'text-gray-500' }
    }
    if (userBehavior.locationPermission) {
      return { icon: MapPin, text: 'Localização ativa', color: 'text-green-500' }
    }
    return { icon: MapPin, text: 'Localização pendente', color: 'text-yellow-500' }
  }

  const getVoiceSearchStatus = () => {
    if (!isSupported) {
      return { icon: Mic, text: 'Voz não suportada', color: 'text-gray-400' }
    }
    if (isListening) {
      return { icon: Mic, text: 'Ouvindo...', color: 'text-red-500 animate-pulse' }
    }
    if (transcript) {
      return { icon: Mic, text: 'Fale agora', color: 'text-blue-500' }
    }
    return { icon: Mic, text: 'Buscar com voz', color: 'text-gray-400 hover:text-gray-600' }
  }

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className="relative">
        <div className="flex items-center bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          {/* 📍 Status de Localização */}
          <div className="absolute left-2 top-1/2 transform -translate-y-1/2">
            {getLocationStatus().icon && (
              <div className={`p-1 rounded-full ${getLocationStatus().color === 'text-green-500' ? 'bg-green-100' : getLocationStatus().color === 'text-yellow-500' ? 'bg-yellow-100' : 'bg-gray-100'}`}>
                {getLocationStatus().icon}
              </div>
            )}
          </div>

          {/* 🔍 Campo de Busca */}
          <div className="relative flex-1" ref={searchRef}>
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

            {/* 🎤 Busca por Voz */}
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
              <button
                onClick={() => {
                  if (isSupported) {
                    startListening()
                  } else {
                    alert('Seu navegador não suporta busca por voz. Tente usar um navegador mais recente.')
                  }
                }}
                className={`p-2 rounded-full transition-all ${getVoiceSearchStatus().color}`}
                title={getVoiceSearchStatus().text}
              >
                {getVoiceSearchStatus().icon}
              </button>
            </div>

            {/* ❌ Limpar Sugestões */}
            {(isFocused || showSuggestions) && (
              <button
                onClick={() => {
                  setSuggestions([])
                  setShowSuggestions(false)
                  setIsFocused(false)
                }}
                className="absolute right-12 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
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
                      <TrendingUp className="w-4 h-4 mr-2" />
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
                          {suggestion.price && (
                            <div className="text-sm text-green-600 dark:text-green-400">R$ {suggestion.price.toFixed(2)}</div>
                          )}
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
                      <Clock className="w-4 h-4 mr-2" />
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
                      <TrendingUp className="w-4 h-4 mr-2" />
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

      {/* 📊 Informações do Comportamento (Debug) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <strong>Localização:</strong> {userLocation ? `${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}` : 'Não obtida'}
            </div>
            <div>
              <strong>Permissão:</strong> {userBehavior.locationPermission ? 'Ativa' : 'Inativa'}
            </div>
            <div>
              <strong>Sessão:</strong> {Math.floor(userBehavior.sessionDuration / 1000)}s
            </div>
            <div>
              <strong>Buscas:</strong> {userBehavior.lastSearches.length}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
