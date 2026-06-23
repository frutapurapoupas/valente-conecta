// components/financeiro/ModalCategoria.tsx
// 🎨 DESIGN - Modal de nova categoria

import { X } from 'lucide-react';
import { useState } from 'react';

interface ModalCategoriaProps {
  isOpen: boolean;
  categorias: string[];
  onAdd: (nome: string) => void;
  onClose: () => void;
}

export default function ModalCategoria({
  isOpen,
  categorias,
  onAdd,
  onClose,
}: ModalCategoriaProps) {
  const [novaCategoria, setNovaCategoria] = useState('');

  const handleAdd = () => {
    if (novaCategoria.trim() && !categorias.includes(novaCategoria.trim())) {
      onAdd(novaCategoria.trim());
      setNovaCategoria('');
      onClose();
    } else if (categorias.includes(novaCategoria.trim())) {
      alert('⚠️ Esta categoria já existe!');
    } else {
      alert('❌ Digite um nome para a categoria');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl max-w-sm w-full border border-gray-700">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white">📂 Nova Categoria</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white transition">
              <X size={20} />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Nome da Categoria</label>
              <input
                type="text"
                value={novaCategoria}
                onChange={(e) => setNovaCategoria(e.target.value)}
                placeholder="Ex: Marketing, Transporte, etc."
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-green-500 focus:outline-none"
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleAdd}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition"
              >
                Adicionar
              </button>
            </div>

            <div className="pt-3 border-t border-gray-700">
              <p className="text-xs text-gray-400">Categorias existentes:</p>
              <div className="flex flex-wrap gap-1 mt-2">
                {categorias.map((cat) => (
                  <span key={cat} className="text-xs bg-gray-700 px-2 py-1 rounded-full text-gray-300">
                    {cat}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
