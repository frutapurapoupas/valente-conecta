"use client";

import MenuApp from "@/components/menuApp";
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";

type Empresa = {
  id: string;
  nome: string | null;
  whatsapp: string | null;
  city: string | null;
  plan_type: string | null;
  status: string | null;
  is_provisional: boolean | null;
};

const cidades = [
  { slug: "valente", nome: "Valente" },
  { slug: "coite", nome: "Conceição do Coité" },
  { slug: "santaluz", nome: "Santaluz" },
  { slug: "retirolandia", nome: "Retirolândia" },
];

const planos = [
  { value: "gratuito", label: "Gratuito" },
  { value: "basico", label: "Básico" },
  { value: "destaque", label: "Destaque" },
];

const statusList = [
  { value: "ativo", label: "Ativo" },
  { value: "inativo", label: "Inativo" },
  { value: "bloqueado", label: "Bloqueado" },
];

export default function AdminConectaPage() {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string>("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadEmpresas();
  }, []);

  async function loadEmpresas() {
    setLoading(true);
    const { data } = await supabase
      .from("empresas")
      .select("id, nome, whatsapp, city, plan_type, status, is_provisional")
      .order("nome", { ascending: true });

    setEmpresas((data || []) as Empresa[]);
    setLoading(false);
  }

  function updateLocalRow(id: string, field: keyof Empresa, value: any) {
    setEmpresas((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  }

  async function saveRow(item: Empresa) {
    setSavingId(item.id);
    setMessage("");

    const { error } = await supabase
      .from("empresas")
      .update({
        city: item.city,
        plan_type: item.plan_type,
        status: item.status,
      })
      .eq("id", item.id);

    if (error) {
      setMessage(error.message || "Erro ao salvar empresa.");
      setSavingId("");
      return;
    }

    setMessage(`Empresa "${item.nome}" atualizada com sucesso.`);
    setSavingId("");
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <MenuApp />

      <div className="mx-auto max-w-7xl px-4 py-6 space-y-6">
        <header className="rounded-3xl border border-cyan-500/20 bg-slate-900 p-6 shadow-2xl">
          <p className="text-sm uppercase tracking-[0.2em] text-cyan-300">
            Administração
          </p>
          <h1 className="mt-2 text-3xl font-bold">Admin Conecta</h1>
          <p className="mt-2 text-slate-300">
            Gerencie cidade, plano e status das empresas do Valente Conecta.
          </p>
        </header>

        {!!message && (
          <section className="rounded-3xl border border-cyan-500/20 bg-cyan-950/30 p-4 text-sm text-cyan-100 shadow-xl">
            {message}
          </section>
        )}

        {loading ? (
          <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
            Carregando empresas...
          </section>
        ) : (
          <section className="rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-xl">
            <h2 className="mb-4 text-xl font-semibold">Empresas cadastradas</h2>

            {empresas.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-700 p-5 text-slate-400">
                Nenhuma empresa encontrada.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[980px] text-sm">
                  <thead className="text-slate-400">
                    <tr className="border-b border-slate-800">
                      <th className="py-3 text-left">Empresa</th>
                      <th className="py-3 text-left">WhatsApp</th>
                      <th className="py-3 text-left">Cidade</th>
                      <th className="py-3 text-left">Plano</th>
                      <th className="py-3 text-left">Status</th>
                      <th className="py-3 text-left">Tipo</th>
                      <th className="py-3 text-left">Ação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {empresas.map((item) => (
                      <tr key={item.id} className="border-b border-slate-900">
                        <td className="py-3">
                          <div>
                            <p className="font-medium text-white">{item.nome}</p>
                            <p className="text-xs text-slate-500 break-all">{item.id}</p>
                          </div>
                        </td>

                        <td className="py-3">{item.whatsapp || "-"}</td>

                        <td className="py-3">
                          <select
                            value={item.city || ""}
                            onChange={(e) =>
                              updateLocalRow(item.id, "city", e.target.value)
                            }
                            className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm outline-none"
                          >
                            <option value="">Selecione</option>
                            {cidades.map((cidade) => (
                              <option key={cidade.slug} value={cidade.slug}>
                                {cidade.nome}
                              </option>
                            ))}
                          </select>
                        </td>

                        <td className="py-3">
                          <select
                            value={item.plan_type || "gratuito"}
                            onChange={(e) =>
                              updateLocalRow(item.id, "plan_type", e.target.value)
                            }
                            className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm outline-none"
                          >
                            {planos.map((plano) => (
                              <option key={plano.value} value={plano.value}>
                                {plano.label}
                              </option>
                            ))}
                          </select>
                        </td>

                        <td className="py-3">
                          <select
                            value={item.status || "ativo"}
                            onChange={(e) =>
                              updateLocalRow(item.id, "status", e.target.value)
                            }
                            className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm outline-none"
                          >
                            {statusList.map((status) => (
                              <option key={status.value} value={status.value}>
                                {status.label}
                              </option>
                            ))}
                          </select>
                        </td>

                        <td className="py-3">
                          {item.is_provisional ? (
                            <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs text-amber-300">
                              Provisória
                            </span>
                          ) : (
                            <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-300">
                              Completa
                            </span>
                          )}
                        </td>

                        <td className="py-3">
                          <button
                            type="button"
                            onClick={() => saveRow(item)}
                            disabled={savingId === item.id}
                            className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:opacity-60"
                          >
                            {savingId === item.id ? "Salvando..." : "Salvar"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}