'use client'

import Link from 'next/link'
import { ArrowLeft, ChevronRight } from 'lucide-react'

const MENUS = [
  {
    id: 'vendas',
    label: 'Vendas',
    descricao: 'Registrar vendas e atender clientes',
    href: '/pdv/venda-busca',
    emoji: '🛒',
    bg: 'from-blue-500 to-indigo-600',
  },
  {
    id: 'estoque',
    label: 'Estoque',
    descricao: 'Gerenciar produtos e catálogo',
    href: '/pdv/estoque',
    emoji: '📦',
    bg: 'from-emerald-500 to-green-600',
  },
  {
    id: 'perfil',
    label: 'Perfil',
    descricao: 'Dados da loja e horários',
    href: '/profissional/catalogo',
    emoji: '🏪',
    bg: 'from-purple-500 to-violet-600',
  },
  {
    id: 'planos',
    label: 'Planos',
    descricao: 'Assinatura e funcionalidades',
    href: '/empresa/planos',
    emoji: '⭐',
    bg: 'from-amber-500 to-orange-500',
  },
]

export default function PDVColaborativoPage() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white sticky top-0 z-20">
        <div className="flex items-center gap-3 px-4 py-4 max-w-lg mx-auto">
          <Link href="/" className="p-2 hover:bg-white/20 rounded-lg transition">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-bold text-xl leading-tight">PDV Colaborativo</h1>
            <p className="text-blue-200 text-xs">Gestão completa da sua loja física</p>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-8 space-y-4">
        {/* Banner informativo */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-blue-100 flex items-center gap-3">
          <span className="text-3xl">🏪</span>
          <div>
            <p className="font-semibold text-sm text-gray-800">Bem-vindo ao seu painel de loja</p>
            <p className="text-xs text-gray-500 mt-0.5">Gerencie vendas, estoque, perfil e plano num só lugar.</p>
          </div>
        </div>

        {/* Cards de navegação — classes estáticas por item para garantir geração pelo Tailwind */}
        <div className="space-y-3">
          {MENUS.map((item) => (
            <Link key={item.id} href={item.href}>
              <div className={`bg-gradient-to-r ${item.bg} rounded-2xl p-5 shadow-md flex items-center justify-between active:scale-95 transition-all`}>
                <div className="flex items-center gap-4">
                  <span className="text-4xl">{item.emoji}</span>
                  <div>
                    <h2 className="text-xl font-black text-white">{item.label}</h2>
                    <p className="text-sm text-white opacity-90">{item.descricao}</p>
                  </div>
                </div>
                <ChevronRight className="w-6 h-6 text-white flex-shrink-0" />
              </div>
            </Link>
          ))}
        </div>

        {/* Dica rápida */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mt-2">
          <p className="text-xs text-amber-800">
            💡 <strong>Dica:</strong> para vender na rua ou em feiras, use o <strong>PDV Móvel</strong> na tela inicial — entrada direta no leitor de produtos.
          </p>
        </div>
      </main>
    </div>
  )
}
