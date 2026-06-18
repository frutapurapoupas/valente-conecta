'use client';

import { useIngredients } from '@/hooks/cozinha/useIngredients';
import { ingredientsDesign as design } from './design.config';
import { useState } from 'react';

export default function IngredientsPage() {
  const { ingredients, loading, create, update, delete: remove } = useIngredients();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredIngredients = ingredients.filter(ing =>
    ing.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name') as string,
      category: formData.get('category') as any,
      unit: formData.get('unit') as string,
      currentPrice: parseFloat(formData.get('currentPrice') as string),
      stock: parseFloat(formData.get('stock') as string),
      minStock: parseFloat(formData.get('minStock') as string),
      supplier: formData.get('supplier') as string || undefined
    };

    if (editing) {
      await update(editing.id, data);
    } else {
      await create(data);
    }
    setShowModal(false);
    setEditing(null);
  };

  if (loading) {
    return (
      <div className={design.classes.container}>
        <div className="text-center py-12">Carregando ingredientes...</div>
      </div>
    );
  }

  return (
    <div className={design.classes.container}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{design.titles.main}</h1>
        <p className="text-gray-600 mt-2">{design.titles.subtitle}</p>
      </div>

      <div className="flex justify-between items-center mb-6">
        <input
          type="text"
          placeholder={design.titles.searchPlaceholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={design.classes.searchInput}
        />
        <button 
          onClick={() => { setEditing(null); setShowModal(true); }} 
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          {design.titles.buttonNew}
        </button>
      </div>

      <div className={design.classes.card}>
        {filteredIngredients.length === 0 ? (
          <div className="text-center py-12 text-gray-500">{design.titles.emptyState}</div>
        ) : (
          // Container com SCROLL HORIZONTAL
          <div className={design.classes.tableContainer}>
            <table className={design.classes.table}>
              <thead className={design.classes.thead}>
                <tr>
                  {design.tableColumns.map(col => {
                    if (col.stickyLeft) {
                      return <th key={col.key} className={design.classes.thNome} style={{ minWidth: col.width }}>{col.label}</th>;
                    }
                    if (col.stickyRight) {
                      return <th key={col.key} className={design.classes.thAcoes} style={{ minWidth: col.width }}>{col.label}</th>;
                    }
                    return <th key={col.key} className={design.classes.th} style={{ minWidth: col.width }}>{col.label}</th>;
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredIngredients.map(ing => (
                  <tr key={ing.id} className="hover:bg-gray-50 transition-colors">
                    {/* Coluna NOME - FIXADA (sticky esquerda) */}
                    <td className={design.classes.tdNome} style={{ minWidth: "200px" }}>
                      {ing.name}
                    </td>
                    
                    {/* Coluna CATEGORIA */}
                    <td className={design.classes.td} style={{ minWidth: "120px" }}>
                      {ing.category === 'alimento' ? 'Alimento' : ing.category === 'tempero' ? 'Tempero' : 'Bebida'}
                    </td>
                    
                    {/* Coluna FORNECEDOR */}
                    <td className={design.classes.td} style={{ minWidth: "150px" }}>
                      {ing.supplier || <span className="text-gray-400">—</span>}
                    </td>
                    
                    {/* Coluna ESTOQUE */}
                    <td className={design.classes.td} style={{ minWidth: "100px" }}>
                      {design.formatNumber(ing.stock)}
                    </td>
                    
                    {/* Coluna UNIDADE */}
                    <td className={design.classes.td} style={{ minWidth: "100px" }}>
                      {ing.unit}
                    </td>
                    
                    {/* Coluna PREÇO UNITÁRIO */}
                    <td className={design.classes.td} style={{ minWidth: "110px" }}>
                      {design.formatCurrency(ing.currentPrice)}
                    </td>
                    
                    {/* Coluna TOTAL */}
                    <td className={`${design.classes.td} font-semibold text-blue-600`} style={{ minWidth: "110px" }}>
                      {design.formatCurrency(ing.totalValue)}
                    </td>
                    
                    {/* Coluna STATUS */}
                    <td className={design.classes.td} style={{ minWidth: "100px" }}>
                      <span className={ing.stock <= ing.minStock ? design.classes.badgeLow : design.classes.badgeNormal}>
                        {ing.stock <= ing.minStock ? '⚠️ Baixo' : '✓ Normal'}
                      </span>
                    </td>
                    
                    {/* Coluna AÇÕES - FIXADA (sticky direita) */}
                    <td className={design.classes.tdAcoes} style={{ minWidth: "120px" }}>
                      <button 
                        onClick={() => { setEditing(ing); setShowModal(true); }} 
                        className="text-blue-600 hover:text-blue-800 mr-3 transition-colors"
                      >
                        {design.titles.edit}
                      </button>
                      <button 
                        onClick={() => remove(ing.id)} 
                        className="text-red-600 hover:text-red-800 transition-colors"
                      >
                        {design.titles.delete}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Novo/Editar Ingrediente */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">{editing ? 'Editar' : 'Novo'} Ingrediente</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">{design.formLabels.name}</label>
                <input 
                  name="name" 
                  defaultValue={editing?.name} 
                  placeholder="Ex: Arroz Branco" 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                  required 
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">{design.formLabels.category}</label>
                <select 
                  name="category" 
                  defaultValue={editing?.category} 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                  required
                >
                  {design.categoryOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">{design.formLabels.unit}</label>
                <select 
                  name="unit" 
                  defaultValue={editing?.unit} 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                  required
                >
                  {design.unitOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">{design.formLabels.currentPrice}</label>
                <input 
                  name="currentPrice" 
                  type="number" 
                  step="0.01" 
                  defaultValue={editing?.currentPrice} 
                  placeholder="0,00" 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                  required 
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">{design.formLabels.stock}</label>
                <input 
                  name="stock" 
                  type="number" 
                  step="0.01" 
                  defaultValue={editing?.stock} 
                  placeholder="0" 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                  required 
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">{design.formLabels.minStock}</label>
                <input 
                  name="minStock" 
                  type="number" 
                  step="0.01" 
                  defaultValue={editing?.minStock} 
                  placeholder="0" 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                  required 
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">{design.formLabels.supplier}</label>
                <input 
                  name="supplier" 
                  defaultValue={editing?.supplier || ''} 
                  placeholder="Ex: Distribuidora ABC" 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                />
                <p className="text-xs text-gray-400 mt-1">Opcional. Nome do fornecedor do produto.</p>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)} 
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  {design.titles.cancel}
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  {design.titles.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
