'use client'

import { useState, useEffect } from 'react'
import { Search, Mic, MicOff, X } from 'lucide-react'
import { useVoiceSearch } from '@/hooks/useVoiceSearch'
import { useRouter } from 'next/navigation'

interface SmartSearchBarProps {
  placeholder?: string
  onSearch?: (term: string) => void
}

export function SmartSearchBar({ placeholder = "O que você busca em Valente?", onSearch }: SmartSearchBarProps) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  
  const handleSearchComplete = (transcript: string, metadata: any) => {
    setSearchTerm(transcript)
    
    if (onSearch) {
      onSearch(transcript)
    } else {
      router.push(`/explorar?q=${encodeURIComponent(transcript)}`)
    }
  }
  
  const { isListening, transcript, toggleListening, hasRecognitionSupport } = useVoiceSearch(handleSearchComplete)
  
  useEffect(() => {
    if (transcript) {
      setSearchTerm(transcript)
    }
  }, [transcript])
  
  const handleTextSearch = () => {
    if (searchTerm.trim()) {
      fetch('/api/search/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          term: searchTerm.trim(),
          timestamp: new Date().toISOString(),
          city: 'Valente-BA',
          priority: 'LOCAL_FIRST',
          source: 'text',
          location: 'Valente-BA'
        })
      }).catch(err => console.error('Erro ao registrar busca:', err))
      
      if (onSearch) {
        onSearch(searchTerm.trim())
      } else {
        router.push(`/explorar?q=${encodeURIComponent(searchTerm.trim())}`)
      }
    }
  }
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTextSearch()
    }
  }
  
  const clearSearch = () => {
    setSearchTerm('')
  }

  return (
    <div className="relative w-full">
      <div className="relative flex items-center bg-gray-100 rounded-2xl min-h-[56px] overflow-hidden shadow-inner">
        <div className="flex-none pl-4 text-blue-500">
          <Search className="w-5 h-5" />
        </div>
        
        <input 
          type="text" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder} 
          className="flex-1 bg-transparent border-none outline-none text-gray-700 text-base font-medium px-3 py-3 placeholder:text-gray-400"
        />
        
        {searchTerm && (
          <button 
            onClick={clearSearch}
            className="flex-none text-gray-400 hover:text-gray-600 transition px-1"
            title="Limpar busca"
          >
            <X className="w-5 h-5" />
          </button>
        )}
        
        <button 
          type="button" 
          onClick={toggleListening} 
          className={`
            flex-none pr-4 flex items-center justify-center transition-all min-w-[50px]
            ${isListening ? 'text-red-500' : 'text-blue-500'}
          `}
          title={hasRecognitionSupport ? (isListening ? "Parar gravação" : "Busca por voz") : "Navegador não suporta busca por voz"}
          disabled={!hasRecognitionSupport}
        >
          {isListening ? <MicOff className="w-5 h-5 animate-pulse" /> : <Mic className="w-5 h-5" />}
        </button>
      </div>
      
      {isListening && (
        <div className="absolute -bottom-8 left-0 right-0 text-center">
          <span className="text-xs text-red-400 animate-pulse bg-red-500/10 px-3 py-1 rounded-full">
            🎤 Gravando: "{transcript || 'Fale algo...'}"
          </span>
        </div>
      )}
    </div>
  )
}