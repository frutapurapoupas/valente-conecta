import { supabase } from '@/lib/supabase/client';

export const comprasService = {
  async listar() {
    const { data, error } = await supabase
      .from('compras')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw new Error(error.message);
    return data || [];
  },

  async criar(dados: any) {
    const { data, error } = await supabase
      .from('compras')
      .insert([dados])
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },

  async atualizar(id: string, dados: any) {
    const { data, error } = await supabase
      .from('compras')
      .update(dados)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },

  async deletar(id: string) {
    const { error } = await supabase
      .from('compras')
      .delete()
      .eq('id', id);
    
    if (error) throw new Error(error.message);
    return true;
  }
};

