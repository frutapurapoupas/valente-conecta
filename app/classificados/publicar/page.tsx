"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { CLASSIFICADOS_CATEGORIAS } from "@/lib/classificadosConfig";

type TipoAnuncio = "produto" | "servico";

export default function PublicarClassificadoPage() {
  const router = useRouter();

  const [tipoAnuncio, setTipoAnuncio] = useState<TipoAnuncio>("produto");
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [preco, setPreco] = useState("");
  const [categoria, setCategoria] = useState("");
  const [subcategoria, setSubcategoria] = useState("");
  const [cidade, setCidade] = useState("");
  const [bairro, setBairro] = useState("");
  const [imagemUrl, setImagemUrl] = useState("");
  const [condicao, setCondicao] = useState("");
  const [anuncianteNome, setAnuncianteNome] = useState("");

  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    const nome = localStorage.getItem("vc_indicador_nome") || "";
    if (nome) setAnuncianteNome(nome);
  }, []);

  const publicar = async () => {
    try {
      setErro(null);
      setMensagem(null);

      if (!titulo.trim()) {
        setErro("Informe o título do anúncio.");
        return;
      }

      if (!categoria) {
        setErro("Escolha uma categoria.");
        return;
      }

      if (!cidade.trim()) {
        setErro("Informe a cidade.");
        return;
      }

      setLoading(true);

      const { error } = await supabase.from("classificados").insert({
        titulo: titulo.trim(),
        descricao: descricao.trim() || null,
        preco: preco ? Number(preco.replace(",", ".")) : null,
        categoria,
        subcategoria: subcategoria.trim() || null,
        cidade: cidade.trim(),
        bairro: bairro.trim() || null,
        tipo_anuncio: tipoAnuncio,
        imagem_url: imagemUrl.trim() || null,
        condicao: condicao.trim() || null,
        anunciante_nome: anuncianteNome.trim() || null,
      });

      if (error) throw error;

      setMensagem("Anúncio enviado com sucesso.");
      setTimeout(() => {
        router.push("/classificados");
      }, 1200);
    } catch (e: any) {
      setErro(e?.message || "Não foi possível publicar o anúncio.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-6 shadow-[0_10px_40px_rgba(0,0,0,0.18)]">
          <div className="inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300">
            Publicar classificado
          </div>

          <h1 className="mt-4 text-3xl font-bold tracking-tight">Novo anúncio</h1>
          <p className="mt-2 text-sm text-slate-400">
            Preencha os dados abaixo para publicar seu produto ou serviço.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => setTipoAnuncio("produto")}
              className={`rounded-2xl px-4 py-3 text-sm font-semibold ${
                tipoAnuncio === "produto"
                  ? "bg-emerald-500 text-white"
                  : "border border-white/10 bg-white/5 text-white"
              }`}
            >
              Produto
            </button>
            <button
              onClick={() => setTipoAnuncio("servico")}
              className={`rounded-2xl px-4 py-3 text-sm font-semibold ${
                tipoAnuncio === "servico"
                  ? "bg-emerald-500 text-white"
                  : "border border-white/10 bg-white/5 text-white"
              }`}
            >
              Serviço
            </button>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <input
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Título do anúncio"
              className="h-12 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm outline-none"
            />
            <input
              value={anuncianteNome}
              onChange={(e) => setAnuncianteNome(e.target.value)}
              placeholder="Nome do anunciante"
              className="h-12 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm outline-none"
            />
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="h-12 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm outline-none"
            >
              <option value="" className="bg-slate-900">Escolha a categoria</option>
              {CLASSIFICADOS_CATEGORIAS.map((item) => (
                <option key={item.nome} value={item.nome} className="bg-slate-900">
                  {item.nome}
                </option>
              ))}
            </select>
            <input
              value={subcategoria}
              onChange={(e) => setSubcategoria(e.target.value)}
              placeholder="Subcategoria"
              className="h-12 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm outline-none"
            />
            <input
              value={cidade}
              onChange={(e) => setCidade(e.target.value)}
              placeholder="Cidade"
              className="h-12 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm outline-none"
            />
            <input
              value={bairro}
              onChange={(e) => setBairro(e.target.value)}
              placeholder="Bairro"
              className="h-12 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm outline-none"
            />
            <input
              value={preco}
              onChange={(e) => setPreco(e.target.value)}
              placeholder="Preço"
              className="h-12 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm outline-none"
            />
            <input
              value={condicao}
              onChange={(e) => setCondicao(e.target.value)}
              placeholder="Condição (novo, usado, promoção...)"
              className="h-12 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm outline-none"
            />
          </div>

          <div className="mt-4">
            <input
              value={imagemUrl}
              onChange={(e) => setImagemUrl(e.target.value)}
              placeholder="URL da imagem principal"
              className="h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm outline-none"
            />
          </div>

          <div className="mt-4">
            <textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Descrição do anúncio"
              rows={6}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none"
            />
          </div>

          {erro ? (
            <div className="mt-4 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {erro}
            </div>
          ) : null}

          {mensagem ? (
            <div className="mt-4 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
              {mensagem}
            </div>
          ) : null}

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={publicar}
              disabled={loading}
              className="rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-400 disabled:opacity-60"
            >
              {loading ? "Publicando..." : "Publicar anúncio"}
            </button>

            <button
              onClick={() => router.push("/classificados")}
              className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/10"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}