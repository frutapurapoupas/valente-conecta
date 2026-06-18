// Caminho: hooks/useEditarReceita.ts
import { useState, useEffect } from 'react';
import { cozinhaService } from '@/services/cozinhaService';
import { toast } from 'react-hot-toast';

export const useEditarReceita = (receitaId: string) => {
  const [receita, setReceita] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const carregar = async () => {
    setLoading(true);
    try {
      const data = await cozinhaService.getRecipeById(receitaId);
      setReceita(data.data);
    } catch {
      toast.error('Erro ao carregar receita');
    } finally {
      setLoading(false);
    }
  };

  const salvar = async (dadosAtualizados: any) => {
    try {
      await cozinhaService.updateRecipe(receitaId, dadosAtualizados);
      toast.success('Receita atualizada com sucesso!');
    } catch {
      toast.error('Erro ao salvar');
    }
  };

  useEffect(() => { if (receitaId) carregar(); }, [receitaId]);

  return { receita, setReceita, loading, salvar };
};