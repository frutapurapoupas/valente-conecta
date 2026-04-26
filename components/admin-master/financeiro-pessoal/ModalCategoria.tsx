// components/admin-master/financeiro-pessoal/ModalCategoria.tsx
'use client';

import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Edit2 } from 'lucide-react';

interface Categoria {
  id: string;
  nome: string;
  tipo: 'receita' | 'despesa';
  icone: string;
  cor: string;
}

interface ModalCategoriaProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (categoria: Omit<Categoria, 'id'>) => void;
  onDelete?: (id: string) => void;
  categoria?: Categoria | null;
  categoriasExistentes?: Categoria[];
}

const cores = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#10b981',
  '#14b8a6', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7',
  '#d946ef', '#ec4899', '#f43f5e', '#78716c', '#64748b', '#475569',
];

const icones = [
  'Home', 'Utensils', 'Car', 'ShoppingBag', 'DollarSign', 'Briefcase',
  'Heart', 'Book', 'Smartphone', 'Coffee', 'Film', 'Music',
  'Gift', 'Plane', 'GraduationCap', 'Stethoscope', 'ShoppingCart',
];

export function ModalCategoria({ isOpen, onClose, onSave, onDelete, categoria, categoriasExistentes = [] }: ModalCategoriaProps) {
  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState<'receita' | 'despesa'>('despesa');
  const [icone, setIcone] = useState('ShoppingBag');
  const [cor, setCor] = useState('#3b82f6');
  const [erro, setErro] = useState('');

  useEffect(() => {
    if (categoria) {
      setNome(categoria.nome);
      setTipo(categoria.tipo);
      setIcone(categoria.icone);
      setCor(categoria.cor);
    } else {
      setNome('');
      setTipo('despesa');
      setIcone('ShoppingBag');
      setCor('#3b82f6');
    }
    setErro('');
  }, [categoria, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) {
      setErro('Digite o nome da categoria');
      return;
    }
    const nomeExistente = categoriasExistentes.find(c => c.nome.toLowerCase() === nome.toLowerCase() && c.id !== categoria?.id);
    if (nomeExistente) {
      setErro('Já existe uma categoria com este nome');
      return;
    }
    onSave({ nome: nome.trim(), tipo, icone, cor });
    onClose();
  };

  const handleDelete = () => {
    if (categoria && window.confirm(`Excluir a categoria "${categoria.nome}"?`)) {
      onDelete?.(categoria.id);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl w-full max-w-md mx-4">
        <div className="flex justify-between items-center p-4 border-b border-zinc-800">
          <h2 className="text-xl font-semibold text-white">{categoria ? 'Editar Categoria' : 'Nova Categoria'}</h2>
          <button onClick={onClose} className="p-1 hover:bg-zinc-800 rounded-lg text-zinc-400">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {erro && <div className="bg-red-900/50 text-red-400 p-3 rounded-xl text-sm border border-red-800">{erro}</div>}

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Nome</label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-zinc-400"
              placeholder="Ex: Alimentação, Salário..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Tipo</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setTipo('despesa')}
                className={`flex-1 py-2 rounded-xl font-medium transition-colors ${
                  tipo === 'despesa' ? 'bg-red-600 text-white' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                }`}
              >
                💸 Despesa
              </button>
              <button
                type="button"
                onClick={() => setTipo('receita')}
                className={`flex-1 py-2 rounded-xl font-medium transition-colors ${
                  tipo === 'receita' ? 'bg-emerald-600 text-white' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                }`}
              >
                💰 Receita
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Ícone</label>
            <div className="grid grid-cols-8 gap-2 max-h-32 overflow-y-auto p-2 border border-zinc-700 rounded-xl bg-zinc-800">
              {icones.map(ic => (
                <button
                  key={ic}
                  type="button"
                  onClick={() => setIcone(ic)}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg transition-all ${
                    icone === ic ? 'bg-blue-600 text-white ring-2 ring-blue-400' : 'bg-zinc-700 hover:bg-zinc-600'
                  }`}
                >
                  {ic === 'Home' && '🏠'}
                  {ic === 'Utensils' && '🍽️'}
                  {ic === 'Car' && '🚗'}
                  {ic === 'ShoppingBag' && '🛍️'}
                  {ic === 'DollarSign' && '💰'}
                  {ic === 'Briefcase' && '💼'}
                  {ic === 'Heart' && '❤️'}
                  {ic === 'Book' && '📚'}
                  {ic === 'Smartphone' && '📱'}
                  {ic === 'Coffee' && '☕'}
                  {ic === 'Film' && '🎬'}
                  {ic === 'Music' && '🎵'}
                  {ic === 'Gift' && '🎁'}
                  {ic === 'Plane' && '✈️'}
                  {ic === 'GraduationCap' && '🎓'}
                  {ic === 'Stethoscope' && '🩺'}
                  {ic === 'ShoppingCart' && '🛒'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Cor</label>
            <div className="grid grid-cols-8 gap-2">
              {cores.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCor(c)}
                  className={`w-8 h-8 rounded-full transition-all ${
                    cor === c ? 'ring-2 ring-offset-2 ring-offset-zinc-900 ring-zinc-400 scale-110' : ''
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            {categoria && onDelete && (
              <button
                type="button"
                onClick={handleDelete}
                className="flex items-center gap-2 px-4 py-2 bg-red-900/50 text-red-400 rounded-xl hover:bg-red-900 transition-colors border border-red-800"
              >
                <Trash2 size={18} /> Excluir
              </button>
            )}
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 rounded-xl font-medium hover:bg-blue-700 transition-colors"
            >
              {categoria ? 'Salvar Alterações' : 'Criar Categoria'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}