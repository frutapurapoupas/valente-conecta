"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Publicacao = {
  id: string;
  tipo: string | null;
  categoria: string | null;
  titulo: string | null;
  descricao: string | null;
  preco: number | null;
  nome_contato: string | null;
  telefone: string | null;
  whatsapp: string | null;
  cidade: string | null;
  foto_url: string | null;
  status: string | null;
  created_at: string | null;
  modo_contato: string | null;
  valor_desbloqueio: number | null;
  liberar_contato_automatico: boolean | null;
  exibir_contato: boolean | null;
};

export default function PublicacoesPage() {
  const [itens, setItens] = useState<Publicacao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    carregarPublicacoes();
  }, []);

  async function carregarPublicacoes() {
    setCarregando(true);
    setErro("");

    const { data, error } = await supabase
      .from("publicacoes_app")
      .select("*")
      .eq("status", "aprovado")
      .order("created_at", { ascending: false });

    if (error) {
      setErro("Não foi possível carregar as publicações.");
      setCarregando(false);
      return;
    }

    setItens((data || []) as Publicacao[]);
    setCarregando(false);
  }

  function renderContato(item: Publicacao) {
    const modo = item.modo_contato || "livre";
    const exibirContato = item.exibir_contato !== false;

    if (!exibirContato || modo === "bloqueado") {
      return (
        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
          <div className="font-semibold text-slate-800">
            Contato indisponível no momento.
          </div>
        </div>
      );
    }

    if (modo === "pagamento") {
      return (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <div className="text-sm font-semibold text-amber-800">
            Desbloqueie o contato por R$
            {Number(item.valor_desbloqueio || 0).toFixed(2)} (PIX ou cartão débito).
          </div>

          <button
            type="button"
            className="mt-3 rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600"
          >
            Desbloquear contato
          </button>
        </div>
      );
    }

    return (
      <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-slate-700">
        <div>
          <strong>Nome:</strong> {item.nome_contato || "-"}
        </div>
        <div>
          <strong>Telefone:</strong> {item.telefone || "-"}
        </div>
        <div>
          <strong>WhatsApp:</strong> {item.whatsapp || "-"}
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Publicações</h1>
          <div className="mt-2 text-slate-600">
            Serviços, produtos e classificados publicados no app.
          </div>
        </div>

        {erro && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {erro}
          </div>
        )}

        {carregando ? (
          <div className="rounded-2xl bg-white p-8 text-slate-500 shadow">
            Carregando publicações...
          </div>
        ) : itens.length === 0 ? (
          <div className="rounded-2xl bg-white p-8 text-slate-500 shadow">
            Nenhuma publicação aprovada encontrada.
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {itens.map((item) => (
              <article
                key={item.id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
              >
                {item.foto_url ? (
                  <img
                    src={item.foto_url}
                    alt={item.titulo || "Imagem da publicação"}
                    className="h-52 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-52 items-center justify-center bg-slate-100 text-sm text-slate-400">
                    Sem foto
                  </div>
                )}

                <div className="p-5">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase text-slate-700">
                      {item.categoria || "sem categoria"}
                    </span>

                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase text-blue-700">
                      {item.tipo || "anúncio"}
                    </span>
                  </div>

                  <h2 className="text-xl font-bold text-slate-900">
                    {item.titulo || "Sem título"}
                  </h2>

                  <div className="mt-2 text-sm leading-6 text-slate-600">
                    {item.descricao || "Sem descrição"}
                  </div>

                  <div className="mt-4 space-y-1 text-sm text-slate-700">
                    <div>
                      <strong>Preço:</strong>{" "}
                      {item.preco !== null && item.preco !== undefined
                        ? `R$ ${item.preco}`
                        : "A combinar"}
                    </div>
                    <div>
                      <strong>Cidade:</strong> {item.cidade || "-"}
                    </div>
                  </div>

                  {renderContato(item)}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}