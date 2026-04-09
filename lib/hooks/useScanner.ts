'use client'
import { useState } from 'react';
import { supabase } from '@/lib/supabase'; // Certifique-se de ter o cliente supabase configurado

export function useScanner(empresaId: string) {
  const [loading, setLoading] = useState(false);
  const [modalAberto, setModalAberto] = useState(false);
  const [codigoDesconhecido, setCodigoDesconhecido] = useState('');

  const processarBip = async (codigoLido: string) => {
    setLoading(true);
    
    // Chama a Function SQL que criamos no passo anterior
    const { data, error } = await supabase.rpc('buscar_produto_inteligente', {
      p_empresa_id: empresaId,
      p_codigo_lido: codigoLido
    });

    if (data && data.length > 0) {
      // PRODUTO ENCONTRADO (MASTER OU EQUIVALÊNCIA)
      const produto = data[0];
      setLoading(false);
      return { sucesso: true, produto };
    } else {
      // PRODUTO NÃO RECONHECIDO - ABRE O VÍNCULO MANUAL
      setCodigoDesconhecido(codigoLido);
      setModalAberto(true);
      setLoading(false);
      return { sucesso: false };
    }
  };

  return { processarBip, modalAberto, setModalAberto, codigoDesconhecido, loading };
}