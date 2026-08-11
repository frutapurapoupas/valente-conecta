"use client";

// Caminho: C:\valente_conecta\components\catalogo\ItemCard.tsx
//
// Card da "vitrine comparativa" da busca inteligente — usado tanto na busca
// geral quanto nas paginas publicas de cada modulo. Ver
// VALENTE_CONECTA_MODULO_MARKETPLACE_MONETIZACAO.md, secao 4.

import { MapPin, Flame, Trophy, Image as ImageIcon } from "lucide-react";
import type { ResultadoVitrine } from "@/lib/catalogo/marketplaceTypes";

interface ItemCardProps {
  item: ResultadoVitrine;
  onClick?: () => void;
}

function formatarPreco(preco: number | null) {
  if (preco === null) return "Sob consulta";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(preco);
}

function formatarDistancia(km: number | null) {
  if (km === null) return null;
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

export function ItemCard({ item, onClick }: ItemCardProps) {
  const capa = item.midia?.[0];
  const distancia = formatarDistancia(item.distancia_km);

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow cursor-pointer flex flex-col"
    >
      <div className="h-40 bg-gray-100 relative">
        {capa ? (
          capa.tipo === "video" ? (
            <video src={capa.url} className="w-full h-full object-cover" muted />
          ) : (
            <img src={capa.thumb_url || capa.url} alt={item.titulo} className="w-full h-full object-cover" />
          )
        ) : (
          <div className="flex items-center justify-center h-full text-gray-300">
            <ImageIcon className="w-10 h-10" />
          </div>
        )}

        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {item.menor_preco_categoria && (
            <span className="flex items-center gap-1 bg-emerald-600 text-white text-[11px] px-2 py-0.5 rounded-full font-medium">
              <Trophy className="w-3 h-3" /> Menor preço
            </span>
          )}
          {item.interesses_recentes >= 3 && (
            <span className="flex items-center gap-1 bg-orange-500 text-white text-[11px] px-2 py-0.5 rounded-full font-medium">
              <Flame className="w-3 h-3" /> Alta demanda
            </span>
          )}
        </div>
      </div>

      <div className="p-3 flex-1 flex flex-col">
        <span className="text-[11px] text-gray-500 uppercase tracking-wide">{item.categoria}</span>
        <h3 className="font-semibold text-sm line-clamp-2 mt-0.5">{item.titulo}</h3>
        <p className="text-blue-600 font-bold mt-1">{formatarPreco(item.preco)}</p>
        {distancia && (
          <span className="flex items-center gap-1 text-xs text-gray-500 mt-auto pt-2">
            <MapPin className="w-3.5 h-3.5" /> {distancia}
          </span>
        )}
      </div>
    </div>
  );
}
