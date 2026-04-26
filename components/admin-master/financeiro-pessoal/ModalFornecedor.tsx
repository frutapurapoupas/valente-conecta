// components/admin-master/financeiro-pessoal/ModalFornecedor.tsx
'use client';

import { useState, useEffect } from 'react';
import { X, Trash2, Save } from 'lucide-react';

interface Fornecedor {
  id: string;
  nome: string;
  telefone?: string;
  email?: string;
}

interface ModalFornecedorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (fornecedor: Omit<Fornecedor, 'id'>) => void;
  onDelete?: (id: string) => void;
  fornecedor?: Fornecedor | null;
}

export function ModalFornecedor({ isOpen, onClose, onSave, onDelete, fornecedor }: ModalFornecedorProps) {
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (fornecedor) {
      setNome(fornecedor.nome);
      setTelefone(fornecedor.telefone || '');
      setEmail(fornecedor.email || '');
    } else {
      setNome('');
      setTelefone('');
      setEmail('');
    }
  }, [fornecedor, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) return;
    onSave({ nome: nome.trim(), telefone: telefone.trim() || undefined, email: email.trim() || undefined });
    onClose();
  };

  const handleDelete = () => {
    if (fornecedor && window.confirm(`Excluir "${fornecedor.nome}"?`)) {
      onDelete?.(fornecedor.id);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl w-full max-w-md mx-4">
        <div className="flex justify-between items-center p-4 border-b border-zinc-800">
          <h2 className="text-xl font-semibold text-white">{fornecedor ? 'Editar Fornecedor' : 'Novo Fornecedor'}</h2>
          <button onClick={onClose} className="p-1 hover:bg-zinc-800 rounded-lg text-zinc-400">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Nome *</label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-zinc-400"
              placeholder="Nome do fornecedor/estabelecimento"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Telefone</label>
            <input
              type="tel"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-zinc-400"
              placeholder="(00) 00000-0000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-zinc-400"
              placeholder="contato@empresa.com"
            />
          </div>

          <div className="flex gap-3 pt-4">
            {fornecedor && onDelete && (
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
              className="flex-1 bg-blue-600 text-white py-2 rounded-xl font-medium hover:bg-blue-700 flex items-center justify-center gap-2"
            >
              <Save size={18} /> Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}