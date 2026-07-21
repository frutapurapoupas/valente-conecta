// app/cozinha/repositories/CardapioRepository.ts
import { supabase } from '@/lib/supabase';
import { CardapioItem, CardapioInput } from '../types/cardapio';

export class CardapioRepository {
  async buscarTodos(): Promise<CardapioItem[]> {
    const { data, error } = await supabase
      .from('cozinha_cardapio')
      .select('*, produto:cozinha_produtos(*)')
      .eq('ativo', true)
      .order('dia', { ascending: true });

    if (error) {
      console.error('Erro ao buscar cardápio:', error);
      throw new Error('Falha ao carregar cardápio');
    }

    return data || [];
  }

  async buscarPorDia(dia: string): Promise<CardapioItem[]> {
    const { data, error } = await supabase
      .from('cozinha_cardapio')
      .select('*, produto:cozinha_produtos(*)')
      .eq('dia', dia)
      .eq('ativo', true);

    if (error) {
      console.error('Erro ao buscar cardápio do dia:', error);
      throw new Error('Falha ao carregar cardápio do dia');
    }

    return data || [];
  }

  async adicionar(item: CardapioInput): Promise<CardapioItem> {
    const { data, error } = await supabase
      .from('cozinha_cardapio')
      .insert({
        ...item,
        ativo: item.ativo ?? true
      })
      .select('*, produto:cozinha_produtos(*)')
      .single();

    if (error) {
      console.error('Erro ao adicionar item ao cardápio:', error);
      throw new Error('Falha ao adicionar item ao cardápio');
    }

    return data;
  }

  async remover(id: string): Promise<void> {
    const { error } = await supabase
      .from('cozinha_cardapio')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao remover item do cardápio:', error);
      throw new Error('Falha ao remover item do cardápio');
    }
  }

  async atualizar(id: string, dados: Partial<CardapioInput>): Promise<CardapioItem> {
    const { data, error } = await supabase
      .from('cozinha_cardapio')
      .update(dados)
      .eq('id', id)
      .select('*, produto:cozinha_produtos(*)')
      .single();

    if (error) {
      console.error('Erro ao atualizar item do cardápio:', error);
      throw new Error('Falha ao atualizar item do cardápio');
    }

    return data;
  }
}