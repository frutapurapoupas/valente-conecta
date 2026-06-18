'use client';

import { X } from 'lucide-react';
import { textosIngredientes, categoriasList, unidadesList } from '@/constants/ingredientesConstants';

interface Ingredient {
  id: string;
  name: string;
  category: string;
  unit: string;
  stock: number;
  minStock: number;
  currentPrice: number;
}

interface ModalIngredienteProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  editingIngredient: Ingredient | null;
  formData: {
    name: string;
    category: string;
    unit: string;
    stock: number;
    minStock: number;
    currentPrice: number;
  };
  setFormData: React.Dispatch<React.SetStateAction<{
    name: string;
    category: string;
    unit: string;
    stock: number;
    minStock: number;
    currentPrice: number;
  }>>;
}

export default function ModalIngrediente({
  isOpen,
  onClose,
  onSubmit,
  editingIngredient,
  formData,
  setFormData
}: ModalIngredienteProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-conteudo">
          <div className="modal-header">
            <h2 className="modal-titulo">
              {editingIngredient ? textosIngredientes.botoes.editar : textosIngredientes.botoes.novo}
            </h2>
            <button onClick={onClose} className="modal-fechar">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={onSubmit} className="form-group">
            <div>
              <label className="form-label">{textosIngredientes.labels.nome} *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="form-input"
                placeholder={textosIngredientes.placeholders.nome}
              />
            </div>

            <div className="form-row-2">
              <div>
                <label className="form-label">{textosIngredientes.labels.categoria}</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="form-input"
                >
                  {categoriasList.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label">{textosIngredientes.labels.unidade}</label>
                <select
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="form-input"
                >
                  {unidadesList.map(u => (
                    <option key={u.value} value={u.value}>{u.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row-2">
              <div>
                <label className="form-label">{textosIngredientes.labels.estoque}</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: parseFloat(e.target.value) || 0 })}
                  className="form-input"
                />
                <p className="form-ajuda">{textosIngredientes.ajudas.estoque}</p>
              </div>
              <div>
                <label className="form-label">{textosIngredientes.labels.estoqueMinimo}</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.minStock}
                  onChange={(e) => setFormData({ ...formData, minStock: parseFloat(e.target.value) || 0 })}
                  className="form-input"
                />
                <p className="form-ajuda">{textosIngredientes.ajudas.estoqueMinimo}</p>
              </div>
            </div>

            <div>
              <label className="form-label">{textosIngredientes.labels.preco} *</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={formData.currentPrice}
                onChange={(e) => setFormData({ ...formData, currentPrice: parseFloat(e.target.value) || 0 })}
                className="form-input"
              />
              <p className="form-ajuda">{textosIngredientes.ajudas.preco}</p>
            </div>

            <div className="form-botoes">
              <button type="button" onClick={onClose} className="btn-cancelar">
                {textosIngredientes.botoes.cancelar}
              </button>
              <button type="submit" className="btn-salvar">
                {editingIngredient ? textosIngredientes.botoes.atualizar : textosIngredientes.botoes.criar}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}