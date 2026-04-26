// components/admin-master/financeiro-pessoal/LinhaLancamento.tsx
'use client';

import { useState } from 'react';
import { Edit2, Trash2, Check, X, AlertCircle } from 'lucide-react';

interface Lancamento {
  id: string;
  descricao: string;
  valor: number;
  data: string;
  categoriaId: string;
  tipo: 'receita' | 'despesa';
  recorrente?: boolean;
  recorrenciaMeses?: number;
}

interface Categoria {
  id: string;
  nome: string;
  tipo: 'receita' | 'despesa';
  icone: string;
  cor: string;
}

interface LinhaLancamentoProps {
  lancamento: Lancamento;
  categorias: Categoria[];
  onUpdate: (id: string, updates: Partial<Lancamento>) => void;
  onDelete: (id: string) => void;
}

export function LinhaLancamento({ lancamento, categorias, onUpdate, onDelete }: LinhaLancamentoProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    descricao: lancamento.descricao,
    valor: lancamento.valor,
    data: lancamento.data,
    categoriaId: lancamento.categoriaId,
  });

  const categoria = categorias.find(c => c.id === lancamento.categoriaId);
  const isRecorrente = lancamento.recorrente;

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
  };

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const handleSave = () => {
    if (!editData.descricao.trim() || editData.valor <= 0) return;
    onUpdate(lancamento.id, {
      descricao: editData.descricao,
      valor: editData.valor,
      data: editData.data,
      categoriaId: editData.categoriaId,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData({
      descricao: lancamento.descricao,
      valor: lancamento.valor,
      data: lancamento.data,
      categoriaId: lancamento.categoriaId,
    });
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 mb-2">
        <div className="grid grid-cols-12 gap-2 items-center">
          <div className="col-span-4">
            <input
              type="text"
              value={editData.descricao}
              onChange={(e) => setEditData(prev => ({ ...prev, descricao: e.target.value }))}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-2 py-1 text-sm text-white placeholder-zinc-400"
              placeholder="Descrição"
              autoFocus
            />
          </div>
          <div className="col-span-2">
            <div className="relative">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-zinc-400">R$</span>
              <input
                type="number"
                step="0.01"
                value={editData.valor}
                onChange={(e) => setEditData(prev => ({ ...prev, valor: parseFloat(e.target.value) || 0 }))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl pl-7 pr-2 py-1 text-sm text-white"
              />
            </div>
          </div>
          <div className="col-span-2">
            <input
              type="date"
              value={editData.data}
              onChange={(e) => setEditData(prev => ({ ...prev, data: e.target.value }))}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-2 py-1 text-sm text-white"
            />
          </div>
          <div className="col-span-2">
            <select
              value={editData.categoriaId}
              onChange={(e) => setEditData(prev => ({ ...prev, categoriaId: e.target.value }))}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-2 py-1 text-sm text-white"
            >
              {categorias.filter(c => c.tipo === lancamento.tipo).map(c => (
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </select>
          </div>
          <div className="col-span-2 flex gap-1 justify-end">
            <button onClick={handleSave} className="p-1 text-emerald-400 hover:bg-zinc-800 rounded">
              <Check size={18} />
            </button>
            <button onClick={handleCancel} className="p-1 text-red-400 hover:bg-zinc-800 rounded">
              <X size={18} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-zinc-900 border border-zinc-800 rounded-xl p-3 mb-2 hover:border-zinc-700 transition-shadow ${lancamento.tipo === 'receita' ? 'border-l-4 border-l-emerald-500' : 'border-l-4 border-l-red-500'}`}>
      <div className="grid grid-cols-12 gap-2 items-center">
        <div className="col-span-4 flex items-center gap-2">
          {isRecorrente && <AlertCircle size={14} className="text-blue-400" title="Lançamento recorrente" />}
          <span className="font-medium text-sm truncate text-white">{lancamento.descricao}</span>
        </div>
        <div className="col-span-2 text-right">
          <span className={`text-sm font-semibold ${lancamento.tipo === 'receita' ? 'text-emerald-400' : 'text-red-400'}`}>
            {lancamento.tipo === 'receita' ? '+' : '-'} {formatarMoeda(lancamento.valor)}
          </span>
        </div>
        <div className="col-span-2 text-sm text-zinc-400">{formatarData(lancamento.data)}</div>
        <div className="col-span-2">
          {categoria && (
            <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: `${categoria.cor}20`, color: categoria.cor }}>
              {categoria.nome}
            </span>
          )}
          {isRecorrente && lancamento.recorrenciaMeses && (
            <span className="text-xs text-zinc-500 ml-2">a cada {lancamento.recorrenciaMeses} meses</span>
          )}
        </div>
        <div className="col-span-2 flex gap-1 justify-end">
          <button onClick={() => setIsEditing(true)} className="p-1 text-blue-400 hover:bg-zinc-800 rounded">
            <Edit2 size={16} />
          </button>
          <button onClick={() => onDelete(lancamento.id)} className="p-1 text-red-400 hover:bg-zinc-800 rounded">
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}