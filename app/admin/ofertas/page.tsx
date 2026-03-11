"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import { supabase } from "@/lib/supabaseClient";

type Oferta = {
  id: string;
  titulo?: string | null;
  descricao?: string | null;
  preco?: string | null;
  imagem_url?: string | null;
  whatsapp?: string | null;
  telefone?: string | null;
  created_at?: string | null;
};

const initialForm = {
  id: "",
  titulo: "",
  descricao: "",
  preco: "",
  imagem_url: "",
  whatsapp: "",
};

export default function AdminOfertasPage() {
  const [items, setItems] = useState<Oferta[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(initialForm);

  const carregar = useCallback(async () => {
    setLoading(true);

    const { data } = await supabase
      .from("ofertas")
      .select("*")
      .order("created_at", { ascending: false });

    setItems((data as Oferta[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    carregar();

    const channel = supabase
      .channel("realtime-admin-ofertas")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "ofertas" },
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
      titulo: form.titulo,
      descricao: form.descricao,
      preco: form.preco,
      imagem_url: form.imagem_url,
      whatsapp: form.whatsapp,
    };

    if (form.id) {
      await supabase.from("ofertas").update(payload).eq("id", form.id);
    } else {
      await supabase.from("ofertas").insert(payload);
    }

    setForm(initialForm);
    setSaving(false);
    await carregar();
  }

  async function excluir(id: string) {
    const ok = window.confirm("Deseja excluir esta oferta?");
    if (!ok) return;

    await supabase.from("ofertas").delete().eq("id", id);
    await carregar();
  }

  function editar(item: Oferta) {
    setForm({
      id: item.id,
      titulo: item.titulo || "",
      descricao: item.descricao || "",
      preco: item.preco || "",
      imagem_url: item.imagem_url || "",
      whatsapp: item.whatsapp || item.telefone || "",
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <AppShell
      title="Admin • Ofertas"
      subtitle="Cadastre, edite e exclua ofertas com atualização ao vivo."
    >
      <form onSubmit={salvar} className="card">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="section-title">
            {form.id ? "Editar oferta" : "Nova oferta"}
          </h2>
          {form.id ? <span className="badge">Modo edição</span> : null}
        </div>

        <div className="grid gap-3">
          <input
            placeholder="Título"
            value={form.titulo}
            onChange={(e) => setForm({ ...form, titulo: e.target.value })}
            required
          />

          <textarea
            placeholder="Descrição"
            value={form.descricao}
            onChange={(e) => setForm({ ...form, descricao: e.target.value })}
            rows={4}
          />

          <input
            placeholder="Preço"
            value={form.preco}
            onChange={(e) => setForm({ ...form, preco: e.target.value })}
          />

          <input
            placeholder="URL da imagem"
            value={form.imagem_url}
            onChange={(e) => setForm({ ...form, imagem_url: e.target.value })}
          />

          <input
            placeholder="WhatsApp"
            value={form.whatsapp}
            onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
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
          <div className="card">Carregando ofertas...</div>
        ) : items.length === 0 ? (
          <div className="card">Nenhuma oferta cadastrada.</div>
        ) : (
          <div className="grid-cards">
            {items.map((item) => (
              <div key={item.id} className="card">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold">{item.titulo || "Sem título"}</h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {item.descricao || "Sem descrição"}
                    </p>
                  </div>

                  {item.preco ? (
                    <span className="badge">{String(item.preco)}</span>
                  ) : null}
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