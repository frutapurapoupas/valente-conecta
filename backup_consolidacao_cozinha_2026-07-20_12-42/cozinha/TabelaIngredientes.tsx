'use client';

import { Pencil, Trash2 } from 'lucide-react';
import { textosIngredientes, categoriasList } from '@/constants/ingredientesConstants';

interface Ingredient {
  id: string;
  name: string;
  category: string;
  unit: string;
  stock: number;
  minStock: number;
  currentPrice: number;
}

interface TabelaIngredientesProps {
  ingredients: Ingredient[];
  onEdit: (ingredient: Ingredient) => void;
  onDelete: (id: string) => void;
  getStockStatus: (ingredient: Ingredient) => { text: string; class: string };
  formatCurrency: (value: number) => string;
}

export default function TabelaIngredientes({
  ingredients,
  onEdit,
  onDelete,
  getStockStatus,
  formatCurrency
}: TabelaIngredientesProps) {
  return (
    <div className="tabela-container">
      <div className="overflow-x-auto">
        <table className="tabela">
          <thead className="tabela-cabecalho">
            <tr>
              <th className="tabela-celula-cabecalho">{textosIngredientes.tabela.nome}</th>
              <th className="tabela-celula-cabecalho">{textosIngredientes.tabela.categoria}</th>
              <th className="tabela-celula-cabecalho">{textosIngredientes.tabela.estoque}</th>
              <th className="tabela-celula-cabecalho">{textosIngredientes.tabela.minimo}</th>
              <th className="tabela-celula-cabecalho">{textosIngredientes.tabela.preco}</th>
              <th className="tabela-celula-cabecalho">{textosIngredientes.tabela.status}</th>
              <th className="tabela-celula-cabecalho">{textosIngredientes.tabela.acoes}</th>
            </tr>
          </thead>
          <tbody>
            {ingredients.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-gray-500">
                  Nenhum ingrediente encontrado
                </td>
              </tr>
            ) : (
              ingredients.map((ing) => {
                const status = getStockStatus(ing);
                return (
                  <tr key={ing.id} className="tabela-linha">
                    <td className="tabela-celula font-medium text-gray-900">{ing.name}</td>
                    <td className="tabela-celula text-gray-600">
                      {categoriasList.find(c => c.value === ing.category)?.label || ing.category}
                    </td>
                    <td className="tabela-celula text-gray-600">{ing.stock} {ing.unit}</td>
                    <td className="tabela-celula text-gray-600">{ing.minStock} {ing.unit}</td>
                    <td className="tabela-celula text-gray-600">{formatCurrency(ing.currentPrice)}</td>
                    <td className="tabela-celula">
                      <span className={status.class}>{status.text}</span>
                    </td>
                    <td className="tabela-celula">
                      <div className="flex gap-2">
                        <button onClick={() => onEdit(ing)} className="text-blue-600 hover:text-blue-800">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => onDelete(ing.id)} className="text-red-600 hover:text-red-800">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}



