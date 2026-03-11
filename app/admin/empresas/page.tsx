"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import { supabase } from "@/lib/supabaseClient";

type Empresa = {
  id: string;
  nome?: string | null;
  categoria?: string | null;
  descricao?: string | null;
  telefone?: string | null;
  cidade?: string | null;
  created_at?: string | null;
};

const initialForm = {
  id: "",
  nome: "",
  categoria: "",
  descricao: "",
  telefone: "",
  cidade: "Valente",
};

export default function AdminEmpresasPage() {
  const [items, setItems] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(initialForm);

  const carregar = useCallback(async () => {
    setLoading(true);

    const { data } = await supabase
      .from("empresas")
      .select("*")
      .order("created_at", { ascending: false });

    setItems((data as Empresa[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    carregar();

    const channel = supabase
      .channel("realtime-admin-empresas")
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

  async function salvar(e: FormEvent) {
    e.preventDefault();
    setSaving(true);

    const payload = {
      nome: form.nome,
      categoria: form.categoria,
      descricao: form.descricao,
      telefone: form.telefone,
      cidade: form.cidade,
    };

    if (form.id) {
      await supabase.from("empresas").update(payload).eq("id", form.id);
    } else {
      await supabase.from("empresas").insert(payload);
    }

    setForm(initialForm);
    setSaving(false);
    await carregar();
  }

  async function excluir(id: string) {
    const ok = window.confirm("Deseja excluir esta empresa?");
    if (!ok) return;

    await supabase.from("empresas").delete().eq("id", id);
    await carregar();
  }

  function editar(item: Empresa) {
    setForm({
      id: item.id,
      nome: item.nome || "",
      categoria: item.categoria || "",
      descricao: item.descricao || "",
      telefone: item.telefone || "",
      cidade: item.cidade || "Valente",
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <AppShell
      title="Admin • Empresas"
      subtitle="Cadastro de parceiros e empresas com atualização ao vivo."
    >
      <form onSubmit={salvar} className="card">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="section-title">
            {form.id ? "Editar empresa" : "Nova empresa"}
          </h2>
          {form.id ? <span className="badge">Modo edição</span> : null}
        </div>

        <div className="grid gap-3">
          <input
            placeholder="Nome da empresa"
            value={form.nome}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
            required
          />

          <input
            placeholder="Categoria"
            value={form.categoria}
            onChange={(e) => setForm({ ...form, categoria: e.target.value })}
          />

          <textarea
            placeholder="Descrição"
            value={form.descricao}
            onChange={(e) => setForm({ ...form, descricao: e.target.value })}
            rows={4}
          />

          <input
            placeholder="Telefone / WhatsApp"
            value={form.telefone}
            onChange={(e) => setForm({ ...form, telefone: e.target.value })}
          />

          <input
            placeholder="Cidade"
            value={form.cidade}
            onChange={(e) => setForm({ ...form, cidade: e.target.value })}
          />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? "Salvando..." : form.id ? "Atualizar" : "Cadastrar"}
          </button>

          <button
            type="button"
            className="btn-secondary"
            onClick={() => setForm(initialForm)}
          >
            Limpar
          </button>
        </div>
      </form>

      <div className="mt-4">
        {loading ? (
          <div className="card">Carregando empresas...</div>
        ) : items.length === 0 ? (
          <div className="card">Nenhuma empresa cadastrada.</div>
        ) : (
          <div className="grid-cards">
            {items.map((item) => (
              <div key={item.id} className="card">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold">{item.nome || "Sem nome"}</h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {item.categoria || "Sem categoria"}
                    </p>
                    {item.descricao ? (
                      <p className="mt-2 text-sm text-slate-600">
                        {item.descricao}
                      </p>
                    ) : null}
                  </div>

                  {item.cidade ? <span className="badge">{item.cidade}</span> : null}
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => editar(item)}
                  >
                    Editar
                  </button>

                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => excluir(item.id)}
                  >
                    Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}