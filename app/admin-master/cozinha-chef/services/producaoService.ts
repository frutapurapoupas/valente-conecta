import { supabase } from '@/lib/supabase/client';

export const producaoService = {
  async listar() {
    const { data, error } = await supabase
      .from('producao')
      .select('*')
      .order('data_producao', { ascending: false });
    
    if (error) throw new Error(error.message);
    return data || [];
  },

  async criar(dados: any) {
    const { data, error } = await supabase
      .from('producao')
      .insert([dados])
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },

  async atualizar(id: string, dados: any) {
    const { data, error } = await supabase
      .from('producao')
      .update(dados)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },

  async deletar(id: string) {
    const { error } = await supabase
      .from('producao')
      .delete()
      .eq('id', id);
    
    if (error) throw new Error(error.message);
    return true;
  }
};

