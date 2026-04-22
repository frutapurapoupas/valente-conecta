'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Briefcase, Building2, ChevronLeft, ArrowRight, CheckCircle } from 'lucide-react'

export default function ProfissionalCatalogoPage() {
  const [tipoSelecionado, setTipoSelecionado] = useState<string | null>(null)
  const [cadastroCompleto, setCadastroCompleto] = useState(false)

  // Verificar se já tem cadastro
  useEffect(() => {
    const savedTipo = localStorage.getItem('profissional_tipo')
    if (savedTipo) {
      setTipoSelecionado(savedTipo)
      const savedDados = localStorage.getItem(`profissional_dados_${savedTipo}`)
      if (savedDados) {
        setCadastroCompleto(true)
      }
    }
  }, [])

  const tipos = [
    {
      id: 'empresa',
      nome: 'Escritório / Empresa',
      descricao: 'Consultórios, clínicas, escritórios, lojas com CNPJ',
      detalhe: 'Será exibido: Nome Fantasia + CNPJ',
      icon: Building2,
      cor: 'from-blue-500 to-cyan-500',
      href: '/profissional/catalogo/cadastro?tipo=empresa'
    },
    {
      id: 'profissional',
      nome: 'Profissional Liberal',
      descricao: 'Autônomos, freelancers, prestadores de serviço (CPF)',
      detalhe: 'Será exibido: Seu nome completo',
      icon: Briefcase,
      cor: 'from-purple-500 to-pink-500',
      href: '/profissional/catalogo/cadastro?tipo=profissional'
    }
  ]

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-24">
      <header className="sticky top-0 z-40 bg-zinc-900/95 backdrop-blur border-b border-zinc-800 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link href="/" className="p-2 bg-zinc-800 rounded-xl">
            <ChevronLeft className="w-5 h-5 text-zinc-400" />
          </Link>
          <h1 className="text-lg font-black text-white">Área do Profissional</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-6">
        <div className="text-center py-8">
          <h2 className="text-2xl font-black text-white mb-2">Como você quer aparecer?</h2>
          <p className="text-zinc-500 text-sm">Escolha o perfil que melhor descreve seu negócio</p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {tipos.map((tipo) => {
            const Icon = tipo.icon
            return (
              <Link
                key={tipo.id}
                href={tipo.href}
                className={`block bg-gradient-to-r ${tipo.cor} rounded-2xl p-6 hover:scale-105 transition-all`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-black text-white">{tipo.nome}</h3>
                    <p className="text-white/80 text-sm">{tipo.descricao}</p>
                    <p className="text-white/60 text-xs mt-1 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> {tipo.detalhe}
                    </p>
                  </div>
                  <ArrowRight className="w-6 h-6 text-white/60" />
                </div>
              </Link>
            )
          })}
        </div>

        {cadastroCompleto && tipoSelecionado && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-center">
            <p className="text-sm text-zinc-500">Você já possui cadastro como <span className="text-yellow-400">{tipoSelecionado === 'empresa' ? 'Escritório/Empresa' : 'Profissional Liberal'}</span></p>
            <Link href={`/profissional/catalogo/dashboard?tipo=${tipoSelecionado}`} className="text-yellow-400 text-sm hover:underline">
              Ir para meu catálogo →
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}