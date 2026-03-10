"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import MobileBottomNav from "@/components/MobileBottomNav";
import {
  CIDADES_PADRAO,
  CLASSIFICADOS_CATEGORIAS,
  formatarDataRelativa,
  formatarPreco,
  normalizarTipo,
} from "@/lib/classificadosConfig";

export const dynamic = "force-dynamic";

type ClassificadoRow = {
  id: string | number;
  titulo?: string | null;
  descricao?: string | null;
  preco?: number | null;
  categoria?: string | null;
  subcategoria?: string | null;
  tipo_anuncio?: string | null;
  cidade?: string | null;
  bairro?: string | null;
  imagens?: string[] | null;
  imagem_url?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  status?: string | null;
  destaque?: boolean | null;
  condicao?: string | null;
  anunciante_nome?: string | null;
};

type AbaTipo = "todos" | "produto" | "servico";
type Ordenacao = "recentes" | "menor_preco" | "maior_preco" | "destaques";

const PAGE_SIZE = 60;

function primeiraImagem(item: ClassificadoRow) {
  if (Array.isArray(item.imagens) && item.imagens.length > 0) return item.imagens[0];
  if (item.imagem_url) return item.imagem_url;
  return null;
}

function badgeCondicao(condicao?: string | null) {
  const valor = (condicao || "").toLowerCase();
  if (!valor) return null;
  if (valor.includes("novo")) return "Novo";
  if (valor.includes("usad")) return "Usado";
  if (valor.includes("promo")) return "Promoção";
  return condicao;
}

export default function ClassificadosPage() {
  const [items, setItems] = useState<ClassificadoRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const [busca, setBusca] = useState("");
  const [tipoAba, setTipoAba] = useState<AbaTipo>("todos");
  const [categoria, setCategoria] = useState("Todas");
  const [cidade, setCidade] = useState("Todas");
  const [ordenacao, setOrdenacao] = useState<Ordenacao>("recentes");

  const carregar = useCallback(async () => {
    setLoading(true);
    setErro(null);

    const { data, error } = await supabase
      .from("classificados")
      .select(`
        id,
        titulo,
        descricao,
        preco,
        categoria,
        subcategoria,
        tipo_anuncio,
        cidade,
        bairro,
        imagens,
        imagem_url,
        created_at,
        updated_at,
        status,
        destaque,
        condicao,
        anunciante_nome
      `)
      .eq("status", "publicado")
      .order("destaque", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(PAGE_SIZE);

    if (error) {
      setErro(error.message || "Não foi possível carregar os classificados.");
      setItems([]);
      setLoading(false);
      return;
    }

    setItems((data || []) as ClassificadoRow[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    carregar();

    const channel = supabase
      .channel("classificados-publico-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "classificados" },
        async () => {
          await carregar();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [carregar]);

  const categoriasVisiveis = useMemo(() => {
    if (tipoAba === "todos") return CLASSIFICADOS_CATEGORIAS.map((c) => c.nome);

    return CLASSIFICADOS_CATEGORIAS
      .filter((c) => c.tipo === "ambos" || c.tipo === tipoAba)
      .map((c) => c.nome);
  }, [tipoAba]);

  const cidadesVisiveis = useMemo(() => {
    const vindasDoBanco = Array.from(
      new Set(
        items.map((i) => i.cidade?.trim()).filter((v): v is string => Boolean(v))
      )
    ).sort((a, b) => a.localeCompare(b, "pt-BR"));

    return Array.from(new Set([...CIDADES_PADRAO, ...vindasDoBanco]));
  }, [items]);

  const filtrados = useMemo(() => {
    let base = [...items];

    if (tipoAba !== "todos") {
      base = base.filter((item) => normalizarTipo(item.tipo_anuncio) === tipoAba);
    }

    if (categoria !== "Todas") {
      base = base.filter((item) => item.categoria === categoria);
    }

    if (cidade !== "Todas") {
      base = base.filter((item) => (item.cidade || "").trim() === cidade);
    }

    const termo = busca.trim().toLowerCase();

    if (termo) {
      base = base.filter((item) => {
        const texto = [
          item.titulo,
          item.descricao,
          item.categoria,
          item.subcategoria,
          item.cidade,
          item.bairro,
          item.anunciante_nome,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return texto.includes(termo);
      });
    }

    switch (ordenacao) {
      case "menor_preco":
        base.sort((a, b) => (a.preco ?? Number.MAX_SAFE_INTEGER) - (b.preco ?? Number.MAX_SAFE_INTEGER));
        break;
      case "maior_preco":
        base.sort((a, b) => (b.preco ?? 0) - (a.preco ?? 0));
        break;
      case "destaques":
        base.sort((a, b) => Number(Boolean(b.destaque)) - Number(Boolean(a.destaque)));
        break;
      case "recentes":
      default:
        base.sort((a, b) => {
          const ad = new Date(a.created_at || 0).getTime();
          const bd = new Date(b.created_at || 0).getTime();
          return bd - ad;
        });
        break;
    }

    return base;
  }, [items, tipoAba, categoria, cidade, busca, ordenacao]);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="border-b border-white/10 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.18),transparent_42%),linear-gradient(180deg,#020617_0%,#020617_100%)]">
        <div className="mx-auto max-w-7xl px-4 pb-8 pt-6 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <div className="mb-2 inline-flex items-center rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300">
                Classificados Valente Conecta
              </div>

              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Compre, venda e contrate com visual mais profissional
              </h1>

              <p className="mt-3 max-w-2xl text-sm text-slate-300 sm:text-base">
                Produtos e serviços organizados por categoria, com filtros rápidos,
                atualização em tempo real e experiência melhor no celular.
              </p>
            </div>

            <Link
              href="/classificados/publicar"
              className="hidden rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400 md:inline-flex"
            >
              Publicar anúncio
            </Link>
          </div>

          <div className="grid gap-3 md:grid-cols-12">
            <div className="md:col-span-5">
              <input
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar por produto, serviço, cidade ou anunciante"
                className="h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white placeholder:text-slate-400 outline-none transition focus:border-emerald-400/50 focus:bg-white/10"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 md:col-span-7 md:grid-cols-4">
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className="h-12 rounded-2xl border border-white/10 bg-white/5 px-3 text-sm text-white outline-none focus:border-emerald-400/50"
              >
                <option value="Todas" className="bg-slate-900">Todas categorias</option>
                {categoriasVisiveis.map((cat) => (
                  <option key={cat} value={cat} className="bg-slate-900">
                    {cat}
                  </option>
                ))}
              </select>

              <select
                value={cidade}
                onChange={(e) => setCidade(e.target.value)}
                className="h-12 rounded-2xl border border-white/10 bg-white/5 px-3 text-sm text-white outline-none focus:border-emerald-400/50"
              >
                <option value="Todas" className="bg-slate-900">Todas cidades</option>
                {cidadesVisiveis.map((c) => (
                  <option key={c} value={c} className="bg-slate-900">
                    {c}
                  </option>
                ))}
              </select>

              <select
                value={ordenacao}
                onChange={(e) => setOrdenacao(e.target.value as Ordenacao)}
                className="h-12 rounded-2xl border border-white/10 bg-white/5 px-3 text-sm text-white outline-none focus:border-emerald-400/50"
              >
                <option value="recentes" className="bg-slate-900">Mais recentes</option>
                <option value="destaques" className="bg-slate-900">Destaques</option>
                <option value="menor_preco" className="bg-slate-900">Menor preço</option>
                <option value="maior_preco" className="bg-slate-900">Maior preço</option>
              </select>

              <Link
                href="/classificados/publicar"
                className="flex h-12 items-center justify-center rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-3 text-sm font-medium text-emerald-300 transition hover:bg-emerald-400/20 md:hidden"
              >
                Anunciar agora
              </Link>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {[
              { label: "Todos", value: "todos" as AbaTipo },
              { label: "Produtos", value: "produto" as AbaTipo },
              { label: "Serviços", value: "servico" as AbaTipo },
            ].map((tab) => {
              const active = tipoAba === tab.value;

              return (
                <button
                  key={tab.value}
                  onClick={() => {
                    setTipoAba(tab.value);
                    setCategoria("Todas");
                  }}
                  className={`rounded-2xl px-4 py-2 text-sm font-medium transition ${
                    active
                      ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                      : "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-3 xl:grid-cols-4">
            {CLASSIFICADOS_CATEGORIAS.filter((cat) => {
              if (tipoAba === "todos") return true;
              return cat.tipo === "ambos" || cat.tipo === tipoAba;
            }).map((cat) => (
              <button
                key={cat.nome}
                onClick={() => setCategoria(cat.nome)}
                className={`rounded-3xl border p-4 text-left transition ${
                  categoria === cat.nome
                    ? "border-emerald-400/50 bg-emerald-400/10"
                    : "border-white/10 bg-white/[0.04] hover:bg-white/[0.08]"
                }`}
              >
                <div className="text-sm font-semibold">{cat.nome}</div>
                <div className="mt-1 text-xs text-slate-400">{cat.sublabel}</div>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">
              {loading ? "Carregando..." : `${filtrados.length} anúncio(s) encontrado(s)`}
            </h2>
            <p className="text-sm text-slate-400">
              Alterações aprovadas no painel aparecem aqui automaticamente para os usuários conectados.
            </p>
          </div>

          <button
            onClick={carregar}
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10"
          >
            Atualizar
          </button>
        </div>

        {erro ? (
          <div className="rounded-3xl border border-red-400/20 bg-red-500/10 p-5 text-sm text-red-200">
            {erro}
          </div>
        ) : loading ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.04]">
                <div className="h-48 animate-pulse bg-white/10" />
                <div className="space-y-3 p-4">
                  <div className="h-4 w-2/3 animate-pulse rounded bg-white/10" />
                  <div className="h-4 w-1/3 animate-pulse rounded bg-white/10" />
                  <div className="h-3 w-full animate-pulse rounded bg-white/10" />
                  <div className="h-3 w-4/5 animate-pulse rounded bg-white/10" />
                </div>
              </div>
            ))}
          </div>
        ) : filtrados.length === 0 ? (
          <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-8 text-center">
            <div className="text-lg font-semibold">Nenhum anúncio encontrado</div>
            <p className="mt-2 text-sm text-slate-400">
              Tente mudar os filtros, a cidade ou a categoria.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filtrados.map((item) => {
              const tipo = normalizarTipo(item.tipo_anuncio);
              const img = primeiraImagem(item);
              const cond = badgeCondicao(item.condicao);

              return (
                <article
                  key={String(item.id)}
                  className="group overflow-hidden rounded-[30px] border border-white/10 bg-white/[0.04] shadow-[0_10px_40px_rgba(0,0,0,0.18)] transition hover:-translate-y-1 hover:bg-white/[0.06]"
                >
                  <div className="relative">
                    <div className="h-52 w-full overflow-hidden bg-slate-900">
                      {img ? (
                        <img
                          src={img}
                          alt={item.titulo || "Anúncio"}
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-5xl text-slate-600">
                          {tipo === "servico" ? "🛠️" : "📦"}
                        </div>
                      )}
                    </div>

                    <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                      <span className="rounded-full bg-slate-950/80 px-3 py-1 text-[11px] font-medium text-white backdrop-blur">
                        {tipo === "servico" ? "Serviço" : "Produto"}
                      </span>

                      {item.destaque ? (
                        <span className="rounded-full bg-amber-400/90 px-3 py-1 text-[11px] font-semibold text-slate-950">
                          Destaque
                        </span>
                      ) : null}

                      {cond ? (
                        <span className="rounded-full bg-emerald-400/90 px-3 py-1 text-[11px] font-semibold text-slate-950">
                          {cond}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-slate-300">
                        {item.categoria || "Sem categoria"}
                      </span>

                      {item.subcategoria ? (
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-slate-400">
                          {item.subcategoria}
                        </span>
                      ) : null}
                    </div>

                    <h3 className="line-clamp-2 text-lg font-semibold leading-tight">
                      {item.titulo || "Anúncio sem título"}
                    </h3>

                    <div className="mt-2 text-2xl font-bold text-emerald-400">
                      {formatarPreco(item.preco)}
                    </div>

                    <p className="mt-3 line-clamp-2 text-sm text-slate-300">
                      {item.descricao || "Veja mais detalhes deste anúncio."}
                    </p>

                    <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
                      <span>
                        {[item.cidade, item.bairro].filter(Boolean).join(" • ") || "Local não informado"}
                      </span>
                      <span>{formatarDataRelativa(item.created_at)}</span>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <Link
                        href={`/classificados/${item.id}`}
                        className="flex h-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-sm font-medium text-white transition hover:bg-white/10"
                      >
                        Ver detalhes
                      </Link>

                      <Link
                        href={`/classificados/${item.id}`}
                        className="flex h-11 items-center justify-center rounded-2xl bg-emerald-500 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400"
                      >
                        {tipo === "servico" ? "Solicitar" : "Tenho interesse"}
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <MobileBottomNav />
    </main>
  );
}