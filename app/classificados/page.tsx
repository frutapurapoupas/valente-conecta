"use client";

import { useCallback, useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import { supabase } from "@/lib/supabaseClient";

type Classificado = {
  id: string;
  titulo?: string | null;
  descricao?: string | null;
  preco?: string | number | null;
  imagem_url?: string | null;
  telefone?: string | null;
  whatsapp?: string | null;
  created_at?: string | null;
};

export default function ClassificadosPage() {
  const [items, setItems] = useState<Classificado[]>([]);
  const [loading, setLoading] = useState(true);

  const carregar = useCallback(async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("classificados")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setItems(data as Classificado[]);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    carregar();

    const channel = supabase
      .channel("realtime-classificados-publicos")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "classificados" },
        () => {
          carregar();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [carregar]);

  return (
    <AppShell
      title="Classificados"
      subtitle="Listagem pública atualizada ao vivo."
    >
      <div className="mb-4 flex items-center justify-between">
        <span className="badge">Realtime ativo</span>
        <button onClick={carregar} className="btn-secondary">
          Atualizar
        </button>
      </div>

      {loading ? (
        <div className="card">Carregando classificados...</div>
      ) : items.length === 0 ? (
        <div className="card">Nenhum classificado cadastrado no momento.</div>
      ) : (
        <div className="grid-cards">
          {items.map((item) => {
            const contato = item.whatsapp || item.telefone || "";
            return (
              <div key={item.id} className="card">
                {item.imagem_url ? (
                  <img
                    src={item.imagem_url}
                    alt={item.titulo || "Classificado"}
                    className="mb-4 h-44 w-full rounded-2xl object-cover ring-1 ring-slate-200"
                  />
                ) : null}

                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold">
                      {item.titulo || "Anúncio sem título"}
                    </h2>
                    {item.descricao ? (
                      <p className="mt-1 text-sm text-slate-600">
                        {item.descricao}
                      </p>
                    ) : null}
                  </div>

                  {item.preco ? (
                    <span className="rounded-xl bg-blue-50 px-3 py-2 text-sm font-bold text-blue-700 ring-1 ring-blue-100">
                      {String(item.preco)}
                    </span>
                  ) : null}
                </div>

                {contato ? (
                  <div className="mt-4">
                    <a
                      href={`https://wa.me/${String(contato).replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-primary w-full"
                    >
                      Entrar em contato
                    </a>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}