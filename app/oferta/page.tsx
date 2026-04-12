'use client'

import Link from 'next/link'
import { ArrowLeft, MapPin, Store, TrendingDown, Eye, Clock, Navigation, TrendingUp } from 'lucide-react'
import { useOfertaPage, formatarData } from '@/hooks/useOfertaPage'

export default function OfertaPage() {
  const { ofertas, ofertasFiltradas, filtro, setFiltro, abrirMapa } = useOfertaPage()

  return (
    <div className="min-h-screen bg-zinc-950 pb-20">
      {/* Header */}
      <header className="bg-zinc-900 border-b border-zinc-800 sticky top-0 z-20">
        <div className="flex items-center gap-3 px-4 py-3">
          <Link href="/" className="p-2 hover:bg-zinc-800 rounded-lg text-white transition">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-orange-400" />
            <span className="font-bold text-lg text-white">Ofertas do Dia</span>
          </div>
          <div className="flex-1"></div>
          <div className="text-xs bg-orange-500/10 border border-orange-500/20 text-orange-300 px-2 py-1 rounded-full">
            {ofertas.length} ofertas com desconto
          </div>
        </div>
      </header>

      {/* Banner explicativo */}
      <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 mx-4 mt-4 rounded-xl">
        <p className="text-xs text-emerald-400 text-center flex items-center justify-center gap-2">
          <TrendingDown className="w-4 h-4" />
          Mostrando apenas produtos com preço REDUZIDO em relação ao dia anterior
        </p>
      </div>

      {/* Filtros */}
      <div className="bg-zinc-900 border border-zinc-800 p-3 sticky top-[57px] z-10 mt-2 mx-4 rounded-xl">
        <div className="flex gap-2 overflow-x-auto">
          {[
            { id: 'todas', label: '📅 Mais Recentes' },
            { id: 'maioresDescontos', label: '🎯 Maiores Descontos' },
            { id: 'maisProximas', label: '📍 Mais Próximas' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFiltro(f.id as any)}
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition font-medium ${
                filtro === f.id
                  ? 'bg-orange-500 text-white'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de Ofertas */}
      <main className="p-4 max-w-7xl mx-auto">
        {ofertasFiltradas.length === 0 ? (
          <div className="text-center py-12">
            <TrendingUp className="w-16 h-16 mx-auto text-zinc-600 mb-4" />
            <p className="text-zinc-400">Nenhuma oferta no momento</p>
            <p className="text-sm text-zinc-500">Volte mais tarde para ver as novidades!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {ofertasFiltradas.map((oferta) => (
              <div key={oferta.id} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-700 transition">
                <div className="absolute relative">
                  <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-lg text-xs font-bold z-10">
                    -{oferta.percentualDesconto}%
                  </div>
                </div>
                <div className="bg-zinc-800/50 p-3 border-b border-zinc-700">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Store className="w-4 h-4 text-orange-400" />
                        <span className="font-semibold text-white">{oferta.lojaNome}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-zinc-400">
                        <MapPin className="w-3 h-3" />
                        <span>{oferta.lojaEndereco}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      {oferta.distancia !== 'N/A' && (
                        <div className="text-xs text-zinc-400 flex items-center gap-1">
                          <Navigation className="w-3 h-3" />
                          {oferta.distancia}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg text-white mb-3">{oferta.produtoNome}</h3>
                  <div className="flex items-baseline gap-3 mb-3 flex-wrap">
                    <span className="text-zinc-500 line-through text-sm">R$ {oferta.precoAntigo.toFixed(2)}</span>
                    <span className="text-2xl font-bold text-emerald-400">R$ {oferta.precoNovo.toFixed(2)}</span>
                    <span className="text-sm font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-full">
                      Economize R$ {oferta.economia.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-emerald-400 mb-3">
                    <TrendingDown className="w-3 h-3" />
                    <span>Preço reduzido! Antes R$ {oferta.precoAntigo.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-zinc-500 mb-3">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{formatarData(oferta.dataAlteracao)}</span>
                    </div>
                    <div className="bg-zinc-800 border border-zinc-700 px-2 py-1 rounded-full text-zinc-300">
                      {oferta.categoria}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => abrirMapa(oferta.lojaEndereco)}
                      className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition"
                    >
                      <MapPin className="w-4 h-4" />
                      Como chegar
                    </button>
                    <button className="flex-1 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition">
                      <Eye className="w-4 h-4" />
                      Ver produto
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="mt-6 text-center text-xs text-zinc-500">
          <p>🔄 Ofertas atualizadas em tempo real quando empresas REDUZEM seus preços</p>
          <p className="mt-1">💡 Produtos com mesmo valor do dia anterior NÃO aparecem aqui</p>
          <p className="mt-1">📍 Ative sua localização para ver ofertas próximas a você</p>
        </div>
      </main>
    </div>
  )
}
