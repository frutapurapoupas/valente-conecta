// components/admin-master/financeiro-pessoal/ModalCartao.tsx
'use client';

import { useState, useEffect } from 'react';
import { X, Trash2, CreditCard } from 'lucide-react';

interface Cartao {
  id: string;
  nome: string;
  limite: number;
  diaFechamento: number;
  diaVencimento: number;
  cor: string;
}

interface ModalCartaoProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (cartao: Omit<Cartao, 'id'>) => void;
  onDelete?: (id: string) => void;
  cartao?: Cartao | null;
}

const cores = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#78716c'];

export function ModalCartao({ isOpen, onClose, onSave, onDelete, cartao }: ModalCartaoProps) {
  const [nome, setNome] = useState('');
  const [limite, setLimite] = useState('');
  const [diaFechamento, setDiaFechamento] = useState(10);
  const [diaVencimento, setDiaVencimento] = useState(20);
  const [cor, setCor] = useState('#3b82f6');

  useEffect(() => {
    if (cartao) {
      setNome(cartao.nome);
      setLimite(cartao.limite.toString());
      setDiaFechamento(cartao.diaFechamento);
      setDiaVencimento(cartao.diaVencimento);
      setCor(cartao.cor);
    } else {
      setNome('');
      setLimite('');
      setDiaFechamento(10);
      setDiaVencimento(20);
      setCor('#3b82f6');
    }
  }, [cartao, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !limite) return;
    onSave({
      nome: nome.trim(),
      limite: parseFloat(limite),
      diaFechamento,
      diaVencimento,
      cor,
    });
    onClose();
  };

  const handleDelete = () => {
    if (cartao && window.confirm(`Excluir o cartão "${cartao.nome}"?`)) {
      onDelete?.(cartao.id);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl w-full max-w-md mx-4">
        <div className="flex justify-between items-center p-4 border-b border-zinc-800">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <CreditCard size={20} /> {cartao ? 'Editar Cartão' : 'Novo Cartão'}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-zinc-800 rounded-lg text-zinc-400">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Nome do Cartão</label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-zinc-400"
              placeholder="Ex: Nubank, Itaú, Santander..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Limite Total</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">R$</span>
              <input
                type="number"
                step="0.01"
                value={limite}
                onChange={(e) => setLimite(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl pl-10 pr-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-zinc-400"
                placeholder="0,00"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">Dia Fechamento</label>
              <select
                value={diaFechamento}
                onChange={(e) => setDiaFechamento(parseInt(e.target.value))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white"
              >
                {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">Dia Vencimento</label>
              <select
                value={diaVencimento}
                onChange={(e) => setDiaVencimento(parseInt(e.target.value))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white"
              >
                {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Cor</label>
            <div className="flex gap-2">
              {cores.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCor(c)}
                  className={`w-10 h-10 rounded-full transition-all ${
                    cor === c ? 'ring-2 ring-offset-2 ring-offset-zinc-900 ring-zinc-400 scale-110' : ''
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            {cartao && onDelete && (
              <button
                type="button"
                onClick={handleDelete}
                className="flex items-center gap-2 px-4 py-2 bg-red-900/50 text-red-400 rounded-xl hover:bg-red-900 border border-red-800"
              >
                <Trash2 size={18} /> Excluir
              </button>
            )}
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 rounded-xl font-medium hover:bg-blue-700"
            >
              {cartao ? 'Salvar' : 'Adicionar Cartão'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}