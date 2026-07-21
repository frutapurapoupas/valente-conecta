// app/hooks/useEstoque.ts
'use client';

import { useState, useEffect, useCallback } from 'react';

export interface Ingrediente {
  id: string;
  nome: string;
  categoria: string;
  quantidade: number;
  unidade: string;
  preco: number;
  preco_fornecedor?: number;
  fornecedor?: string;
  estoque_minimo?: number;
  created_at?: string;
  updated_at?: string;
}

interface UseEstoqueReturn {
  ingredientes: Ingrediente[];
  loading: boolean;
  error: string | null;
  carregarEstoque: () => Promise<void>;
  adicionarItem: (item: Omit<Ingrediente, 'id' | 'created_at' | 'updated_at'>) => Promise<{ success: boolean; data?: Ingrediente; error?: string }>;
  atualizarItem: (id: string, updates: Partial<Ingrediente>) => Promise<{ success: boolean; data?: Ingrediente; error?: string }>;
  excluirItem: (id: string) => Promise<{ success: boolean; error?: string }>;
}

export function useEstoque(): UseEstoqueReturn {
  const [ingredientes, setIngredientes] = useState<Ingrediente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const carregarEstoque = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/cozinha/estoque');
      
      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setIngredientes(data.data || []);
      } else {
        throw new Error(data.error || 'Erro ao carregar estoque');
      }
    } catch (err) {
      console.error('Erro ao carregar estoque:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      
      // Fallback: tentar carregar do arquivo diretamente
      try {
        const fallbackResponse = await fetch('/api/estoque');
        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json();
          if (fallbackData.success) {
            setIngredientes(fallbackData.data || []);
            setError(null);
            return;
          }
        }
      } catch (fallbackErr) {
        console.error('Fallback tambÃ©m falhou:', fallbackErr);
      }
      
      // Dados mockados para teste se tudo falhar
      setIngredientes([
        { 
          id: '1', 
          nome: 'Farinha', 
          categoria: 'Secos/Mercearia', 
          quantidade: 10, 
          unidade: 'kg', 
          preco: 5.00 
        },
        { 
          id: '2', 
          nome: 'AÃ§Ãºcar', 
          categoria: 'Secos/Mercearia', 
          quantidade: 8, 
          unidade: 'kg', 
          preco: 4.50 
        },
        { 
          id: '3', 
          nome: 'Leite', 
          categoria: 'LaticÃ­nios', 
          quantidade: 5, 
          unidade: 'L', 
          preco: 5.50 
        }
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  const adicionarItem = useCallback(async (item: Omit<Ingrediente, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const response = await fetch('/api/cozinha/estoque', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(item),
      });
      
      if (!response.ok) {
        throw new Error('Erro ao adicionar item');
      }
      
      const data = await response.json();
      if (data.success) {
        setIngredientes(prev => [...prev, data.data]);
        return { success: true, data: data.data };
      }
      
      return { success: false, error: data.error };
    } catch (error) {
      console.error('Erro ao adicionar item:', error);
      return { success: false, error: String(error) };
    }
  }, []);

  const atualizarItem = useCallback(async (id: string, updates: Partial<Ingrediente>) => {
    try {
      const response = await fetch('/api/cozinha/estoque', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, ...updates }),
      });
      
      if (!response.ok) {
        throw new Error('Erro ao atualizar item');
      }
      
      const data = await response.json();
      if (data.success) {
        setIngredientes(prev => 
          prev.map(item => item.id === id ? { ...item, ...data.data } : item)
        );
        return { success: true, data: data.data };
      }
      
      return { success: false, error: data.error };
    } catch (error) {
      console.error('Erro ao atualizar item:', error);
      return { success: false, error: String(error) };
    }
  }, []);

  const excluirItem = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/cozinha/estoque?id=${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Erro ao excluir item');
      }
      
      const data = await response.json();
      if (data.success) {
        setIngredientes(prev => prev.filter(item => item.id !== id));
        return { success: true };
      }
      
      return { success: false, error: data.error };
    } catch (error) {
      console.error('Erro ao excluir item:', error);
      return { success: false, error: String(error) };
    }
  }, []);

  // Carregar ao montar
  useEffect(() => {
    carregarEstoque();
  }, [carregarEstoque]);

  return {
    ingredientes,
    loading,
    error,
    carregarEstoque,
    adicionarItem,
    atualizarItem,
    excluirItem
  };
}

