// components/cozinha/PratoForm.tsx

"use client";

import { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Save, 
  Plus, 
  Trash2, 
  Calculator,
  Image as ImageIcon,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { PratoFormData, IngredienteReceita, IMAGENS_PLACEHOLDER } from '@/types/cozinha';

interface PratoFormProps {
  formData: PratoFormData;
  ingredientesDisponiveis: any[];
  loading: boolean;
  salvando: boolean;
  error: string | null;
  margem: number;
  custoTotal: number;
  onAtualizarCampo: <K extends keyof PratoFormData>(campo: K, valor: PratoFormData[K]) => void;
  onAdicionarIngrediente: (ingrediente: IngredienteReceita) => void;
  onRemoverIngrediente: (index: number) => void;
  onAtualizarQuantidade: (index: number, quantidade: number) => void;
  onSalvar: () => void;
  isEdit?: boolean;
}

export function PratoForm({
  formData,
  ingredientesDisponiveis,
  loading,
  salvando,
  error,
  margem,
  custoTotal,
  onAtualizarCampo,
  onAdicionarIngrediente,
  onRemoverIngrediente,
  onAtualizarQuantidade,
  onSalvar,
  isEdit = false
}: PratoFormProps) {
  const [selectedIngrediente, setSelectedIngrediente] = useState('');
  const [selectedQuantidade, setSelectedQuantidade] = useState(0);
  const [selectedUnidade, setSelectedUnidade] = useState('g');
  const [showImageHelp, setShowImageHelp] = useState(false);

  const placeholderImage = IMAGENS_PLACEHOLDER[formData.categoria] || IMAGENS_PLACEHOLDER.default;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-gray-900">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-400 mt-4">Carregando prato...</p>
        </div>
      </div>
    );
  }

  const handleAdicionarIngrediente = () => {
    if (!selectedIngrediente) return;
    
    const ingredienteEncontrado = ingredientesDisponiveis.find(
      (i) => i.id === selectedIngrediente
    );
    
    if (!ingredienteEncontrado) return;
    
    onAdicionarIngrediente({
      ingrediente_nome: ingredienteEncontrado.nome,
      ingrediente_id: selectedIngrediente,
      quantidade: selectedQuantidade || 0,
      unidade: selectedUnidade,
      custo_total: (selectedQuantidade || 0) * (ingredienteEncontrado.preco_unitario || 0)
    });
    
    setSelectedIngrediente('');
    setSelectedQuantidade(0);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-5xl mx-auto">
        {/* CabeÃ§alho */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <Link href="/admin-master/cozinha-chef/pratos" className="text-sm text-gray-400 hover:text-white flex items-center gap-1 transition">
              <ArrowLeft size={16} /> Voltar
            </Link>
            <h1 className="text-2xl font-bold flex items-center gap-2 mt-1">
              {isEdit ? 'âœï¸ Editar Prato' : 'ðŸ½ï¸ Novo Prato'}
            </h1>
            <p className="text-sm text-gray-400">
              {isEdit ? 'Atualize as informaÃ§Ãµes do prato' : 'Crie um novo prato para o cardÃ¡pio'}
            </p>
          </div>
          <button
            onClick={onSalvar}
            disabled={salvando}
            className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded-lg flex items-center gap-2 transition disabled:opacity-50"
          >
            {salvando ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save size={16} />
            )}
            {salvando ? 'Salvando...' : 'Salvar Prato'}
          </button>
        </div>

        {error && (
          <div className="p-4 mb-6 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 flex items-center gap-2">
            <AlertCircle size={20} />
            {error}
          </div>
        )}

        {/* Resto do formulÃ¡rio - mesmo cÃ³digo anterior */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Dados BÃ¡sicos */}
            <div className="bg-gray-800/30 rounded-xl border border-gray-700 p-6">
              <h2 className="text-lg font-semibold mb-4">ðŸ“‹ Dados do Prato</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Nome do Prato *</label>
                  <input
                    type="text"
                    value={formData.nome}
                    onChange={(e) => onAtualizarCampo('nome', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-orange-500 focus:outline-none"
                    placeholder="Ex: Pizza Margherita"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">DescriÃ§Ã£o</label>
                  <textarea
                    value={formData.descricao}
                    onChange={(e) => onAtualizarCampo('descricao', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-orange-500 focus:outline-none"
                    placeholder="Descreva o prato..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Categoria</label>
                    <select
                      value={formData.categoria}
                      onChange={(e) => onAtualizarCampo('categoria', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-orange-500 focus:outline-none"
                    >
                      <option value="Prato Principal">ðŸ Prato Principal</option>
                      <option value="Sobremesa">ðŸ° Sobremesa</option>
                      <option value="Entrada">ðŸ¥— Entrada</option>
                      <option value="Salgado">ðŸ¥§ Salgado</option>
                      <option value="Bebida">ðŸ¥¤ Bebida</option>
                      <option value="Bolo">ðŸŽ‚ Bolo</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Tempo de Preparo (min)</label>
                    <input
                      type="number"
                      value={formData.tempo_preparo}
                      onChange={(e) => onAtualizarCampo('tempo_preparo', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-orange-500 focus:outline-none"
                      min="1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">PorÃ§Ãµes</label>
                    <input
                      type="number"
                      value={formData.porcoes}
                      onChange={(e) => onAtualizarCampo('porcoes', parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-orange-500 focus:outline-none"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">PreÃ§o (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.preco}
                      onChange={(e) => onAtualizarCampo('preco', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-orange-500 focus:outline-none"
                      min="0"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Ingredientes */}
            <div className="bg-gray-800/30 rounded-xl border border-gray-700 p-6">
              <h2 className="text-lg font-semibold mb-4">ðŸ§ª Ingredientes</h2>

              <div className="flex flex-wrap gap-3 mb-4">
                <select
                  value={selectedIngrediente}
                  onChange={(e) => setSelectedIngrediente(e.target.value)}
                  className="flex-1 min-w-[150px] px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-orange-500 focus:outline-none"
                >
                  <option value="">Selecione um ingrediente...</option>
                  {ingredientesDisponiveis.map((ing) => (
                    <option key={ing.id} value={ing.id}>
                      {ing.nome} (R$ {ing.preco_unitario?.toFixed(2)}/{ing.unidade})
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  value={selectedQuantidade}
                  onChange={(e) => setSelectedQuantidade(parseFloat(e.target.value) || 0)}
                  className="w-24 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-orange-500 focus:outline-none"
                  placeholder="Qtd"
                />
                <select
                  value={selectedUnidade}
                  onChange={(e) => setSelectedUnidade(e.target.value)}
                  className="w-20 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-orange-500 focus:outline-none"
                >
                  <option value="g">g</option>
                  <option value="kg">kg</option>
                  <option value="ml">ml</option>
                  <option value="L">L</option>
                  <option value="un">un</option>
                </select>
                <button
                  onClick={handleAdicionarIngrediente}
                  disabled={!selectedIngrediente}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg flex items-center gap-2 transition disabled:opacity-50"
                >
                  <Plus size={16} /> Adicionar
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-800/50">
                    <tr>
                      <th className="px-3 py-2 text-left text-gray-400">Ingrediente</th>
                      <th className="px-3 py-2 text-left text-gray-400">Quantidade</th>
                      <th className="px-3 py-2 text-left text-gray-400">Unidade</th>
                      <th className="px-3 py-2 text-left text-gray-400">Custo</th>
                      <th className="px-3 py-2 text-center text-gray-400">AÃ§Ã£o</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {formData.ingredientes.map((ing, index) => (
                      <tr key={index}>
                        <td className="px-3 py-2 text-white">{ing.ingrediente_nome}</td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            value={ing.quantidade}
                            onChange={(e) => onAtualizarQuantidade(index, parseFloat(e.target.value) || 0)}
                            className="w-20 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white text-center focus:border-orange-500 focus:outline-none"
                            step="any"
                          />
                        </td>
                        <td className="px-3 py-2 text-gray-400">{ing.unidade}</td>
                        <td className="px-3 py-2 text-orange-400">R$ {ing.custo_total?.toFixed(2) || '0.00'}</td>
                        <td className="px-3 py-2 text-center">
                          <button
                            onClick={() => onRemoverIngrediente(index)}
                            className="p-1 hover:bg-red-500/20 rounded text-red-400 transition"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {formData.ingredientes.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-3 py-4 text-center text-gray-400">
                          Nenhum ingrediente adicionado
                        </td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot className="bg-gray-800/30 border-t border-gray-700">
                    <tr>
                      <td colSpan={3} className="px-3 py-2 font-bold text-white">Custo Total</td>
                      <td className="px-3 py-2 font-bold text-orange-400">R$ {custoTotal.toFixed(2)}</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Status */}
            <div className="bg-gray-800/30 rounded-xl border border-gray-700 p-6">
              <h2 className="text-lg font-semibold mb-4">âš™ï¸ Status</h2>
              <div className="flex flex-wrap gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.ativo}
                    onChange={(e) => onAtualizarCampo('ativo', e.target.checked)}
                    className="w-4 h-4 accent-green-500"
                  />
                  <span>Prato Ativo</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.destaque}
                    onChange={(e) => onAtualizarCampo('destaque', e.target.checked)}
                    className="w-4 h-4 accent-yellow-500"
                  />
                  <span>â­ Destaque</span>
                </label>
              </div>
            </div>
          </div>

          {/* Coluna Lateral */}
          <div className="space-y-6">
            {/* Imagem */}
            <div className="bg-gray-800/30 rounded-xl border border-gray-700 p-6">
              <h2 className="text-lg font-semibold mb-4">ðŸ–¼ï¸ Imagem</h2>
              
              <div className="relative">
                <img
                  src={formData.imagem_url || placeholderImage}
                  alt={formData.nome || 'Prato'}
                  className="w-full h-48 object-cover rounded-lg border border-gray-700"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = placeholderImage;
                  }}
                />
                <button
                  onClick={() => setShowImageHelp(!showImageHelp)}
                  className="absolute top-2 right-2 p-2 bg-gray-900/80 rounded-lg hover:bg-gray-800 transition"
                >
                  <ImageIcon size={16} className="text-gray-400" />
                </button>
              </div>

              {showImageHelp && (
                <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <p className="text-xs text-blue-400">
                    ðŸ’¡ URL da imagem (deixe em branco para usar placeholder automÃ¡tico)
                  </p>
                  <input
                    type="text"
                    value={formData.imagem_url || ''}
                    onChange={(e) => onAtualizarCampo('imagem_url', e.target.value)}
                    className="mt-2 w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none"
                    placeholder="https://... (opcional)"
                  />
                </div>
              )}

              <p className="text-xs text-gray-500 mt-3">
                Imagens placeholder fornecidas pelo Unsplash
              </p>
            </div>

            {/* Resumo Financeiro */}
            <div className="bg-gray-800/30 rounded-xl border border-gray-700 p-6">
              <h2 className="text-lg font-semibold mb-4">ðŸ’° Resumo</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Custo Total</span>
                  <span className="text-red-400 font-bold">R$ {custoTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">PreÃ§o de Venda</span>
                  <span className="text-blue-400 font-bold">R$ {formData.preco.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Lucro</span>
                  <span className={`font-bold ${margem >= 30 ? 'text-green-400' : 'text-red-400'}`}>
                    R$ {(formData.preco - custoTotal).toFixed(2)}
                  </span>
                </div>
                <div className={`p-3 rounded-lg text-center border ${
                  margem >= 50 ? 'border-green-500/30 bg-green-500/10' :
                  margem >= 30 ? 'border-yellow-500/30 bg-yellow-500/10' :
                  'border-red-500/30 bg-red-500/10'
                }`}>
                  <p className="text-sm text-gray-400">Margem</p>
                  <p className={`text-2xl font-bold ${
                    margem >= 50 ? 'text-green-400' :
                    margem >= 30 ? 'text-yellow-400' :
                    'text-red-400'
                  }`}>
                    {margem.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/20 rounded-lg border border-gray-700 p-4">
              <h3 className="text-sm font-semibold text-gray-400 mb-2">ðŸ’¡ Dicas</h3>
              <ul className="text-xs text-gray-500 space-y-1">
                <li>â€¢ Preencha todos os campos obrigatÃ³rios (*)</li>
                <li>â€¢ Adicione ingredientes para calcular o custo</li>
                <li>â€¢ A margem ideal Ã© acima de 30%</li>
                <li>â€¢ Pratos inativos nÃ£o aparecem no catÃ¡logo</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PratoForm;



