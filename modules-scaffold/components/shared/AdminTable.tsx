"use client";
import React from 'react';
import { Item } from '@/modules-scaffold/types/modules';
import { Edit3, Trash2, Eye, EyeOff } from 'lucide-react';

export default function AdminTable({
  items,
  onEdit,
  onDelete,
  onToggle,
}: {
  items: Item[];
  onEdit: (item: Item) => void;
  onDelete: (id: string) => void;
  onToggle: (item: Item) => void;
}) {
  return (
    <div className="rounded-3xl overflow-x-auto bg-slate-900 border border-white/10">
      <table className="min-w-full border-separate border-spacing-y-0">
        <thead className="text-xs uppercase tracking-widest text-gray-400">
          <tr className="border-b border-white/10">
            <th className="px-6 py-4 text-left">Nome</th>
            <th className="px-6 py-4">Categoria</th>
            <th className="px-6 py-4">PreÃ§o</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4">AÃ§Ãµes</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-t border-white/5 hover:bg-slate-800/50 transition">
              <td className="px-6 py-4 text-white font-medium">{item.nome}</td>
              <td className="px-6 py-4 text-gray-300">{item.categoria}</td>
              <td className="px-6 py-4 text-emerald-300 font-bold">
                {item.preco ? `R$ ${item.preco.toFixed(2)}` : '-'}
              </td>
              <td className="px-6 py-4">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    item.status === 'publicado'
                      ? 'bg-emerald-500/15 text-emerald-300'
                      : 'bg-orange-500/15 text-orange-300'
                  }`}
                >
                  {item.status}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="flex gap-2">
                  <button
                    onClick={() => onToggle(item)}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition text-gray-300"
                    title="Toggle publicaÃ§Ã£o"
                  >
                    {item.status === 'publicado' ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    onClick={() => onEdit(item)}
                    className="p-2 rounded-lg bg-blue-600 hover:bg-blue-500 transition text-white"
                    title="Editar"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onDelete(item.id)}
                    className="p-2 rounded-lg bg-red-600 hover:bg-red-500 transition text-white"
                    title="Excluir"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

