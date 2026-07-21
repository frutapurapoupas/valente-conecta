// app/cozinha/repositories/ProdutoRepository.ts
import { supabase } from '@/lib/supabase';
import { Produto, ProdutoInput } from '../types/produto';

export class ProdutoRepository {
  async buscarTodos(): Promise<Produto[]> {
    try {
      const { data, error } = await supabase
        .from('cozinha_produtos')
        .select('*')
        .order('nome', { ascending: true });

      if (error) {
        console.error('Erro ao buscar produtos:', error);
        // Se a tabela não existir, retorna array vazio em vez de lançar erro
        if (error.code === 'PGRST116') {
          console.warn('Tabela cozinha_produtos não encontrada, retornando array vazio');
          return [];
        }
        throw new Error('Falha ao carregar produtos');
      }

      return data || [];
    } catch (err) {
      console.error('Erro no repository ao buscar produtos:', err);
      // Retorna array vazio em caso de erro para não quebrar a UI
      return [];
    }
  }

  async buscarPorId(id: string): Promise<Produto | null> {
    const { data, error } = await supabase
      .from('cozinha_produtos')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Erro ao buscar produto:', error);
      return null;
    }

    return data;
  }

  async buscarPorCategoria(categoria: string): Promise<Produto[]> {
    const { data, error } = await supabase
      .from('cozinha_produtos')
      .select('*')
      .eq('categoria', categoria)
      .eq('ativo', true)
      .order('nome', { ascending: true });

    if (error) {
      console.error('Erro ao buscar produtos por categoria:', error);
      throw new Error('Falha ao carregar produtos da categoria');
    }

    return data || [];
  }

  async criar(produto: ProdutoInput): Promise<Produto> {
    const { data, error } = await supabase
      .from('cozinha_produtos')
      .insert({
        ...produto,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar produto:', error);
      throw new Error('Falha ao criar produto');
    }

    return data;
  }

  async atualizar(id: string, produto: Partial<ProdutoInput>): Promise<Produto> {
    const { data, error } = await supabase
      .from('cozinha_produtos')
      .update({
        ...produto,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar produto:', error);
      throw new Error('Falha ao atualizar produto');
    }

    return data;
  }

  async deletar(id: string): Promise<void> {
    const { error } = await supabase
      .from('cozinha_produtos')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao deletar produto:', error);
      throw new Error('Falha ao deletar produto');
    }
  }
}