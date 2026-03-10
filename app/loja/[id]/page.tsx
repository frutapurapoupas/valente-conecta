"use client";

import MenuApp from "@/components/menuApp";
import Link from "next/link";
import { getSelectedCity, listOffersByCity } from "@/lib/conecta";
import { useEffect, useMemo, useState } from "react";

export default function OfertasPage() {
  const [ofertas, setOfertas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [selectedCity, setSelectedCityState] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);

      const city = getSelectedCity();
      setSelectedCityState(city);

      const res = await listOffersByCity(city || undefined);
      setOfertas(res.data || []);
      setLoading(false);
    }

    load();
  }, []);

  const ofertasFiltradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return ofertas;

    return ofertas.filter((item) => {
      return (
        (item.titulo || "").toLowerCase().includes(termo) ||
        (item.descricao || "").toLowerCase().includes(termo) ||
        (item.loja || "").toLowerCase().includes(termo)
      );
    });
  }, [busca, ofertas]);

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
            Veja promoções publicadas pelos comerciantes locais.
          </p>

          {!selectedCity && (
            <div className="mt-4 rounded-2xl border border-amber-500/20 bg-amber-950/20 px-4 py-3 text-sm text-amber-200">
              Nenhuma cidade selecionada. Vá em <strong>Cidade</strong> no menu
              para definir a cidade do teste.
            </div>
          )}

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
                key={item.offer_id}
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

                    <span className="rounded-full border border-cyan-500/20 bg-cyan-950/30 px-3 py-1 text-xs text-cyan-200">
                      {item.unlock_required
                        ? `Contato R$ ${Number(item.unlock_price || 1).toFixed(2)}`
                        : "Contato livre"}
                    </span>
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
                  </div>

                  <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-950/60 p-3">
                    <p className="text-xs text-slate-400">Loja</p>
                    <p className="mt-1 font-medium text-white">
                      {item.loja || "Loja parceira"}
                    </p>
                  </div>

                  <div className="mt-4">
                    <Link
                      href={`/loja/${encodeURIComponent(item.loja || "")}?offerId=${item.offer_id}`}
                      className="block rounded-2xl border border-cyan-500/20 bg-cyan-950/20 px-4 py-3 text-center text-sm font-semibold text-cyan-200 transition hover:bg-cyan-950/30"
                    >
                      Ver oferta e contato
                    </Link>
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