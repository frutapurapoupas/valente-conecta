// hooks/cozinha/useCompras.ts

import { useState, useEffect, useCallback } from 'react';
import { CompraItem } from '@/types/cozinha';
import { compraService } from '@/services/compraService';

export function useCompras() {
  const [items, setItems] = useState<CompraItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Simulação - substituir por chamada real
      const mockItems: CompraItem[] = [
        {
          id: '1',
          nome: 'Farinha de Trigo',
          unidade: 'kg',
          quantidade: 10,
          preco_estimado: 4.50,
          comprado: false,
          prioridade: 'alta'
        },
        {
          id: '2',
          nome: 'Açúcar',
          unidade: 'kg',
          quantidade: 5,
          preco_estimado: 3.20,
          comprado: false,
          prioridade: 'media'
        },
        {
          id: '3',
          nome: 'Óleo de Soja',
          unidade: 'L',
          quantidade: 2,
          preco_estimado: 8.90,
          comprado: true,
          prioridade: 'baixa'
        }
      ];
      setItems(mockItems);
    } catch (err) {
      setError('Erro ao carregar compras');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ NOVA FUNÇÃO: Alternar status comprado
  const toggleComprado = useCallback(async (id: string) => {
    try {
      setItems(prev => 
        prev.map(item => 
          item.id === id 
            ? { ...item, comprado: !item.comprado }
            : item
        )
      );
      
      // Opcional: chamar API para persistir
      // await compraService.marcarComoComprado(id);
      
      return true;
    } catch (error) {
      console.error('Erro ao alternar comprado:', error);
      return false;
    }
  }, []);

  // ✅ NOVA FUNÇÃO: Excluir item
  const excluir = useCallback(async (id: string) => {
    try {
      setItems(prev => prev.filter(item => item.id !== id));
      
      // Opcional: chamar API para excluir
      // await compraService.excluirItem(id);
      
      return true;
    } catch (error) {
      console.error('Erro ao excluir item:', error);
      return false;
    }
  }, []);

  // ✅ NOVA FUNÇÃO: Adicionar item
  const adicionar = useCallback(async (novoItem: Omit<CompraItem, 'id'>) => {
    try {
      const itemCompleto: CompraItem = {
        ...novoItem,
        id: Date.now().toString(),
        comprado: false
      };
      
      setItems(prev => [...prev, itemCompleto]);
      
      // Opcional: chamar API para adicionar
      // await compraService.adicionarItem(itemCompleto);
      
      return itemCompleto;
    } catch (error) {
      console.error('Erro ao adicionar item:', error);
      return null;
    }
  }, []);

  // ✅ NOVA FUNÇÃO: Atualizar item
  const atualizar = useCallback(async (id: string, dados: Partial<CompraItem>) => {
    try {
      setItems(prev => 
        prev.map(item => 
          item.id === id 
            ? { ...item, ...dados }
            : item
        )
      );
      
      // Opcional: chamar API para atualizar
      // await compraService.atualizarItem(id, dados);
      
      return true;
    } catch (error) {
      console.error('Erro ao atualizar item:', error);
      return false;
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  return { 
    items, 
    loading, 
    error,
    carregar,
    toggleComprado, // ✅ EXPORTADO
    excluir,        // ✅ EXPORTADO
    adicionar,
    atualizar
  };
}