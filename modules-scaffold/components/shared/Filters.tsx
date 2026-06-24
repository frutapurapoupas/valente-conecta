"use client";
import React from 'react';
import { Search, Filter } from 'lucide-react';

export default function Filters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  category,
  onCategoryChange,
  categories = [],
}: {
  search: string;
  onSearchChange: (value: string) => void;
  status?: string;
  onStatusChange?: (value: string) => void;
  category?: string;
  onCategoryChange?: (value: string) => void;
  categories?: string[];
}) {
  return (
    <div className="space-y-4 p-4 rounded-3xl bg-slate-900 border border-white/10 mb-6">
      <div className="flex items-center gap-2 text-gray-400 text-sm">
        <Filter className="h-4 w-4" />
        <span>Filtros</span>
      </div>

      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
          <input
            type="text"
            placeholder="Buscar..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-white/10 text-white placeholder-gray-500"
          />
        </div>

        {onStatusChange && (
          <select
            value={status || ''}
            onChange={(e) => onStatusChange(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-white/10 text-white"
          >
            <option value="">Todos os status</option>
            <option value="publicado">Publicado</option>
            <option value="pendente">Pendente</option>
          </select>
        )}

        {onCategoryChange && categories.length > 0 && (
          <select
            value={category || ''}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-white/10 text-white"
          >
            <option value="">Todas as categorias</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
}
