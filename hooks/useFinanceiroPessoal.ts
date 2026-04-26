// hooks/useFinanceiroPessoal.ts
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase-client-switch';
import { isMockMode } from '@/lib/supabase-client-switch';
import { MOCK_DATA } from '@/lib/mock/mock-data';

export interface CategoriaFinanceira {
  id: string;
  nome: string;
  tipo: 'receita' | 'despesa';
  icone: string;
  cor: string;
}

export interface LancamentoFinanceiro {
  id: string;
  descricao: string;
  valor: number;
  data: string;
  categoriaId: string;
  tipo: 'receita' | 'despesa';
  recorrente?: boolean;
  recorrenciaMeses?: number;
  fornecedorId?: string;
  cartaoId?: string;
  parcela?: number;
  parcelasTotais?: number;
}

export interface CartaoCredito {
  id: string;
  nome: string;
  limite: number;
  diaFechamento: number;
  diaVencimento: number;
  cor: string;
}

export interface Fornecedor {
  id: string;
  nome: string;
  telefone?: string;
  email?: string;
}

export const useFinanceiroPessoal = () => {
  const [lancamentos, setLancamentos] = useState<LancamentoFinanceiro[]>([]);
  const [categorias, setCategorias] = useState<CategoriaFinanceira[]>([]);
  const [cartoes, setCartoes] = useState<CartaoCredito[]>([]);
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [anoSelecionado, setAnoSelecionado] = useState(new Date().getFullYear());
  const [mesSelecionado, setMesSelecionado] = useState(new Date().getMonth() + 1);

  const fetchData = useCallback(async () => {
    setLoading(true);
    if (isMockMode()) {
      console.log('📊 Usando dados MOCK para Financeiro Pessoal');
      setCategorias([]);
      setLancamentos([]);
      setCartoes([]);
      setFornecedores([]);
    } else {
      console.log('📡 Buscando dados reais do Supabase para Financeiro Pessoal');
      try {
        const [lancamentosRes, categoriasRes, cartoesRes, fornecedoresRes] = await Promise.all([
          supabase.from('financeiro_lancamentos').select('*'),
          supabase.from('financeiro_categorias').select('*'),
          supabase.from('financeiro_cartoes').select('*'),
          supabase.from('financeiro_fornecedores').select('*'),
        ]);
        if (lancamentosRes.data) setLancamentos(lancamentosRes.data);
        if (categoriasRes.data) setCategorias(categoriasRes.data);
        if (cartoesRes.data) setCartoes(cartoesRes.data);
        if (fornecedoresRes.data) setFornecedores(fornecedoresRes.data);
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const salvarLancamento = async (lancamento: Omit<LancamentoFinanceiro, 'id'>) => {
    const novoLancamento = { ...lancamento, id: Date.now().toString() };
    if (isMockMode()) {
      setLancamentos(prev => [novoLancamento, ...prev]);
      return novoLancamento;
    }
    const { data, error } = await supabase.from('financeiro_lancamentos').insert(lancamento).select().single();
    if (error) throw error;
    setLancamentos(prev => [data, ...prev]);
    return data;
  };

  const atualizarLancamento = async (id: string, updates: Partial<LancamentoFinanceiro>) => {
    if (isMockMode()) {
      setLancamentos(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
      return;
    }
    const { error } = await supabase.from('financeiro_lancamentos').update(updates).eq('id', id);
    if (error) throw error;
    setLancamentos(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
  };

  const deletarLancamento = async (id: string) => {
    if (isMockMode()) {
      setLancamentos(prev => prev.filter(l => l.id !== id));
      return;
    }
    const { error } = await supabase.from('financeiro_lancamentos').delete().eq('id', id);
    if (error) throw error;
    setLancamentos(prev => prev.filter(l => l.id !== id));
  };

  const salvarCategoria = async (categoria: Omit<CategoriaFinanceira, 'id'>) => {
    const novaCategoria = { ...categoria, id: Date.now().toString() };
    if (isMockMode()) {
      setCategorias(prev => [...prev, novaCategoria]);
      return novaCategoria;
    }
    const { data, error } = await supabase.from('financeiro_categorias').insert(categoria).select().single();
    if (error) throw error;
    setCategorias(prev => [...prev, data]);
    return data;
  };

  const deletarCategoria = async (id: string) => {
    if (isMockMode()) {
      setCategorias(prev => prev.filter(c => c.id !== id));
      return;
    }
    const { error } = await supabase.from('financeiro_categorias').delete().eq('id', id);
    if (error) throw error;
    setCategorias(prev => prev.filter(c => c.id !== id));
  };

  const salvarCartao = async (cartao: Omit<CartaoCredito, 'id'>) => {
    const novoCartao = { ...cartao, id: Date.now().toString() };
    if (isMockMode()) {
      setCartoes(prev => [...prev, novoCartao]);
      return novoCartao;
    }
    const { data, error } = await supabase.from('financeiro_cartoes').insert(cartao).select().single();
    if (error) throw error;
    setCartoes(prev => [...prev, data]);
    return data;
  };

  const deletarCartao = async (id: string) => {
    if (isMockMode()) {
      setCartoes(prev => prev.filter(c => c.id !== id));
      return;
    }
    const { error } = await supabase.from('financeiro_cartoes').delete().eq('id', id);
    if (error) throw error;
    setCartoes(prev => prev.filter(c => c.id !== id));
  };

  const salvarFornecedor = async (fornecedor: Omit<Fornecedor, 'id'>) => {
    const novoFornecedor = { ...fornecedor, id: Date.now().toString() };
    if (isMockMode()) {
      setFornecedores(prev => [...prev, novoFornecedor]);
      return novoFornecedor;
    }
    const { data, error } = await supabase.from('financeiro_fornecedores').insert(fornecedor).select().single();
    if (error) throw error;
    setFornecedores(prev => [...prev, data]);
    return data;
  };

  const deletarFornecedor = async (id: string) => {
    if (isMockMode()) {
      setFornecedores(prev => prev.filter(f => f.id !== id));
      return;
    }
    const { error } = await supabase.from('financeiro_fornecedores').delete().eq('id', id);
    if (error) throw error;
    setFornecedores(prev => prev.filter(f => f.id !== id));
  };

  const getLancamentosFiltrados = useCallback(() => {
    return lancamentos.filter(l => {
      const dataLancamento = new Date(l.data);
      return dataLancamento.getFullYear() === anoSelecionado && 
             dataLancamento.getMonth() + 1 === mesSelecionado;
    });
  }, [lancamentos, anoSelecionado, mesSelecionado]);

  const getSaldoPeriodo = useCallback(() => {
    const filtrados = getLancamentosFiltrados();
    const totalReceitas = filtrados.filter(l => l.tipo === 'receita').reduce((s, l) => s + l.valor, 0);
    const totalDespesas = filtrados.filter(l => l.tipo === 'despesa').reduce((s, l) => s + l.valor, 0);
    return { totalReceitas, totalDespesas, saldo: totalReceitas - totalDespesas };
  }, [getLancamentosFiltrados]);

  const getLancamentosPorCategoria = useCallback(() => {
    const filtrados = getLancamentosFiltrados();
    const porCategoria: Record<string, number> = {};
    filtrados.forEach(l => {
      const categoria = categorias.find(c => c.id === l.categoriaId);
      if (categoria) {
        const key = categoria.nome;
        porCategoria[key] = (porCategoria[key] || 0) + l.valor;
      }
    });
    return porCategoria;
  }, [getLancamentosFiltrados, categorias]);

  return {
    lancamentos: getLancamentosFiltrados(),
    todosLancamentos: lancamentos,
    categorias,
    cartoes,
    fornecedores,
    loading,
    anoSelecionado,
    mesSelecionado,
    setAnoSelecionado,
    setMesSelecionado,
    salvarLancamento,
    atualizarLancamento,
    deletarLancamento,
    salvarCategoria,
    deletarCategoria,
    salvarCartao,
    deletarCartao,
    salvarFornecedor,
    deletarFornecedor,
    getSaldoPeriodo,
    getLancamentosPorCategoria,
    refresh: fetchData,
  };
};