"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type Oferta = {
  id: string;
  titulo: string;
  descricao: string | null;
  empresa_id: string | null;
  preco_de: number | null;
  preco_por: number | null;
  imagem_url: string | null;
  validade: string | null;
  destaque: boolean;
  ativo: boolean;
};

type Empresa = {
  id: string;
  nome: string;
};

const initialForm = {
  titulo: "",
  descricao: "",
  empresa_id: "",
  preco_de: "",
  preco_por: "",
  imagem_url: "",
  validade: "",
  destaque: true,
  ativo: true,
};

export default function AdminOfertasPage() {
  const router = useRouter();

  const [lista, setLista] = useState<Oferta[]>([]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  useEffect(() => {
    async function init() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/admin/login");
        return;
      }

      await Promise.all([carregar(), carregarEmpresas()]);
      setLoading(false);
    }

    init();
  }, [router]);

  async function carregar() {
    setErro("");
    const { data, error } = await supabase
      .from("ofertas")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setErro(error.message);
      return;
    }

    setLista((data as Oferta[]) || []);
  }

  async function carregarEmpresas() {
    const { data } = await supabase
      .from("empresas")
      .select("id,nome")
      .order("nome", { ascending: true });

    setEmpresas((data as Empresa[]) || []);
  }

  function limparFormulario() {
    setForm(initialForm);
    setEditingId(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErro("");
    setSucesso("");

    const payload = {
      titulo: form.titulo,
      descricao: form.descricao || null,
      empresa_id: form.empresa_id || null,
      preco_de: form.preco_de ? Number(form.preco_de) : null,
      preco_por: form.preco_por ? Number(form.preco_por) : null,
      imagem_url: form.imagem_url || null,
      validade: form.validade || null,
      destaque: form.destaque,
      ativo: form.ativo,
    };

    let response;

    if (editingId) {
      response = await supabase.from("ofertas").update(payload).eq("id", editingId);
    } else {
      response = await supabase.from("ofertas").insert([payload]);
    }

    if (response.error) {
      setErro(response.error.message);
      setSaving(false);
      return;
    }

    setSucesso(editingId ? "Oferta atualizada com sucesso." : "Oferta cadastrada com sucesso.");
    limparFormulario();
    await carregar();
    setSaving(false);
  }

  function handleEdit(item: Oferta) {
    setEditingId(item.id);
    setForm({
      titulo: item.titulo || "",
      descricao: item.descricao || "",
      empresa_id: item.empresa_id || "",
      preco_de: item.preco_de?.toString() || "",
      preco_por: item.preco_por?.toString() || "",
      imagem_url: item.imagem_url || "",
      validade: item.validade || "",
      destaque: item.destaque ?? true,
      ativo: item.ativo ?? true,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(id: string) {
    const confirmar = window.confirm("Deseja realmente excluir esta oferta?");
    if (!confirmar) return;

    const { error } = await supabase.from("ofertas").delete().eq("id", id);

    if (error) {
      setErro(error.message);
      return;
    }

    await carregar();
  }

  function nomeEmpresa(id: string | null) {
    if (!id) return "Sem empresa vinculada";
    return empresas.find((e) => e.id === id)?.nome || "Empresa não encontrada";
  }

  return (
    <main className="min-h-screen bg-slate-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
              Admin / Ofertas
            </p>
            <h1 className="text-3xl font-bold text-slate-900 mt-2">Ofertas</h1>
          </div>

          <Link
            href="/admin/dashboard"
            className="rounded-xl bg-slate-900 text-white px-4 py-3 text-sm hover:bg-slate-800 transition"
          >
            Voltar ao dashboard
          </Link>
        </div>

        <div className="grid lg:grid-cols-[420px_1fr] gap-6">
          <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 h-fit">
            <h2 className="text-xl font-bold text-slate-900">
              {editingId ? "Editar oferta" : "Nova oferta"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4 mt-5">
              <input
                value={form.titulo}
                onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                placeholder="Título da oferta"
                required
                className="w-full rounded-xl border border-slate-300 px-4 py-3"
              />

              <textarea
                value={form.descricao}
                onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                placeholder="Descrição"
                rows={4}
                className="w-full rounded-xl border border-slate-300 px-4 py-3"
              />

              <select
                value={form.empresa_id}
                onChange={(e) => setForm({ ...form, empresa_id: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-4 py-3"
              >
                <option value="">Selecione a empresa</option>
                {empresas.map((empresa) => (
                  <option key={empresa.id} value={empresa.id}>
                    {empresa.nome}
                  </option>
                ))}
              </select>

              <input
                type="number"
                step="0.01"
                value={form.preco_de}
                onChange={(e) => setForm({ ...form, preco_de: e.target.value })}
                placeholder="Preço de"
                className="w-full rounded-xl border border-slate-300 px-4 py-3"
              />

              <input
                type="number"
                step="0.01"
                value={form.preco_por}
                onChange={(e) => setForm({ ...form, preco_por: e.target.value })}
                placeholder="Preço por"
                className="w-full rounded-xl border border-slate-300 px-4 py-3"
              />

              <input
                type="date"
                value={form.validade}
                onChange={(e) => setForm({ ...form, validade: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-4 py-3"
              />

              <input
                value={form.imagem_url}
                onChange={(e) => setForm({ ...form, imagem_url: e.target.value })}
                placeholder="URL da imagem"
                className="w-full rounded-xl border border-slate-300 px-4 py-3"
              />

              <label className="flex items-center gap-3 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={form.destaque}
                  onChange={(e) => setForm({ ...form, destaque: e.target.checked })}
                />
                Oferta em destaque
              </label>

              <label className="flex items-center gap-3 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={form.ativo}
                  onChange={(e) => setForm({ ...form, ativo: e.target.checked })}
                />
                Oferta ativa
              </label>

              {erro && (
                <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                  {erro}
                </div>
              )}

              {sucesso && (
                <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">
                  {sucesso}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-emerald-500 text-white px-5 py-3 text-sm font-medium hover:bg-emerald-600 transition disabled:opacity-60"
                >
                  {saving ? "Salvando..." : editingId ? "Atualizar" : "Salvar"}
                </button>

                <button
                  type="button"
                  onClick={limparFormulario}
                  className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-medium hover:bg-slate-50 transition"
                >
                  Limpar
                </button>
              </div>
            </form>
          </section>

          <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-xl font-bold text-slate-900">Ofertas cadastradas</h2>

            {loading ? (
              <p className="text-slate-500 mt-4">Carregando...</p>
            ) : lista.length === 0 ? (
              <p className="text-slate-500 mt-4">Nenhuma oferta cadastrada.</p>
            ) : (
              <div className="mt-5 space-y-4">
                {lista.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-slate-200 p-4 flex flex-col md:flex-row md:items-start md:justify-between gap-4"
                  >
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{item.titulo}</h3>
                      <p className="text-sm text-slate-600 mt-1">
                        {nomeEmpresa(item.empresa_id)}
                      </p>
                      {item.descricao && (
                        <p className="text-sm text-slate-700 mt-2">{item.descricao}</p>
                      )}
                      <div className="text-sm text-slate-500 mt-3 space-y-1">
                        <p>
                          Preço:{" "}
                          {item.preco_por != null ? `R$ ${item.preco_por}` : "Não informado"}
                        </p>
                        {item.preco_de != null && <p>De: R$ {item.preco_de}</p>}
                        {item.validade && <p>Validade: {item.validade}</p>}
                        <p>Status: {item.ativo ? "Ativa" : "Inativa"}</p>
                        <p>Destaque: {item.destaque ? "Sim" : "Não"}</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="rounded-xl bg-slate-900 text-white px-4 py-2 text-sm hover:bg-slate-800"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="rounded-xl bg-red-500 text-white px-4 py-2 text-sm hover:bg-red-600"
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}