"use client";
import React from 'react';
import { Item } from '@/modules-scaffold/types/modules';
import { Save, X } from 'lucide-react';

export default function EditorForm({
  item,
  onChange,
  onSave,
  onCancel,
  title = 'Editar Item',
}: {
  item: Partial<Item>;
  onChange: (patch: Partial<Item>) => void;
  onSave: () => void;
  onCancel?: () => void;
  title?: string;
}) {
  return (
    <div className="rounded-3xl p-6 bg-slate-900 border border-white/10 mb-6">
      <h3 className="text-xl font-bold text-white mb-4">{title}</h3>

      <div className="space-y-4">
        <input
          type="text"
          placeholder="Nome do item"
          value={item.nome || ''}
          onChange={(e) => onChange({ nome: e.target.value })}
          className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-white/10 text-white placeholder-gray-500"
        />

        <textarea
          placeholder="DescriÃ§Ã£o"
          value={item.descricao || ''}
          onChange={(e) => onChange({ descricao: e.target.value })}
          rows={3}
          className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-white/10 text-white placeholder-gray-500"
        />

        <input
          type="number"
          placeholder="PreÃ§o (R$)"
          value={item.preco || ''}
          onChange={(e) => onChange({ preco: parseFloat(e.target.value) || 0 })}
          className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-white/10 text-white placeholder-gray-500"
        />

        <input
          type="tel"
          placeholder="Telefone/WhatsApp"
          value={item.telefone || ''}
          onChange={(e) => onChange({ telefone: e.target.value })}
          className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-white/10 text-white placeholder-gray-500"
        />

        <select
          value={item.status || 'publicado'}
          onChange={(e) => onChange({ status: e.target.value as any })}
          className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-white/10 text-white"
        >
          <option value="publicado">Publicado</option>
          <option value="pendente">Pendente</option>
        </select>

        <div className="flex gap-3 pt-4">
          <button
            onClick={onSave}
            className="flex-1 py-3 rounded-xl bg-emerald-500 text-black font-bold flex items-center justify-center gap-2 hover:bg-emerald-400 transition"
          >
            <Save className="h-4 w-4" /> Salvar
          </button>
          {onCancel && (
            <button
              onClick={onCancel}
              className="flex-1 py-3 rounded-xl bg-white/10 text-white font-bold flex items-center justify-center gap-2 hover:bg-white/20 transition"
            >
              <X className="h-4 w-4" /> Cancelar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

