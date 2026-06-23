// hooks/cozinha/useEditarReceita.ts
// 🔧 Hook para editar receitas

import { useState, useEffect, useCallback } from 'react';
import { cozinhaService } from '@/services/cozinhaService';
import { Recipe } from '@/types/cozinha';
import { toast } from 'react-hot-toast';

export const useEditarReceita = (receitaId: string) => {
  const [receita, setReceita] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const carregarReceita = useCallback(async () => {
    if (!receitaId) return;
    
    setLoading(true);
    try {
      const data = await cozinhaService.getRecipeById(receitaId);
      setReceita(data.data || data);
    } catch (error) {
      console.error('Erro ao carregar receita:', error);
      toast.error('Erro ao carregar receita');
    } finally {
      setLoading(false);
    }
  }, [receitaId]);

  const salvarReceita = useCallback(async (dados: Partial<Recipe>) => {
    if (!receitaId) return false;
    
    setSaving(true);
    try {
      const data = await cozinhaService.updateRecipe(receitaId, dados);
      if (data.success) {
        toast.success('Receita atualizada com sucesso!');
        await carregarReceita();
        return true;
      }
      throw new Error(data.error || 'Erro ao salvar');
    } catch (error) {
      console.error('Erro ao salvar receita:', error);
      toast.error('Erro ao salvar receita');
      return false;
    } finally {
      setSaving(false);
    }
  }, [receitaId, carregarReceita]);

  useEffect(() => {
    if (receitaId) {
      carregarReceita();
    }
  }, [receitaId, carregarReceita]);

  return {
    receita,
    setReceita,
    loading,
    saving,
    carregarReceita,
    salvarReceita
  };
};