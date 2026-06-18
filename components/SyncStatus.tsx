'use client';

import { useSync } from '@/hooks/useSync';
import { useState, useEffect } from 'react';

export function SyncStatus() {
  const { syncStatus, isSyncing, syncNow, pendingCount } = useSync();
  const [showDetails, setShowDetails] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Não renderizar durante SSR
  if (!mounted) return null;

  if (!syncStatus.hasSupabase) {
    return (
      <div className="fixed bottom-4 right-4 bg-yellow-100 border border-yellow-400 rounded-lg p-3 shadow-lg z-50">
        <div className="flex items-center gap-2">
          <span className="text-yellow-600">⚠️</span>
          <span className="text-sm">Modo Offline - Conecte o Supabase para sincronizar</span>
        </div>
      </div>
    );
  }

  if (!syncStatus.isOnline) {
    return (
      <div className="fixed bottom-4 right-4 bg-gray-100 border border-gray-400 rounded-lg p-3 shadow-lg z-50">
        <div className="flex items-center gap-2">
          <span className="text-gray-600">📴</span>
          <span className="text-sm">Sem conexão - Dados salvos localmente</span>
        </div>
      </div>
    );
  }

  if (pendingCount === 0) {
    return (
      <div className="fixed bottom-4 right-4 bg-green-100 border border-green-400 rounded-lg p-2 shadow-lg z-50">
        <div className="flex items-center gap-2">
          <span className="text-green-600">✅</span>
          <span className="text-sm">Sincronizado</span>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-blue-100 border border-blue-400 rounded-lg p-3 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="animate-pulse">
            <span className="text-blue-600">🔄</span>
          </div>
          <div>
            <span className="text-sm font-medium">{pendingCount} itens pendentes</span>
            <button
              onClick={syncNow}
              disabled={isSyncing}
              className="ml-3 text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 disabled:bg-gray-400"
            >
              {isSyncing ? 'Sincronizando...' : 'Sincronizar agora'}
            </button>
          </div>
        </div>
        
        {showDetails && (
          <div className="mt-2 text-xs text-gray-600 max-h-40 overflow-y-auto">
            {syncStatus.pendingItems.map((item, i) => (
              <div key={i} className="py-0.5">
                {item.table}: {item.action}
              </div>
            ))}
          </div>
        )}
        
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="mt-1 text-xs text-blue-600 hover:text-blue-800"
        >
          {showDetails ? 'Ocultar' : 'Ver detalhes'}
        </button>
      </div>
    </div>
  );
}