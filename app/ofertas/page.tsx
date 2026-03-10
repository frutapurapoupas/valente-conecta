"use client";

import MenuApp from "@/components/menuApp";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Oferta = {
  id: string;
  titulo: string | null;
  descricao: string | null;
  preco: number | null;
  imagem_url: string | null;
  empresa_id: string | null;
  created_at: string;
};

type Empresa = {
  id: string;
  nome: string | null;
  whatsapp?: string | null;
  plan_type?: string | null;
  status?: string | null;
};

export default function OfertasPage() {
  const [ofertas, setOfertas] = useState<Oferta[]>([]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);

      const [ofertasRes, empresasRes] = await Promise.all([
        supabase.from("ofertas").select("*").order("created_at", { ascending: false }),
        supabase
          .from("empresas")
          .select("id, nome, whatsapp, plan_type, status")
          .order("nome", { ascending: true }),
      ]);

      setOfertas((ofertasRes.data || []) as Oferta[]);
      setEmpresas((empresasRes.data || []) as Empresa[]);
      setLoading(false);
    }

    load();
  }, []);

  const ofertasComLoja = useMemo(() => {
    return ofertas.map((oferta) => {
      const empresa = empresas.find((e) => e.id === oferta.empresa_id);
      return {
        ...oferta,
        empresa_nome: empresa?.nome || "Loja parceira",
        empresa_whatsapp: empresa?.whatsapp || "",
        plan_type: empresa?.plan_type || "gratuito",
      };
    });
  }, [ofertas, empresas]);

  const ofertasFiltradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return ofertasComLoja;

    return ofertasComLoja.filter((item) => {
      return (
        (item.titulo || "").toLowerCase().includes(termo) ||
        (item.descricao || "").toLowerCase().includes(termo) ||
        (item.empresa_nome || "").toLowerCase().includes(termo)
      );
    });
  }, [busca, ofertasComLoja]);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <MenuApp />

      <div className="mx-auto max-w-7xl px-4 py-6 space-y-6">
        <header className="rounded-3xl border border-cyan-500/20 bg-slate-900 p-6 shadow-2xl">
          <p className="text-sm uppercase tracking-[0.2em] text-cyan-300">
            Ofertas da cidade
          </p>
          <h1 className="mt-2 text-3xl font-bold">Ofertas em destaque</h1>
          <p className="mt-2 max-w-3xl text-slate-300">
            Veja promoções publicadas pelos comerciantes da cidade e encontre
            oportunidades perto de você.
          </p>

          <div className="mt-5">
            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar oferta, produto ou loja"
              className="w-full rounded-2xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm outline-none"
            />
          </div>
        </header>

        {loading ? (
          <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
            Carregando ofertas...
          </section>
        ) : ofertasFiltradas.length === 0 ? (
          <section className="rounded-3xl border border-dashed border-slate-700 bg-slate-900 p-6 text-slate-400">
            Nenhuma oferta encontrada.
          </section>
        ) : (
          <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {ofertasFiltradas.map((item) => (
              <article
                key={item.id}
                className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-xl"
              >
                {!!item.imagem_url ? (
                  <img
                    src={item.imagem_url}
                    alt={item.titulo || "Oferta"}
                    className="h-56 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-56 items-center justify-center bg-slate-800 text-slate-500">
                    Sem imagem
                  </div>
                )}

                <div className="p-5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">
                      Oferta
                    </p>

                    {item.plan_type !== "gratuito" && (
                      <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs text-amber-300">
                        Destaque
                      </span>
                    )}
                  </div>

                  <h2 className="mt-2 text-xl font-bold text-white">
                    {item.titulo || "Oferta"}
                  </h2>

                  <p className="mt-2 min-h-[48px] text-sm text-slate-300">
                    {item.descricao || "Sem descrição."}
                  </p>

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <p className="text-2xl font-bold text-cyan-300">
                      {item.preco
                        ? `R$ ${Number(item.preco).toFixed(2)}`
                        : "Consulte"}
                    </p>

                    <span className="rounded-full border border-cyan-500/20 bg-cyan-950/30 px-3 py-1 text-xs text-cyan-200">
                      Oferta ativa
                    </span>
                  </div>

                  <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-950/60 p-3">
                    <p className="text-xs text-slate-400">Loja</p>
                    <p className="mt-1 font-medium text-white">
                      {item.empresa_nome}
                    </p>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <Link
                      href={`/loja/${item.empresa_id}`}
                      className="rounded-2xl border border-cyan-500/20 bg-cyan-950/20 px-4 py-3 text-center text-sm font-semibold text-cyan-200 transition hover:bg-cyan-950/30"
                    >
                      Ver loja
                    </Link>

                    {item.empresa_whatsapp ? (
                      <a
                        href={`https://wa.me/55${String(item.empresa_whatsapp).replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-2xl border border-emerald-500/20 bg-emerald-950/20 px-4 py-3 text-center text-sm font-semibold text-emerald-200 transition hover:bg-emerald-950/30"
                      >
                        WhatsApp
                      </a>
                    ) : (
                      <div className="rounded-2xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-center text-sm text-slate-400">
                        Sem WhatsApp
                      </div>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}