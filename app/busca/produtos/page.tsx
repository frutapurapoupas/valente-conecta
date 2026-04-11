'use client'
import React from 'react';
import { Search, Package, TrendingDown, ShoppingBag } from 'lucide-react';
import { useBuscaProdutosPage } from '@/hooks/useBuscaProdutosPage'

export default function BuscaGeografica() {
  const { query, setQuery, resultados } = useBuscaProdutosPage()

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-5 font-sans pb-20">
      <h1 className="text-3xl font-black italic uppercase mb-5">
        Busca em <span className="text-yellow-400">Valente</span>
      </h1>

      <div className="relative mb-5">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 w-5 h-5" />
        <input
          type="text"
          placeholder="O que você procura?"
          className="w-full bg-zinc-900 border border-zinc-800 p-4 pl-12 rounded-2xl text-base font-medium outline-none focus:border-yellow-400/50 transition-all placeholder:text-zinc-600"
          onChange={e => setQuery(e.target.value)}
        />
      </div>

      {query.trim().length >= 2 && resultados.length === 0 && (
        <p className="text-zinc-500 font-bold uppercase text-sm text-center py-10">
          Nenhum resultado encontrado
        </p>
      )}

      {query.trim().length < 2 && (
        <p className="text-zinc-600 text-sm text-center py-10">
          Digite pelo menos 2 caracteres para buscar
        </p>
      )}

      <div className="space-y-3">
        {resultados.map(r => (
          <div
            key={r.id}
            className={`bg-zinc-900 rounded-2xl p-4 border ${
              r.emPromocao ? 'border-red-500/30' : 'border-zinc-800'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <p className="font-bold text-white">{r.nome}</p>
                  {r.emPromocao && (
                    <span className="text-[10px] font-black uppercase bg-red-500/15 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <TrendingDown className="w-3 h-3" /> Promoção
                    </span>
                  )}
                  {r.tipo === 'estoque' && (
                    <span className="text-[10px] font-black uppercase bg-zinc-800 text-zinc-400 border border-zinc-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Package className="w-3 h-3" /> Apenas no estoque
                    </span>
                  )}
                </div>
                {r.fornecedor && (
                  <p className="text-xs text-zinc-500">{r.fornecedor}</p>
                )}
                {r.quantidade != null && (
                  <p className="text-xs text-zinc-600 mt-0.5">{r.quantidade} un disponíveis</p>
                )}
              </div>

              <div className="text-right flex-shrink-0">
                {r.emPromocao && r.precoAnterior != null && (
                  <p className="text-xs text-zinc-500 line-through">
                    R$ {r.precoAnterior.toFixed(2)}
                  </p>
                )}
                <p className={`font-black text-lg ${r.emPromocao ? 'text-red-400' : 'text-yellow-400'}`}>
                  R$ {r.preco.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
