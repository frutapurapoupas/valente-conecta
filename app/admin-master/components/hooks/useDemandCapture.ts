import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export const useDemandCapture = (category: string) => {
  const [loading, setLoading] = useState(false);
  
  const handleCapture = async (data: any) => {
    setLoading(true);
    try {
      const { error } = await supabase.from('demands').insert({ 
        ...data, 
        category, 
        source_entry_point: category,
        created_at: new Date().toISOString() 
      });
      if (error) throw error;
      return { success: true };
    } catch (err) {
      console.error('Erro na captura:', err);
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  };
  return { handleCapture, loading };
};
