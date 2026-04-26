'use client'

import { useState } from 'react'
import Link from 'next/link'
import { User, Car, ChevronLeft, MapPin, Clock, Navigation } from 'lucide-react'

export default function TransportesDeliveryPage() {
  const [userData] = useState({
    nome: 'João Silva',
    telefone: '(75) 9 8888-7777',
    endereco: 'Rua Principal, 123 - Centro, Valente-BA'
  })

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-24">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-zinc-900/95 backdrop-blur border-b border-zinc-800 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link href="/" className="p-2 bg-zinc-800 rounded-xl">
            <ChevronLeft className="w-5 h-5 text-zinc-400" />
          </Link>
          <h1 className="text-lg font-black text-white">Transportes e Delivery</h1>
          <div className="w-10" />
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Card Usuário */}
        <Link
          href="/transportes-delivery/usuario"
          className="block bg-gradient-to-br from-blue-600/20 to-cyan-600/20 border border-blue-500/30 rounded-2xl p-6 hover:bg-blue-600/30 transition-all"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-blue-500/20 p-4 rounded-xl">
              <User className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Sou Passageiro</h2>
              <p className="text-sm text-zinc-400">Solicite uma corrida</p>
            </div>
          </div>
          <div className="space-y-2 text-sm text-zinc-300">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-400" />
              <span>Informe origem e destino</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" />
              <span>Escolha o horário da apanha</span>
            </div>
            <div className="flex items-center gap-2">
              <Navigation className="w-4 h-4 text-blue-400" />
              <span>Motoristas aprovados disponíveis</span>
            </div>
          </div>
        </Link>

        {/* Card Motorista */}
        <Link
          href="/transportes-delivery/motorista"
          className="block bg-gradient-to-br from-emerald-600/20 to-green-600/20 border border-emerald-500/30 rounded-2xl p-6 hover:bg-emerald-600/30 transition-all"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-emerald-500/20 p-4 rounded-xl">
              <Car className="w-8 h-8 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Sou Motorista</h2>
              <p className="text-sm text-zinc-400">Cadastre-se e ganhe dinheiro</p>
            </div>
          </div>
          <div className="space-y-2 text-sm text-zinc-300">
            <p>• Cadastro completo com dados pessoais e veículo</p>
            <p>• Defina seu valor por km</p>
            <p>• Receba pagamentos via PIX</p>
            <p>• Sistema de comissão 3% para a plataforma</p>
          </div>
        </Link>

        {/* Informações */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <h3 className="font-bold text-white mb-3">Como funciona</h3>
          <div className="space-y-3 text-sm text-zinc-400">
            <p><strong className="text-white">Para passageiros:</strong> Após escolher as opções, você verá motoristas disponíveis com foto e valor. O pagamento é feito direto via PIX para o motorista.</p>
            <p><strong className="text-white">Para motoristas:</strong> Após aprovação do cadastro, você receberá solicitações de corrida. Defina seu valor por km e receba pagamentos diretos.</p>
          </div>
        </div>
      </main>
    </div>
  )
}
