// components/ui/SmartSearchBar.tsx
'use client';

import { useState, useEffect } from 'react';
import { Search, Mic, MicOff } from 'lucide-react';
import { useVoiceSearch } from '@/hooks/useVoiceSearch';

interface SmartSearchBarProps {
  onSearch?: (term: string) => void;
  placeholder?: string;
}

export function SmartSearchBar({ onSearch, placeholder = "O que você busca em Valente?" }: SmartSearchBarProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const { isListening, transcript, startListening, stopListening, hasRecognitionSupport } = useVoiceSearch();

  // Atualiza o campo de busca quando o transcript muda
  useEffect(() => {
    if (transcript) {
      setSearchTerm(transcript);
      // Dispara busca automática após 1 segundo de pausa na fala
      const timer = setTimeout(() => {
        if (transcript.trim()) {
          handleSearch(transcript);
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [transcript]);

  const handleSearch = (term: string) => {
    if (term.trim()) {
      // Registra a busca no Admin Master
      fetch('/api/search/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          term: term.trim(),
          timestamp: new Date().toISOString(),
          location: 'Valente-BA',
          source: isListening ? 'voice' : 'text'
        })
      });
      
      // Dispara callback ou redireciona
      if (onSearch) {
        onSearch(term.trim());
      } else {
        window.location.href = `/explorar?q=${encodeURIComponent(term.trim())}`;
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(searchTerm);
    }
  };

  const toggleVoiceSearch = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <div className="relative w-full max-w-3xl mx-auto">
      {/* Borda externa azul de 6px */}
      <div className="p-[6px] rounded-full bg-blue-500/20">
        {/* Borda interna azul de 3px */}
        <div className="p-[3px] rounded-full bg-blue-500/30">
          <div className="relative flex items-center w-full bg-zinc-900 rounded-full overflow-visible">
            {/* Ícone de Busca (Esquerda) */}
            <div className="absolute left-4 pointer-events-none z-10">
              <Search className="w-5 h-5 text-blue-400" />
            </div>

            {/* Campo de Input */}
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={placeholder}
              className="w-full py-4 pl-12 pr-14 bg-transparent text-white placeholder:text-zinc-500 focus:outline-none text-lg rounded-full"
              style={{ overflow: 'visible' }}
            />

            {/* Botão do Microfone (Direita) - SEMPRE VISÍVEL */}
            <div className="absolute right-3 z-10">
              <button
                onClick={toggleVoiceSearch}
                disabled={!hasRecognitionSupport}
                className={`
                  p-2 rounded-full transition-all duration-200
                  ${isListening 
                    ? 'bg-red-500/20 text-red-400 animate-pulse' 
                    : 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
                  }
                  ${!hasRecognitionSupport && 'opacity-50 cursor-not-allowed'}
                `}
                title={hasRecognitionSupport ? (isListening ? 'Parar gravação' : 'Busca por voz') : 'Navegador não suporta busca por voz'}
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Indicador de Gravação Ativa */}
      {isListening && (
        <div className="absolute -bottom-8 left-0 right-0 text-center">
          <span className="text-xs text-red-400 animate-pulse">
            🎤 Gravando... "{transcript || 'Aguardando comando'}"
          </span>
        </div>
      )}
    </div>
  );
}