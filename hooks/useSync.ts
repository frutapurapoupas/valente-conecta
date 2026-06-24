'use client';

import { useState, useEffect } from 'react';
import { syncService } from '@/services/syncService';
import { supabase } from '@/lib/supabase';

export function useSync() {
  // Inicializar com valores padrão para SSR
  const [syncStatus, setSyncStatus] = useState(() => {
    if (typeof window === 'undefined') {
      return {
        isOnline: true,
        hasSupabase: false,
        pendingCount: 0,
        pendingItems: [],
        lastSync: 'never'
      };
    }
    return syncService.getSyncStatus();
  });
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    // Configurar Supabase no serviço
    if (supabase) {
      syncService.setSupabase(supabase);
    }

    // Atualizar status periodicamente
    const interval = setInterval(() => {
      if (typeof window !== 'undefined') {
        setSyncStatus(syncService.getSyncStatus());
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const syncNow = async () => {
    setIsSyncing(true);
    try {
      const result = await syncService.syncAll();
      if (typeof window !== 'undefined') {
        setSyncStatus(syncService.getSyncStatus());
      }
      return result;
    } finally {
      setIsSyncing(false);
    }
  };

  const exportData = async (prisma: any) => {
    // Coletar dados do SQLite
    const suppliers = await prisma.supplier.findMany();
    const ingredients = await prisma.ingredient.findMany();
    const recipes = await prisma.recipe.findMany();
    const purchases = await prisma.purchase.findMany();
    const stockMovements = await prisma.stockMovement.findMany();

    return {
      suppliers,
      ingredients,
      recipes,
      purchases,
      stockMovements
    };
  };

  const syncFromSQLite = async (prisma: any) => {
    setIsSyncing(true);
    try {
      const data = await exportData(prisma);
      const result = await syncService.importFromSQLite(data);
      if (typeof window !== 'undefined') {
        setSyncStatus(syncService.getSyncStatus());
      }
      return result;
    } finally {
      setIsSyncing(false);
    }
  };

  return {
    syncStatus,
    isSyncing,
    syncNow,
    syncFromSQLite,
    pendingCount: syncStatus.pendingCount
  };
}