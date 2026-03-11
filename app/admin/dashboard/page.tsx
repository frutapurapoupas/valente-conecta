"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import { supabase } from "@/lib/supabaseClient";

type DashboardCounts = {
  ofertas: number;
  classificados: number;
  empresas: number;
};

export default function AdminDashboardPage() {
  const [counts, setCounts] = useState<DashboardCounts>({
    ofertas: 0,
    classificados: 0,
    empresas: 0,
  });

  const [loading, setLoading] = useState(true);

  const carregar = useCallback(async () => {
    setLoading(true);

    const [ofertasRes, classificadosRes, empresasRes] = await Promise.all([
      supabase.from("ofertas").select("*", { count: "exact", head: true }),
      supabase
        .from("classificados")
        .select("*", { count: "exact", head: true }),
      supabase.from("empresas").select("*", { count: "exact", head: true }),
    ]);

    setCounts({
      ofertas: ofertasRes.count ?? 0,
      classificados: classificadosRes.count ?? 0,
      empresas: empresasRes.count ?? 0,
    });

    setLoading(false);
  }, []);

  useEffect(() => {
    carregar();

    const channel = supabase
      .channel("realtime-admin-dashboard")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "ofertas" },
        carregar
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "classificados" },
        carregar
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "empresas" },
        carregar
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [carregar]);

  return (
    <AppShell
      title="Painel Admin"
      subtitle="Resumo geral com atualização automática."
    >
      {loading ? (
        <div className="card">Carregando painel...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="card">
              <div className="text-sm text-slate-500">Ofertas</div>
              <div className="mt-2 text-3xl font-bold">{counts.ofertas}</div>
            </div>

            <div className="card">
              <div className="text-sm text-slate-500">Classificados</div>
              <div className="mt-2 text-3xl font-bold">
                {counts.classificados}
              </div>
            </div>

            <div className="card">
              <div className="text-sm text-slate-500">Empresas</div>
              <div className="mt-2 text-3xl font-bold">{counts.empresas}</div>
            </div>
          </div>

          <div className="mt-4 grid gap-3">
            <Link href="/admin/ofertas" className="btn-secondary">
              Gerenciar Ofertas
            </Link>
            <Link href="/admin/classificados" className="btn-secondary">
              Gerenciar Classificados
            </Link>
            <Link href="/admin/empresas" className="btn-secondary">
              Gerenciar Empresas
            </Link>
          </div>
        </>
      )}
    </AppShell>
  );
}