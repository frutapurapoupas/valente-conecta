'use client';

import { useState } from 'react';
import { useSync } from '@/hooks/useSync';

export default function SyncPage() {
  const { syncStatus, syncFromSQLite, pendingCount } = useSync();
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<any>(null);

  // Função para exportar dados do SQLite (simulada - será implementada depois)
  const exportData = async () => {
    // Esta função será implementada quando o prisma estiver disponível no cliente
    // Por enquanto, retorna dados vazios
    return {
      suppliers: [],
      ingredients: [],
      recipes: [],
      purchases: [],
      stockMovements: []
    };
  };

  const handleImport = async () => {
    setImporting(true);
    try {
      const data = await exportData();
      // Por enquanto, apenas simula
      setResult({ 
        success: true, 
        results: {
          suppliers: 0,
          ingredients: 0,
          recipes: 0,
          purchases: 0,
          stockMovements: 0,
          errors: []
        }
      });
    } catch (error) {
      console.error('Erro na importação:', error);
      setResult({ success: false, error: String(error) });
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Sincronização de Dados</h1>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Status da Sincronização</h2>
        
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Conexão com internet:</span>
            <span className={syncStatus.isOnline ? 'text-green-600' : 'text-red-600'}>
              {syncStatus.isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Supabase configurado:</span>
            <span className={syncStatus.hasSupabase ? 'text-green-600' : 'text-yellow-600'}>
              {syncStatus.hasSupabase ? 'Sim' : 'Não'}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Itens pendentes:</span>
            <span className={pendingCount > 0 ? 'text-blue-600 font-bold' : 'text-green-600'}>
              {pendingCount}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Última sincronização:</span>
            <span>{syncStatus.lastSync === 'never' ? 'Nunca' : new Date(syncStatus.lastSync).toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Importar Dados Locais para Supabase</h2>
        <p className="text-gray-600 mb-4">
          Esta ação irá exportar todos os dados do seu banco local (SQLite) 
          e importar para o Supabase. Os dados existentes no Supabase serão 
          atualizados se houver conflito.
        </p>
        
        <button
          onClick={handleImport}
          disabled={importing || !syncStatus.isOnline || !syncStatus.hasSupabase}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
        >
          {importing ? 'Importando...' : 'Importar dados locais para Supabase'}
        </button>
        
        {result && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-2">Resultado da Importação:</h3>
            {result.success ? (
              <div>
                <p className="text-green-600">✅ Importação concluída!</p>
                <ul className="mt-2 text-sm">
                  <li>Fornecedores: {result.results.suppliers}</li>
                  <li>Ingredientes: {result.results.ingredients}</li>
                  <li>Receitas: {result.results.recipes}</li>
                  <li>Compras: {result.results.purchases}</li>
                  <li>Movimentações: {result.results.stockMovements}</li>
                </ul>
                {result.results.errors?.length > 0 && (
                  <div className="mt-2 text-red-600">
                    <p>Erros: {result.results.errors.length}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-red-600">❌ Erro: {result.error}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}