// app/admin-master/cozinha/repositories/EstoqueRepository.ts
import { supabase } from '@/lib/supabase';
import { MovimentacaoEstoque, EstoqueResumo } from '../types/estoque';

export class EstoqueRepository {
  async buscarMovimentacoes(ingredienteId?: string): Promise<MovimentacaoEstoque[]> {
    let query = supabase
      .from('cozinha_estoque_movimentacoes')
      .select('*')
      .order('created_at', { ascending: false });

    if (ingredienteId) {
      query = query.eq('ingredienteId', ingredienteId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Erro ao buscar movimentações:', error);
      throw new Error('Falha ao carregar movimentações');
    }

    return data || [];
  }

  async registrarMovimentacao(movimentacao: Omit<MovimentacaoEstoque, 'id' | 'created_at'>): Promise<MovimentacaoEstoque> {
    const { data, error } = await supabase
      .from('cozinha_estoque_movimentacoes')
      .insert({
        ...movimentacao,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao registrar movimentação:', error);
      throw new Error('Falha ao registrar movimentação');
    }

    return data;
  }

  async buscarResumo(): Promise<EstoqueResumo[]> {
    const { data, error } = await supabase
      .from('cozinha_ingredientes')
      .select('id, nome, estoqueAtual, estoqueMinimo')
      .eq('ativo', true);

    if (error) {
      console.error('Erro ao buscar resumo do estoque:', error);
      throw new Error('Falha ao carregar resumo do estoque');
    }

    return (data || []).map(item => ({
      ingredienteId: item.id,
      ingredienteNome: item.nome,
      quantidadeAtual: item.estoqueAtual,
      estoqueMinimo: item.estoqueMinimo,
      status: item.estoqueAtual <= item.estoqueMinimo / 2 ? 'critico' :
              item.estoqueAtual <= item.estoqueMinimo ? 'baixo' : 'ok',
      valorTotal: 0 // Será calculado pelo Service
    }));
  }

  async atualizarEstoque(ingredienteId: string, quantidade: number): Promise<void> {
    const { error } = await supabase
      .from('cozinha_ingredientes')
      .update({ estoqueAtual: quantidade })
      .eq('id', ingredienteId);

    if (error) {
      console.error('Erro ao atualizar estoque:', error);
      throw new Error('Falha ao atualizar estoque');
    }
  }
}