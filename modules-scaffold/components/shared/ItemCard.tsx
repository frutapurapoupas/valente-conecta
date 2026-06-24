"use client";
import React from 'react';
import { Item } from '@/modules-scaffold/types/modules';
import { Phone, ShoppingCart } from 'lucide-react';

export default function ItemCard({
  item,
  onSelect,
  actionLabel = 'Ver Detalhes',
}: {
  item: Item;
  onSelect?: () => void;
  actionLabel?: string;
}) {
  return (
    <div className="rounded-2xl p-4 bg-slate-900 border border-white/10 hover:border-cyan-500/30 transition">
      {item.imagem && (
        <img src={item.imagem} alt={item.nome} className="w-full h-40 object-cover rounded-lg mb-3" />
      )}
      
      <h3 className="text-white font-bold text-lg line-clamp-2">{item.nome}</h3>
      
      {item.descricao && (
        <p className="text-gray-300 text-sm line-clamp-2 mt-1">{item.descricao}</p>
      )}

      {item.categoria && (
        <span className="inline-block mt-2 px-2 py-1 text-xs rounded-lg bg-cyan-500/20 text-cyan-300">
          {item.categoria}
        </span>
      )}

      <div className="mt-4 space-y-2">
        {item.preco !== undefined && (
          <p className="text-emerald-400 font-bold text-lg">R$ {item.preco.toFixed(2)}</p>
        )}
        
        {item.telefone && (
          <div className="flex items-center gap-2 text-gray-300 text-sm">
            <Phone className="h-4 w-4" />
            {item.telefone}
          </div>
        )}
      </div>

      {onSelect && (
        <button
          onClick={onSelect}
          className="w-full mt-4 py-2 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 font-semibold flex items-center justify-center gap-2 transition"
        >
          <ShoppingCart className="h-4 w-4" />
          {actionLabel}
        </button>
      )}
    </div>
  );
}
