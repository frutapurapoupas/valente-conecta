// hooks/cozinha/usePratos.ts

import { useState, useEffect, useCallback } from 'react';
import { Prato } from '@/types/cozinha';
import { supabase } from '@/lib/supabase';

export function usePratos() {
  const [pratos, setPratos] = useState<Prato[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('pratos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPratos(data || []);
    } catch (error) {
      console.error('Erro ao carregar pratos:', error);
      setError('Erro ao carregar pratos');
      // Dados mock para desenvolvimento
      setPratos([
        {
          id: '1',
          nome: 'Pizza Margherita',
          descricao: 'Pizza tradicional com molho de tomate, mussarela e manjericão',
          categoria: 'Prato Principal',
          preco: 65.00,
          custo: 28.50,
          margem: 56.15,
          tempo_preparo: 30,
          porcoes: 8,
          ingredientes: [],
          imagem_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop',
          ativo: true,
          destaque: true,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: '2',
          nome: 'Tiramisù',
          descricao: 'Sobremesa italiana com café e mascarpone',
          categoria: 'Sobremesa',
          preco: 35.00,
          custo: 12.00,
          margem: 65.71,
          tempo_preparo: 20,
          porcoes: 6,
          ingredientes: [],
          imagem_url: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&h=300&fit=crop',
          ativo: true,
          destaque: true,
          created_at: new Date(),
          updated_at: new Date()
        }
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  const criar = useCallback(async (data: any) => {
    try {
      const { data: result, error } = await supabase
        .from('pratos')
        .insert([data])
        .select()
        .single();

      if (error) throw error;
      await carregar();
      return { success: true, data: result };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, [carregar]);

  const atualizar = useCallback(async (id: string, data: any) => {
    try {
      const { data: result, error } = await supabase
        .from('pratos')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      await carregar();
      return { success: true, data: result };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, [carregar]);

  const excluir = useCallback(async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este prato?')) return { success: false };

    try {
      const { error } = await supabase
        .from('pratos')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await carregar();
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, [carregar]);

  const toggleAtivo = useCallback(async (id: string) => {
    try {
      const prato = pratos.find(p => p.id === id);
      if (!prato) return;

      await supabase
        .from('pratos')
        .update({ ativo: !prato.ativo })
        .eq('id', id);

      setPratos(prev => 
        prev.map(p => 
          p.id === id ? { ...p, ativo: !p.ativo } : p
        )
      );
    } catch (error) {
      console.error('Erro ao alternar status:', error);
    }
  }, [pratos]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  return { 
    pratos, 
    loading, 
    error, 
    carregar,
    criar,
    atualizar,
    excluir,
    toggleAtivo
  };
}