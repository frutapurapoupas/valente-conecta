'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Package, ShoppingCart, Settings, Box, Camera, QrCode, CreditCard, Users } from 'lucide-react'

export default function PDVPage() {
  const [modo, setModo] = useState<'menu' | 'estoque' | 'venda'>('menu')

  if (modo === 'estoque') {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white sticky top-0 z-20">
          <div className="flex items-center gap-3 px-4 py-3">
            <button onClick={() => setModo('menu')} className="p-2 hover:bg-white/20 rounded-lg">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <img src="/logo.png" alt="Logo" className="w-8 h-8" />
            <span className="font-bold text-lg">Gestão de Estoque</span>
          </div>
        </header>
        <main className="p-4">
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <Package className="w-16 h-16 mx-auto text-blue-500 mb-4" />
            <h2 className="text-xl font-bold mb-2">Módulo em Desenvolvimento</h2>
            <p className="text-gray-500">Em breve: gestão completa de estoque</p>
            <button 
              onClick={() => setModo('menu')}
              className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg"
            >
              Voltar
            </button>
          </div>
        </main>
      </div>
    )
  }

  if (modo === 'venda') {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-gradient-to-r from-green-600 to-teal-600 text-white sticky top-0 z-20">
          <div className="flex items-center gap-3 px-4 py-3">
            <button onClick={() => setModo('menu')} className="p-2 hover:bg-white/20 rounded-lg">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <img src="/logo.png" alt="Logo" className="w-8 h-8" />
            <span className="font-bold text-lg">PDV - Modo Venda</span>
          </div>
        </header>
        <main className="p-4">
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <ShoppingCart className="w-16 h-16 mx-auto text-green-500 mb-4" />
            <h2 className="text-xl font-bold mb-2">Módulo em Desenvolvimento</h2>
            <p className="text-gray-500">Em breve: sistema completo de vendas</p>
            <button 
              onClick={() => setModo('menu')}
              className="mt-4 px-6 py-2 bg-green-500 text-white rounded-lg"
            >
              Voltar
            </button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white sticky top-0 z-20">
        <div className="flex items-center gap-3 px-4 py-3">
          <Link href="/" className="p-2 hover:bg-white/20 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <img src="/logo.png" alt="Logo" className="w-8 h-8" />
          <span className="font-bold text-lg">PDV Colaborativo</span>
        </div>
      </header>

      <main className="p-4 max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Ponto de Venda</h1>
        
        {/* Cards de opções */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card Estoque */}
          <Link href="/pdv/estoque">
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center hover:shadow-xl transition-all hover:scale-105 cursor-pointer">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-10 h-10 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold mb-2">Estoque</h2>
              <p className="text-gray-500 text-sm">
                Gerencie produtos, edite preços,<br/>
                adicione fotos e controle validade
              </p>
              <div className="mt-4 inline-block px-4 py-2 bg-blue-500 text-white rounded-lg text-sm">
                Acessar Estoque →
              </div>
            </div>
          </Link>

          {/* Card Iniciar Venda */}
          <Link href="/pdv/venda">
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center hover:shadow-xl transition-all hover:scale-105 cursor-pointer">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-xl font-bold mb-2">Iniciar Venda</h2>
              <p className="text-gray-500 text-sm">
                Use a câmera como leitor de código,<br/>
                venda com fiado e muito mais
              </p>
              <div className="mt-4 inline-block px-4 py-2 bg-green-500 text-white rounded-lg text-sm">
                Nova Venda →
              </div>
            </div>
          </Link>
        </div>

        {/* Link para Gestão de Fiado */}
        <div className="mt-6">
          <Link href="/pdv/fiado">
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white p-4 rounded-xl cursor-pointer hover:from-yellow-600 hover:to-orange-600 transition shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-6 h-6" />
                  <div>
                    <p className="font-bold">Gestão de Fiado</p>
                    <p className="text-sm opacity-90">Controle de clientes e pagamentos</p>
                  </div>
                </div>
                <span>→</span>
              </div>
            </div>
          </Link>
        </div>

        {/* Informações adicionais */}
        <div className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <QrCode className="w-8 h-8 text-purple-600" />
            <div>
              <p className="font-semibold">Dica: Modo Espião disponível!</p>
              <p className="text-sm text-gray-600">
                Integre seu PDV atual enviando dados automaticamente para nosso sistema
              </p>
            </div>
          </div>
        </div>

        {/* Estatísticas rápidas */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm text-center">
            <Users className="w-6 h-6 mx-auto text-blue-500 mb-2" />
            <p className="text-2xl font-bold">0</p>
            <p className="text-xs text-gray-500">Clientes fiado ativos</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm text-center">
            <CreditCard className="w-6 h-6 mx-auto text-yellow-500 mb-2" />
            <p className="text-2xl font-bold">R$ 0,00</p>
            <p className="text-xs text-gray-500">Total em débito</p>
          </div>
        </div>
      </main>
    </div>
  )
}