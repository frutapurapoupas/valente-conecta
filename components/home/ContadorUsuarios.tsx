"use client";

// Caminho: C:\valente_conecta\components\home\ContadorUsuarios.tsx
//
// Total de usuários cadastrados no app, atualizado ao vivo (Supabase
// Realtime, mesmo hook já usado no admin master — lib/hooks/useUsuariosRealtime.ts).
// Fica visível a todos na home, logo abaixo do slogan.

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useUsuariosRealtime } from "@/lib/hooks/useUsuariosRealtime";

export function ContadorUsuarios() {
  const [total, setTotal] = useState<number | null>(null);

  const carregarTotal = async () => {
    const { count } = await supabase.from("usuarios").select("id", { count: "exact", head: true });
    if (count !== null) setTotal(count);
  };

  useEffect(() => {
    carregarTotal();
  }, []);

  useUsuariosRealtime(carregarTotal);

  if (total === null) return null;

  return (
    <p className="text-[10px] text-blue-600 font-semibold flex items-center gap-1 mt-0.5">
      <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
      {total.toLocaleString("pt-BR")} {total === 1 ? "pessoa conectada" : "pessoas conectadas"}
    </p>
  );
}
