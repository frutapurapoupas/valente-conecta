// app/admin-master/cozinha/repositories/IngredienteRepository.ts
import { supabase } from '@/lib/supabase';
import { Ingrediente, IngredienteInput } from '../types/ingrediente';

export class IngredienteRepository {
  async buscarTodos(): Promise<Ingrediente[]> {
    const { data, error } = await supabase
      .from('cozinha_ingredientes')
      .select('*')
      .order('nome', { ascending: true });

    if (error) {
      console.error('Erro ao buscar ingredientes:', error);
      throw new Error('Falha ao carregar ingredientes');
    }

    return data || [];
  }

  async buscarPorId(id: string): Promise<Ingrediente | null> {
    const { data, error } = await supabase
      .from('cozinha_ingredientes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Erro ao buscar ingrediente:', error);
      return null;
    }

    return data;
  }

  async buscarPorCategoria(categoria: string): Promise<Ingrediente[]> {
    const { data, error } = await supabase
      .from('cozinha_ingredientes')
      .select('*')
      .eq('categoria', categoria)
      .eq('ativo', true)
      .order('nome', { ascending: true });

    if (error) {
      console.error('Erro ao buscar ingredientes por categoria:', error);
      throw new Error('Falha ao carregar ingredientes da categoria');
    }

    return data || [];
  }

  async buscarPorFornecedor(fornecedorId: string): Promise<Ingrediente[]> {
    const { data, error } = await supabase
      .from('cozinha_ingredientes')
      .select('*')
      .eq('fornecedorId', fornecedorId)
      .eq('ativo', true);

    if (error) {
      console.error('Erro ao buscar ingredientes por fornecedor:', error);
      throw new Error('Falha ao carregar ingredientes do fornecedor');
    }

    return data || [];
  }

  async criar(ingrediente: IngredienteInput): Promise<Ingrediente> {
    const { data, error } = await supabase
      .from('cozinha_ingredientes')
      .insert({
        ...ingrediente,
        ativo: true,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar ingrediente:', error);
      throw new Error('Falha ao criar ingrediente');
    }

    return data;
  }

  async atualizar(id: string, ingrediente: Partial<IngredienteInput>): Promise<Ingrediente> {
    const { data, error } = await supabase
      .from('cozinha_ingredientes')
      .update({
        ...ingrediente,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar ingrediente:', error);
      throw new Error('Falha ao atualizar ingrediente');
    }

    return data;
  }

  async deletar(id: string): Promise<void> {
    const { error } = await supabase
      .from('cozinha_ingredientes')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao deletar ingrediente:', error);
      throw new Error('Falha ao deletar ingrediente');
    }
  }
}