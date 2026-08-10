// components/financeiro/ModalTransacao.tsx
// ?? DESIGN - Modal de criação/edição de transação

"use client";

import { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import { Transacao } from '@/services/financeiroService';
import { categoriasPadrao, formasPagamento, opcoesRecorrencia } from '@/utils/financeiroUtils';

interface ModalTransacaoProps {
  isOpen: boolean;
  editingId: string | null;
  initialData?: Partial<Transacao>;
  categorias: string[];
  onSave: (data: any) => void;
  onClose: () => void;
  onAddCategoria: () => void;
}

export default function ModalTransacao({
  isOpen,
  editingId,
  initialData,
  categorias,
  onSave,
  onClose,
  onAddCategoria,
}: ModalTransacaoProps) {
  const [formData, setFormData] = useState({
    descricao: '',
    valor: 0,
    tipo: 'receita' as 'receita' | 'despesa',
    categoria: '',
    data: new Date().toISOString().split('T')[0],
    forma_pagamento: 'PIX',
    status: 'pago',
    recorrencia: 'nenhuma',
    recorrencia_quantidade: 1,
    observacoes: ''
  });

  useEffect(() => {
    if (initialData && isOpen) {
      setFormData({
        descricao: initialData.descricao || '',
        valor: initialData.valor || 0,
        tipo: initialData.tipo || 'receita',
        categoria: initialData.categoria || '',
        data: initialData.data || new Date().toISOString().split('T')[0],
        forma_pagamento: initialData.forma_pagamento || 'PIX',
        status: initialData.status || 'pago',
        recorrencia: initialData.recorrencia || 'nenhuma',
        recorrencia_quantidade: initialData.recorrencia_quantidade || 1,
        observacoes: initialData.observacoes || ''
      });
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // ? LOG: Ver o que está sendo enviado
    console.log('📤 Modal: Enviando dados:', formData);
    
    onSave(formData);
  };

  if (!isOpen) return null;

  const getQuantidadeLabel = (recorrencia: string) => {
    switch (recorrencia) {
      case 'diária': return 'dias';
      case 'semanal': return 'semanas';
      case 'quinzenal': return 'quinzenas';
      case 'mensal': return 'meses';
      case 'anual': return 'anos';
      default: return '';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl max-w-md w-full border border-gray-700 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white">
              {editingId ? '✏️ Editar Transação' : '💰 Nova Transação'}
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white transition">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Descrição */}
            <div>
              <label className="block text-sm text-gray-400 mb-1">Descrição *</label>
              <input
                type="text"
                required
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                placeholder="Ex: Venda - Feijoada"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-green-500 focus:outline-none"
              />
            </div>

            {/* Valor e Tipo */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Valor (R$) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.valor}
                  onChange={(e) => setFormData({ ...formData, valor: parseFloat(e.target.value) || 0 })}
                  placeholder="0,00"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-green-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Tipo *</label>
                <select
                  required
                  value={formData.tipo}
                  onChange={(e) => setFormData({ ...formData, tipo: e.target.value as 'receita' | 'despesa' })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-green-500 focus:outline-none"
                >
                  <option value="receita">Receita</option>
                  <option value="despesa">Despesa</option>
                </select>
              </div>
            </div>

            {/* Categoria */}
            <div>
              <label className="block text-sm text-gray-400 mb-1">Categoria</label>
              <div className="flex gap-2">
                <select
                  value={formData.categoria}
                  onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                  className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-green-500 focus:outline-none"
                >
                  <option value="">Selecione...</option>
                  {categorias.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={onAddCategoria}
                  className="px-3 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition text-sm whitespace-nowrap"
                  title="Nova Categoria"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Data e Pagamento */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Data</label>
                <input
                  type="date"
                  value={formData.data}
                  onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-green-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Pagamento</label>
                <select
                  value={formData.forma_pagamento}
                  onChange={(e) => setFormData({ ...formData, forma_pagamento: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-green-500 focus:outline-none"
                >
                  {formasPagamento.map((fp) => (
                    <option key={fp} value={fp}>{fp}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Recorrência e Quantidade */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">🔄 Recorrência</label>
                <select
                  value={formData.recorrencia}
                  onChange={(e) => setFormData({ ...formData, recorrencia: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-green-500 focus:outline-none"
                >
                  {opcoesRecorrencia.map((op) => (
                    <option key={op.value} value={op.value}>{op.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Quantidade
                  <span className="text-xs text-gray-500 ml-1">
                    ({getQuantidadeLabel(formData.recorrencia)})
                  </span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="999"
                  value={formData.recorrencia_quantidade || ''}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    recorrencia_quantidade: parseInt(e.target.value) || 1 
                  })}
                  placeholder={`Ex: 12 ${getQuantidadeLabel(formData.recorrencia)}`}
                  disabled={formData.recorrencia === 'nenhuma'}
                  className={`w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-green-500 focus:outline-none ${
                    formData.recorrencia === 'nenhuma' ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                />
                {formData.recorrencia !== 'nenhuma' && (
                  <p className="text-xs text-gray-500 mt-1">
                    ?? Ex: 12 = {formData.recorrencia === 'mensal' ? '12 meses' : 
                                    formData.recorrencia === 'semanal' ? '12 semanas' :
                                    formData.recorrencia === 'diária' ? '12 dias' :
                                    formData.recorrencia === 'anual' ? '12 anos' : 
                                    '12 vezes'}
                  </p>
                )}
              </div>
            </div>

            {/* Observações */}
            <div>
              <label className="block text-sm text-gray-400 mb-1">Observações</label>
              <textarea
                value={formData.observacoes}
                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                rows={2}
                placeholder="Observações adicionais..."
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-green-500 focus:outline-none"
              />
            </div>

            {/* Botões */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition"
              >
                {editingId ? 'Atualizar' : 'Salvar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

