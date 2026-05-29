"use client";
import { useEffect, useState } from "react";
import { useApp } from "@/app/context/AppContext";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export default function AdminDashboard() {
  const { isAdmin } = useApp();
  const [meuContador, setMeuContador] = useState(0);

  useEffect(() => {
    if (!isAdmin) return;

    // Busca valor inicial
    supabase.from('usuarios')
      .select('convites_count')
      .eq('id', '92ba677e-7b13-4298-bd37-7175afb211b4')
      .single()
      .then(({ data }) => setMeuContador(data?.convites_count || 0));

    // Escuta mudanças em tempo real
    const channel = supabase
      .channel('db-changes')
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'usuarios',
        filter: 'id=eq.92ba677e-7b13-4298-bd37-7175afb211b4' 
      }, payload => {
        setMeuContador(payload.new.convites_count);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [isAdmin]);

  return (
    <div className="p-8 text-center">
      <h1 className="text-2xl font-bold">Progresso Viral</h1>
      <div className="text-6xl my-4">{meuContador} / 50</div>
      <p>Convites realizados em tempo real.</p>
    </div>
  );
}