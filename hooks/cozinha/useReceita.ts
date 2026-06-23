// hooks/cozinha/useReceita.ts

import { useState, useEffect, useCallback } from 'react';
import { Receita, IngredienteReceita, TotaisReceita } from '@/types/cozinha';
import { calcularTotaisReceita, calcularPorcoes } from '@/utils/cozinhaUtils';

export function useReceita(receitaId?: string) {
  // ============================================================
  // ESTADOS
  // ============================================================
  const [receita, setReceita] = useState<Receita | null>(null);
  const [totais, setTotais] = useState<TotaisReceita | null>(null);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [quantidadePorcoes, setQuantidadePorcoes] = useState(1);
  const [ingredientesDisponiveis, setIngredientesDisponiveis] = useState<any[]>([]);
  const [pesoMeta, setPesoMeta] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);

  // ============================================================
  // EFECTS
  // ============================================================
  
  // Calcular totais quando receita mudar
  useEffect(() => {
    if (receita) {
      const totaisCalculados = calcularTotaisReceita(receita);
      setTotais(totaisCalculados);
      
      // Calcular metas de peso (10% a mais para margem de segurança)
      const metas: Record<string, number> = {};
      receita.ingredientes.forEach(ing => {
        metas[ing.ingrediente_nome] = ing.quantidade * 1.1;
      });
      setPesoMeta(metas);
    }
  }, [receita]);

  // Carregar na montagem
  useEffect(() => {
    if (receitaId) {
      carregarReceita();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [receitaId]);

  // ============================================================
  // FUNÇÕES DE CARREGAMENTO
  // ============================================================

  // Carregar ingredientes disponíveis
  const carregarIngredientes = useCallback(async () => {
    try {
      // TODO: Substituir por chamada real à API
      // const { data, error } = await supabase.from('ingredientes').select('*');
      // if (error) throw error;
      // setIngredientesDisponiveis(data || []);
      
      const mockIngredientes = [
        { id: 'ing1', nome: 'Farinha de Trigo', preco_unitario: 4.50, unidade: 'kg' },
        { id: 'ing2', nome: 'Queijo Mussarela', preco_unitario: 12.00, unidade: 'kg' },
        { id: 'ing3', nome: 'Tomate', preco_unitario: 3.80, unidade: 'kg' },
        { id: 'ing4', nome: 'Carne Moída', preco_unitario: 18.00, unidade: 'kg' },
        { id: 'ing5', nome: 'Açúcar', preco_unitario: 3.20, unidade: 'kg' },
        { id: 'ing6', nome: 'Ovos', preco_unitario: 0.80, unidade: 'un' },
        { id: 'ing7', nome: 'Leite', preco_unitario: 4.20, unidade: 'L' },
        { id: 'ing8', nome: 'Farinha de Arroz', preco_unitario: 5.50, unidade: 'kg' },
      ];
      setIngredientesDisponiveis(mockIngredientes);
    } catch (error) {
      console.error('Erro ao carregar ingredientes:', error);
      setIngredientesDisponiveis([]);
    }
  }, []);

  // Carregar receita
  const carregarReceita = useCallback(async () => {
    if (!receitaId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // TODO: Substituir por chamada real à API
      // const { data, error } = await supabase
      //   .from('receitas')
      //   .select('*')
      //   .eq('id', receitaId)
      //   .single();
      // if (error) throw error;
      // setReceita(data);
      
      const receitaMock: Receita = {
        id: receitaId,
        nome: 'Pizza Margherita',
        descricao: 'Pizza tradicional italiana com molho de tomate, mussarela e manjericão',
        categoria: 'Prato Principal',
        porcoes: 8,
        preco_sugerido: 65.00,
        custo_total: 28.50,
        ingredientes: [
          {
            id: '1',
            ingrediente_nome: 'Farinha de Trigo',
            ingrediente_id: 'ing1',
            quantidade: 500,
            unidade: 'g',
            custo_total: 3.50
          },
          {
            id: '2',
            ingrediente_nome: 'Queijo Mussarela',
            ingrediente_id: 'ing2',
            quantidade: 300,
            unidade: 'g',
            custo_total: 12.00
          },
          {
            id: '3',
            ingrediente_nome: 'Tomate',
            ingrediente_id: 'ing3',
            quantidade: 200,
            unidade: 'g',
            custo_total: 3.80
          }
        ],
        ativo: true,
        created_at: new Date(),
        updated_at: new Date()
      };
      
      setReceita(receitaMock);
      await carregarIngredientes();
      
    } catch (error) {
      console.error('Erro ao carregar receita:', error);
      setError('Erro ao carregar receita');
    } finally {
      setLoading(false);
    }
  }, [receitaId, carregarIngredientes]);

  // ============================================================
  // FUNÇÕES DE SALVAMENTO
  // ============================================================

  // Salvar receita (retorna resultado)
  const salvarReceita = useCallback(async (): Promise<{ success: boolean; data?: Receita; error?: string }> => {
    if (!receita) {
      return { success: false, error: 'Nenhuma receita para salvar' };
    }
    
    setSalvando(true);
    setError(null);
    
    try {
      // TODO: Substituir por chamada real à API
      // const { data, error } = await supabase
      //   .from('receitas')
      //   .upsert({ ...receita, updated_at: new Date().toISOString() })
      //   .select()
      //   .single();
      // if (error) throw error;
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Receita salva:', receita);
      
      return { success: true, data: receita };
    } catch (error: any) {
      console.error('Erro ao salvar receita:', error);
      setError(error.message || 'Erro ao salvar receita');
      return { success: false, error: error.message || 'Erro ao salvar receita' };
    } finally {
      setSalvando(false);
    }
  }, [receita]);

  // ============================================================
  // FUNÇÕES DE MANIPULAÇÃO DE INGREDIENTES
  // ============================================================

  // Adicionar ingrediente
  const adicionarIngrediente = useCallback((ingrediente: IngredienteReceita) => {
    if (!receita) return;
    
    setReceita({
      ...receita,
      ingredientes: [...receita.ingredientes, ingrediente]
    });
  }, [receita]);

  // Remover ingrediente
  const removerIngrediente = useCallback((index: number) => {
    if (!receita) return;
    
    const novosIngredientes = receita.ingredientes.filter((_, i) => i !== index);
    setReceita({
      ...receita,
      ingredientes: novosIngredientes
    });
  }, [receita]);

  // Atualizar quantidade de ingrediente
  const atualizarQuantidade = useCallback((index: number, quantidade: number) => {
    if (!receita) return;
    
    const novosIngredientes = receita.ingredientes.map((ing, i) => {
      if (i === index) {
        const proporcao = quantidade / ing.quantidade;
        return {
          ...ing,
          quantidade,
          custo_total: ing.custo_total * proporcao
        };
      }
      return ing;
    });
    
    setReceita({
      ...receita,
      ingredientes: novosIngredientes
    });
  }, [receita]);

  // ============================================================
  // FUNÇÕES DE CÁLCULO
  // ============================================================

  // Calcular porções
  const calcularPorcoesReceita = useCallback(() => {
    if (!receita) return null;
    return calcularPorcoes(receita, quantidadePorcoes);
  }, [receita, quantidadePorcoes]);

  // Calcular margem
  const calcularMargem = useCallback(() => {
    if (!receita || receita.preco_sugerido === 0) return 0;
    return ((receita.preco_sugerido - receita.custo_total) / receita.preco_sugerido) * 100;
  }, [receita]);

  // ============================================================
  // FUNÇÕES DE RESET
  // ============================================================

  // Resetar formulário
  const resetForm = useCallback(() => {
    setReceita(null);
    setTotais(null);
    setError(null);
    setQuantidadePorcoes(1);
    setPesoMeta({});
  }, []);

  // ============================================================
  // RETURN
  // ============================================================

  return {
    // Dados
    receita,
    setReceita,
    totais,
    loading,
    salvando,
    error,
    
    // Porções
    quantidadePorcoes,
    setQuantidadePorcoes,
    
    // Ingredientes
    ingredientesDisponiveis,
    pesoMeta,
    
    // Funções de cálculo
    calcularPorcoes: calcularPorcoesReceita,
    calcularMargem,
    
    // Funções CRUD
    salvarReceita,
    carregarReceita,
    resetForm,
    
    // Funções de manipulação
    adicionarIngrediente,
    removerIngrediente,
    atualizarQuantidade,
  };
}

export default useReceita;