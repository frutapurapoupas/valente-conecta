// Caminho: C:\valente_conecta\lib\hooks\useUsuariosRealtime.ts
//
// Escuta mudancas reais na tabela usuarios via Supabase Realtime (evento,
// nao polling) — dispara o callback so' quando alguem de fato se cadastra
// ou muda de status, com um pequeno debounce pra nao rechamar a API varias
// vezes numa rajada de eventos. Precisa de 030_usuarios_realtime.sql
// rodado (publica a tabela pro Realtime).

import { useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';

export function useUsuariosRealtime(onChange: () => void) {
  const callbackRef = useRef(onChange);
  callbackRef.current = onChange;

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout> | null = null;
    const dispararComDebounce = () => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => callbackRef.current(), 800);
    };

    const canal = supabase
      .channel('usuarios-admin-master')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'usuarios' }, dispararComDebounce)
      .subscribe();

    return () => {
      if (timeout) clearTimeout(timeout);
      supabase.removeChannel(canal);
    };
  }, []);
}
