"use client";

import MenuApp from "@/components/menuApp";
import { getSelectedCity, listCities, setSelectedCity } from "@/lib/conecta";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function EscolherCidadePage() {
  const [cities, setCities] = useState<any[]>([]);
  const [selected, setSelected] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    async function load() {
      const current = getSelectedCity();
      setSelected(current);

      const res = await listCities();
      setCities(res.data || []);
    }

    load();
  }, []);

  function handleSave() {
    if (!selected) {
      setMessage("Selecione uma cidade.");
      return;
    }

    setSelectedCity(selected);
    setMessage("Cidade salva com sucesso.");

    setTimeout(() => {
      router.push("/ofertas");
    }, 500);
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <MenuApp />

      <div className="mx-auto max-w-3xl px-4 py-6 space-y-6">
        <header className="rounded-3xl border border-cyan-500/20 bg-slate-900 p-6 shadow-2xl">
          <p className="text-sm uppercase tracking-[0.2em] text-cyan-300">
            Configuração inicial
          </p>
          <h1 className="mt-2 text-3xl font-bold">Escolher cidade</h1>
          <p className="mt-2 text-slate-300">
            Selecione a cidade para visualizar ofertas e comerciantes locais.
          </p>
        </header>

        <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
          <label className="block">
            <span className="mb-2 block text-sm text-slate-300">Cidade</span>
            <select
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
              className="w-full rounded-2xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm outline-none"
            >
              <option value="">Selecione</option>
              {cities.map((item) => (
                <option key={item.slug} value={item.slug}>
                  {item.nome}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            onClick={handleSave}
            className="mt-5 w-full rounded-2xl bg-cyan-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400"
          >
            Salvar cidade
          </button>

          {!!message && (
            <div className="mt-4 rounded-2xl border border-cyan-500/20 bg-cyan-950/30 px-4 py-3 text-sm text-cyan-100">
              {message}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}