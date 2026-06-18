'use client';

import { useState, useEffect } from 'react';

interface ShoppingItem {
  ingredientId: string;
  ingredientName: string;
  currentStock: number;
  minStock: number;
  neededQuantity: number;
  unit: string;
  supplierId?: string;
  supplierName?: string;
  estimatedCost: number;
}

export default function ListaComprasPage() {
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>([]);
  const [groupedList, setGroupedList] = useState<Record<string, any>>({});
  const [totalItems, setTotalItems] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadShoppingList();
  }, []);

  const loadShoppingList = async () => {
    try {
      const response = await fetch('/api/cozinha/shopping-list');
      const data = await response.json();
      setShoppingList(data.shoppingList || []);
      setGroupedList(data.groupedBySupplier || {});
      setTotalItems(data.totalItems || 0);
      setTotalCost(data.totalEstimatedCost || 0);
    } catch (error) {
      console.error('Erro ao carregar lista de compras:', error);
    } finally {
      setLoading(false);
    }
  };

  const printShoppingList = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Lista de Compras - ${new Date().toLocaleDateString()}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #333; }
            h2 { color: #666; margin-top: 20px; }
            table { width: 100%; border-collapse: collapse; margin: 10px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .total { font-weight: bold; margin-top: 20px; text-align: right; }
            @media print {
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <h1>Lista de Compras</h1>
          <p>Data: ${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}</p>
    `);
    
    Object.entries(groupedList).forEach(([_, group]: [string, any]) => {
      printWindow.document.write(`
        <h2>${group.supplierName}</h2>
        <table>
          <thead>
            <tr><th>Ingrediente</th><th>Estoque Atual</th><th>Mínimo</th><th>Qtd Necessária</th><th>Unidade</th><th>Custo Estimado</th></tr>
          </thead>
          <tbody>
      `);
      
      group.items.forEach((item: ShoppingItem) => {
        printWindow.document.write(`
          <tr>
            <td>${item.ingredientName}</td>
            <td>${item.currentStock}</td>
            <td>${item.minStock}</td>
            <td>${item.neededQuantity.toFixed(2)}</td>
            <td>${item.unit}</td>
            <td>R$ ${item.estimatedCost.toFixed(2)}</td>
          </tr>
        `);
      });
      
      printWindow.document.write(`
          </tbody>
        </table>
        <div class="total">Total ${group.supplierName}: R$ ${group.totalCost.toFixed(2)}</div>
      `);
    });
    
    printWindow.document.write(`
        <hr />
        <div class="total">TOTAL GERAL: R$ ${totalCost.toFixed(2)}</div>
        <p style="margin-top: 30px; font-size: 12px; color: #999;">Documento gerado automaticamente pelo sistema Valente Conecta</p>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.print();
  };

  if (loading) return <div className="p-8 text-center text-gray-900 dark:text-gray-100">Carregando lista de compras...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Lista de Compras</h1>
        <div className="flex gap-3">
          <button
            onClick={printShoppingList}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            🖨️ Imprimir
          </button>
          <button
            onClick={loadShoppingList}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            🔄 Atualizar
          </button>
        </div>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">Itens para Comprar</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{totalItems}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">Valor Estimado Total</div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">R$ {totalCost.toFixed(2)}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">Fornecedores Envolvidos</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{Object.keys(groupedList).length}</div>
        </div>
      </div>

      {/* Lista agrupada por fornecedor */}
      {Object.keys(groupedList).length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
          <div className="text-green-600 dark:text-green-400 text-lg mb-2">✅ Nenhum item precisa ser comprado!</div>
          <p className="text-gray-500 dark:text-gray-400">Todos os ingredientes estão com estoque dentro do mínimo.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedList).map(([supplierId, group]: [string, any]) => (
            <div key={supplierId} className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              <div className="bg-blue-50 dark:bg-blue-900/20 px-6 py-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold text-blue-800 dark:text-blue-400">{group.supplierName}</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{group.items.length} itens • Total: R$ {group.totalCost.toFixed(2)}</p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Ingrediente</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Estoque Atual</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Mínimo</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Qtd Necessária</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Unidade</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Custo Estimado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {group.items.map((item: ShoppingItem) => (
                      <tr key={item.ingredientId} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{item.ingredientName}</td>
                        <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{item.currentStock}</td>
                        <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{item.minStock}</td>
                        <td className="px-6 py-4 font-medium text-orange-600 dark:text-orange-400">{item.neededQuantity.toFixed(2)}</td>
                        <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{item.unit}</td>
                        <td className="px-6 py-4 text-gray-600 dark:text-gray-400">R$ {item.estimatedCost.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}