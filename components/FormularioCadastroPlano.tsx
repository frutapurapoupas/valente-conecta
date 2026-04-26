'use client'

import { useState } from 'react'
import { CampoCadastro } from '@/types/planos'

interface FormularioCadastroPlanoProps {
  campos: CampoCadastro[]
  onSubmit: (dados: Record<string, string>) => void
  onCancel: () => void
  isGratis: boolean
}

export function FormularioCadastroPlano({ campos, onSubmit, onCancel, isGratis }: FormularioCadastroPlanoProps) {
  const [dados, setDados] = useState<Record<string, string>>({})

  const aplicarMascara = (valor: string, mascara: string): string => {
    let resultado = ''
    let indexValor = 0

    for (let i = 0; i < mascara.length && indexValor < valor.length; i++) {
      if (mascara[i] === '#') {
        resultado += valor[indexValor]
        indexValor++
      } else {
        resultado += mascara[i]
      }
    }

    return resultado
  }

  const handleChange = (campo: CampoCadastro, valor: string) => {
    let valorFormatado = valor

    if (campo.mascara) {
      valorFormatado = aplicarMascara(valor, campo.mascara)
    }

    setDados(prev => ({ ...prev, [campo.nome]: valorFormatado }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validação de campos obrigatórios
    const camposObrigatorios = campos.filter(c => c.obrigatorio)
    const camposFaltando = camposObrigatorios.filter(c => !dados[c.nome] || dados[c.nome].trim() === '')

    if (camposFaltando.length > 0) {
      alert(`Por favor, preencha todos os campos obrigatórios: ${camposFaltando.map(c => c.label).join(', ')}`)
      return
    }

    // Validação específica para WhatsApp
    if (dados.whatsapp) {
      const whatsappLimpo = dados.whatsapp.replace(/\D/g, '')
      if (whatsappLimpo.length < 10 || whatsappLimpo.length > 11) {
        alert('Por favor, insira um WhatsApp válido com DDD (ex: (75) 99999-9999)')
        return
      }
    }

    onSubmit(dados)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {campos.map((campo) => (
        <div key={campo.nome}>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            {campo.label}
            {campo.obrigatorio && <span className="text-red-400 ml-1">*</span>}
          </label>
          <input
            type={campo.tipo}
            placeholder={campo.placeholder}
            value={dados[campo.nome] || ''}
            onChange={(e) => handleChange(campo, e.target.value)}
            className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-4 py-3 text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          />
        </div>
      ))}

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          className={`flex-1 py-3 rounded-lg font-medium transition ${
            isGratis
              ? 'bg-green-500 text-zinc-900 hover:bg-green-400'
              : 'bg-yellow-500 text-zinc-900 hover:bg-yellow-400'
          }`}
        >
          {isGratis ? 'Cadastrar' : 'Confirmar Assinatura'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-zinc-600 text-white py-3 rounded-lg font-medium hover:bg-zinc-500 transition"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}
