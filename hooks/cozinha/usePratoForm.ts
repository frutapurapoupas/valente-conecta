// hooks/cozinha/usePratoForm.ts

import { useState, useCallback, useEffect } from 'react';
import { 
  Prato, 
  PratoFormData, 
  IngredienteReceita, 
  IMAGENS_PLACEHOLDER 
} from '@/types/cozinha';
import { supabase } from '@/lib/supabase';

export function usePratoForm(pratoId?: string) {
  const [prato, setPrato] = useState<Prato | null>(null);
  const [loading, setLoading] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ingredientesDisponiveis, setIngredientesDisponiveis] = useState<any[]>([]);

  // Estado do formulário
  const [formData, setFormData] = useState<PratoFormData>({
    nome: '',
    descricao: '',
    categoria: 'Prato Principal',
    preco: 0,
    custo: 0,
    tempo_preparo: 30,
    porcoes: 1,
    ingredientes: [],
    imagem_url: '',
    ativo: true,
    destaque: false
  });

  // Carregar ingredientes disponíveis
  const carregarIngredientes = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('ingredientes')
        .select('*')
        .order('nome');

      if (error) throw error;
      setIngredientesDisponiveis(data || []);
    } catch (err) {
      console.error('Erro ao carregar ingredientes:', err);
      // Dados mock para desenvolvimento
      setIngredientesDisponiveis([
        { id: '1', nome: 'Farinha de Trigo', preco_unitario: 4.50, unidade: 'kg' },
        { id: '2', nome: 'Queijo Mussarela', preco_unitario: 12.00, unidade: 'kg' },
        { id: '3', nome: 'Tomate', preco_unitario: 3.80, unidade: 'kg' },
        { id: '4', nome: 'Carne Moída', preco_unitario: 18.00, unidade: 'kg' },
        { id: '5', nome: 'Açúcar', preco_unitario: 3.20, unidade: 'kg' },
        { id: '6', nome: 'Ovos', preco_unitario: 0.80, unidade: 'un' }
      ]);
    }
  }, []);

  // Carregar prato para edição
  const carregarPrato = useCallback(async () => {
    if (!pratoId) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('pratos')
        .select('*')
        .eq('id', pratoId)
        .single();

      if (error) throw error;

      if (data) {
        const pratoData: Prato = {
          ...data,
          ingredientes: data.ingredientes || []
        };
        setPrato(pratoData);
        setFormData({
          nome: data.nome || '',
          descricao: data.descricao || '',
          categoria: data.categoria || 'Prato Principal',
          preco: data.preco || 0,
          custo: data.custo || 0,
          tempo_preparo: data.tempo_preparo || 30,
          porcoes: data.porcoes || 1,
          ingredientes: data.ingredientes || [],
          imagem_url: data.imagem_url || '',
          ativo: data.ativo !== false,
          destaque: data.destaque || false
        });
      }
    } catch (err) {
      setError('Erro ao carregar prato');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [pratoId]);

  // Atualizar campo do formulário
  const atualizarCampo = useCallback(<K extends keyof PratoFormData>(
    campo: K,
    valor: PratoFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [campo]: valor }));
  }, []);

  // Adicionar ingrediente
  const adicionarIngrediente = useCallback((ingrediente: IngredienteReceita) => {
    setFormData(prev => ({
      ...prev,
      ingredientes: [...prev.ingredientes, ingrediente]
    }));
  }, []);

  // Remover ingrediente
  const removerIngrediente = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      ingredientes: prev.ingredientes.filter((_, i) => i !== index)
    }));
  }, []);

  // Atualizar quantidade de ingrediente
  const atualizarQuantidadeIngrediente = useCallback((index: number, quantidade: number) => {
    setFormData(prev => {
      const novosIngredientes = [...prev.ingredientes];
      const proporcao = quantidade / (novosIngredientes[index]?.quantidade || 1);
      novosIngredientes[index] = {
        ...novosIngredientes[index],
        quantidade,
        custo_total: (novosIngredientes[index]?.custo_total || 0) * proporcao
      };
      return { ...prev, ingredientes: novosIngredientes };
    });
  }, []);

  // Calcular custo total
  const calcularCustoTotal = useCallback(() => {
    return formData.ingredientes.reduce((sum, ing) => sum + (ing.custo_total || 0), 0);
  }, [formData.ingredientes]);

  // Salvar prato
  const salvarPrato = useCallback(async () => {
    setSalvando(true);
    setError(null);

    try {
      if (!formData.nome.trim()) {
        throw new Error('Nome do prato é obrigatório');
      }
      if (formData.preco <= 0) {
        throw new Error('Preço deve ser maior que zero');
      }

      const imagem_url = formData.imagem_url || IMAGENS_PLACEHOLDER[formData.categoria] || IMAGENS_PLACEHOLDER.default;

      const dadosParaSalvar = {
        ...formData,
        imagem_url,
        custo: calcularCustoTotal(),
        margem: formData.preco > 0 ? ((formData.preco - calcularCustoTotal()) / formData.preco) * 100 : 0
      };

      let result;

      if (pratoId) {
        result = await supabase
          .from('pratos')
          .update({
            ...dadosParaSalvar,
            updated_at: new Date().toISOString()
          })
          .eq('id', pratoId)
          .select()
          .single();
      } else {
        result = await supabase
          .from('pratos')
          .insert([{
            ...dadosParaSalvar,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
          .select()
          .single();
      }

      if (result.error) throw result.error;

      return { success: true, data: result.data };
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar prato');
      return { success: false, error: err.message };
    } finally {
      setSalvando(false);
    }
  }, [formData, pratoId, calcularCustoTotal]);

  useEffect(() => {
    carregarIngredientes();
    if (pratoId) {
      carregarPrato();
    }
  }, [pratoId, carregarIngredientes, carregarPrato]);

  const margem = formData.preco > 0 
    ? ((formData.preco - calcularCustoTotal()) / formData.preco) * 100 
    : 0;

  return {
    formData,
    setFormData,
    atualizarCampo,
    adicionarIngrediente,
    removerIngrediente,
    atualizarQuantidadeIngrediente,
    salvarPrato,
    loading,
    salvando,
    error,
    ingredientesDisponiveis,
    calcularCustoTotal,
    margem,
    prato,
    carregarPrato
  };
}