"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/app/context/AppContext";
import { supabase } from '@/lib/supabase';

export default function AdminDashboard() {
  const { isAdmin } = useApp();
  const [meuContador, setMeuContador] = useState(0);

  useEffect(() => {
    // Se o usuário não for admin, não executa a lógica de banco
    if (!isAdmin) return;

    // 1. Busca valor inicial (Snapshot único)
    const fetchCount = async () => {
      const { data, error } = await supabase
        .from('usuarios')
        .select('convites_count')
        .eq('id', '92ba677e-7b13-4298-bd37-7175afb211b4')
        .single();

      if (!error && data) {
        setMeuContador(data.convites_count || 0);
      }
    };

    fetchCount();

    // 2. Escuta mudanças em tempo real (Realtime)
    const channel = supabase
      .channel('db-changes')
      .on(
        'postgres_changes', 
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'usuarios',
          filter: 'id=eq.92ba677e-7b13-4298-bd37-7175afb211b4' 
        }, 
        (payload) => {
          setMeuContador(payload.new.convites_count);
        }
      )
      .subscribe();

    // 3. Cleanup para evitar vazamento de memória (Remover canal ao sair)
    return () => { 
      supabase.removeChannel(channel); 
    };
  }, [isAdmin]);

  return (
    <div className="p-8 text-center">
      <h1 className="text-2xl font-bold">Progresso Viral</h1>
      <div className="text-6xl my-4">{meuContador} / 50</div>
      <p>Convites realizados em tempo real.</p>
    </div>
  );
}