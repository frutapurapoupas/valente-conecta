'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, X, Plus, Clock, DollarSign, Sparkles } from 'lucide-react'
import { buscarServicos, ServicoItem, categorias } from '@/lib/servicosCategorias'

interface ServicoAutocompleteProps {
  onSelect: (servico: ServicoItem | string) => void
  placeholder?: string
  allowCustom?: boolean
  value?: string
}

export default function ServicoAutocomplete({ 
  onSelect, 
  placeholder = "Digite o nome do serviço...", 
  allowCustom = true,
  value = ''
}: ServicoAutocompleteProps) {
  const [termo, setTermo] = useState(value)
  const [resultados, setResultados] = useState<ServicoItem[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [showCustomInput, setShowCustomInput] = useState(false)
  const [customServico, setCustomServico] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (termo.length >= 2) {
      const resultadosBusca = buscarServicos(termo)
      setResultados(resultadosBusca)
      setShowDropdown(true)
    } else {
      setResultados([])
      setShowDropdown(false)
    }
  }, [termo])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (servico: ServicoItem) => {
    setTermo(servico.nome)
    setShowDropdown(false)
    onSelect(servico)
  }

  const handleCustomSubmit = () => {
    if (customServico.trim()) {
      onSelect(customServico.trim())
      setTermo(customServico.trim())
      setShowCustomInput(false)
      setCustomServico('')
      setShowDropdown(false)
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500 w-4 h-4" />
        <input
          ref={inputRef}
          type="text"
          value={termo}
          onChange={(e) => setTermo(e.target.value)}
          onFocus={() => termo.length >= 2 && setShowDropdown(true)}
          placeholder={placeholder}
          className="w-full bg-zinc-800 border border-zinc-700 rounded-xl pl-9 pr-8 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-500"
        />
        {termo && (
          <button onClick={() => setTermo('')} className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <X className="w-4 h-4 text-zinc-500" />
          </button>
        )}
      </div>

      {/* Dropdown de resultados */}
      {showDropdown && resultados.length > 0 && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-zinc-800 border border-zinc-700 rounded-xl shadow-2xl max-h-80 overflow-y-auto">
          <div className="p-2 border-b border-zinc-700">
            <p className="text-xs text-zinc-500">🎯 Serviços disponíveis</p>
          </div>
          {resultados.map((servico) => (
            <button
              key={servico.id}
              onClick={() => handleSelect(servico)}
              className="w-full text-left px-4 py-3 hover:bg-zinc-700 transition-colors flex items-center justify-between"
            >
              <div>
                <p className="text-white text-sm font-medium">{servico.nome}</p>
                <p className="text-xs text-zinc-500 mt-0.5">
                  <Clock className="w-3 h-3 inline mr-1" /> {servico.duracaoMedia} min
                  {servico.precoMedio && (
                    <span className="ml-2"><DollarSign className="w-3 h-3 inline mr-1" /> R$ {servico.precoMedio}</span>
                  )}
                </p>
              </div>
              <Sparkles className="w-4 h-4 text-yellow-400" />
            </button>
          ))}
          
          {allowCustom && (
            <button
              onClick={() => setShowCustomInput(true)}
              className="w-full text-left px-4 py-3 hover:bg-zinc-700 transition-colors border-t border-zinc-700 flex items-center gap-2 text-yellow-400"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm">Adicionar "{termo}" como novo serviço</span>
            </button>
          )}
        </div>
      )}

      {/* Modal para serviço customizado */}
      {showCustomInput && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-lg">Adicionar Serviço</h3>
              <button onClick={() => setShowCustomInput(false)} className="p-1 hover:bg-zinc-800 rounded-lg">
                <X className="w-5 h-5 text-zinc-400" />
              </button>
            </div>
            <p className="text-sm text-zinc-400">
              O serviço <span className="text-yellow-400 font-bold">"{termo}"</span> não está na lista.
              <br />Deseja adicionar como serviço personalizado?
            </p>
            <div>
              <label className="text-xs text-zinc-500 font-bold uppercase mb-1 block">Nome do serviço</label>
              <input
                type="text"
                value={customServico || termo}
                onChange={(e) => setCustomServico(e.target.value)}
                placeholder="Ex: Massagem Relaxante"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500"
              />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowCustomInput(false)} className="flex-1 py-2 bg-zinc-800 text-zinc-400 rounded-xl font-bold">
                Cancelar
              </button>
              <button onClick={handleCustomSubmit} className="flex-1 py-2 bg-yellow-500 text-black rounded-xl font-bold">
                Adicionar Serviço
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}