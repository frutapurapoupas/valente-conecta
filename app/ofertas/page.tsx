"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

type Oferta = {
  id: string;
  titulo: string | null;
  categoria: string | null;
  cidade: string | null;
  loja: string | null;
  preco: number | null;
  preco_antigo: number | null;
  descricao: string | null;
  imagem_url: string | null;
  whatsapp: string | null;
  created_at?: string | null;
};

function onlyDigits(v: string) {
  return (v || "").replace(/\D+/g, "");
}

function brl(n: number | null | undefined) {
  if (n === null || n === undefined || Number.isNaN(Number(n))) return "";
  return Number(n).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function waLink(brNumber: string, text?: string) {
  const n = onlyDigits(brNumber);
  const msg = encodeURIComponent(text || "Olá! Vi sua oferta no Valente Conecta e quero mais informações.");
  return `https://wa.me/55${n}?text=${msg}`;
}

export default function OfertasPage() {
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [ofertas, setOfertas] = useState<Oferta[]>([]);

  const [q, setQ] = useState("");
  const [cidade, setCidade] = useState("Valente");
  const [categoria, setCategoria] = useState("Todas");
  const [onlyToday, setOnlyToday] = useState(false);

  const categorias = useMemo(() => {
    const set = new Set<string>();
    for (const o of ofertas) {
      const c = (o.categoria || "").trim();
      if (c) set.add(c);
    }
    return ["Todas", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [ofertas]);

  const cidades = useMemo(() => {
    const set = new Set<string>();
    for (const o of ofertas) {
      const c = (o.cidade || "").trim();
      if (c) set.add(c);
    }
    const arr = Array.from(set).sort((a, b) => a.localeCompare(b));
    if (arr.includes("Valente")) {
      return ["Valente", ...arr.filter((x) => x !== "Valente")];
    }
    return arr.length ? arr : ["Valente"];
  }, [ofertas]);

  const listaFiltrada = useMemo(() => {
    const needle = q.trim().toLowerCase();

    const todayKey = new Date().toISOString().slice(0, 10); // yyyy-mm-dd (UTC)
    // Para o "hoje" ficar coerente no BR (-03), fazemos uma chave local também:
    const localToday = new Date();
    const localKey = [
      localToday.getFullYear(),
      String(localToday.getMonth() + 1).padStart(2, "0"),
      String(localToday.getDate()).padStart(2, "0"),
    ].join("-");

    return ofertas.filter((o) => {
      const okCidade = !cidade || (o.cidade || "").toLowerCase() === cidade.toLowerCase();
      const okCategoria = categoria === "Todas" || (o.categoria || "") === categoria;

      if (!okCidade || !okCategoria) return false;

      if (onlyToday) {
        const created = (o.created_at || "").slice(0, 10);
        // aceita UTC ou local
        if (created !== todayKey && created !== localKey) return false;
      }

      if (!needle) return true;

      const hay = [
        o.titulo,
        o.categoria,
        o.cidade,
        o.loja,
        o.descricao,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return hay.includes(needle);
    });
  }, [ofertas, q, cidade, categoria, onlyToday]);

  useEffect(() => {
    let alive = true;

    async function load() {
      setLoading(true);
      setErro(null);

      // Tabela esperada: ofertas
      const { data, error } = await supabase
        .from("ofertas")
        .select(
          "id,titulo,categoria,cidade,loja,preco,preco_antigo,descricao,imagem_url,whatsapp,created_at"
        )
        .order("created_at", { ascending: false })
        .limit(200);

      if (!alive) return;

      if (error) {
        setErro(error.message);
        setOfertas([]);
      } else {
        setOfertas((data || []) as Oferta[]);
      }

      setLoading(false);
    }

    load();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!cidades.includes(cidade) && cidades.length) setCidade(cidades[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cidades.join("|")]);

  return (
    <main className="min-h-screen w-full bg-[#061627] text-white">
      {/* Background premium */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(1100px_700px_at_20%_10%,rgba(59,130,246,0.35),transparent_60%),radial-gradient(900px_650px_at_80%_30%,rgba(249,115,22,0.22),transparent_55%),radial-gradient(900px_650px_at_50%_95%,rgba(34,197,94,0.16),transparent_55%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/45 to-black/65" />
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8 md:py-10">
        {/* Header */}
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-white/10 ring-1 ring-white/15 backdrop-blur-md flex items-center justify-center">
              <span className="text-lg font-semibold">V</span>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
                Ofertas do dia • {cidade}
              </h1>
              <p className="text-sm text-white/70">
                Promoções, cupons e oportunidades da cidade — com contato direto.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/80 ring-1 ring-white/15 backdrop-blur">
              Painel do Usuário
            </span>
            <Link
              href="/cadastro"
              className="inline-flex items-center justify-center rounded-full bg-white/10 px-4 py-2 text-xs font-semibold text-white ring-1 ring-white/15 hover:bg-white/15 transition"
            >
              Sou parceiro (cadastrar)
            </Link>
          </div>
        </header>

        {/* Layout */}
        <section className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-12">
          {/* Sidebar */}
          <aside className="md:col-span-4">
            <div className="rounded-3xl bg-white/8 ring-1 ring-white/15 backdrop-blur-xl p-4 md:p-5 shadow-2xl shadow-black/30">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold">Valente Conecta</div>
                <Link
                  href="/"
                  className="text-xs text-white/75 hover:text-white underline underline-offset-4"
                >
                  Início
                </Link>
              </div>

              <div className="mt-4 space-y-3">
                <div>
                  <label className="text-xs text-white/70">Buscar oferta</label>
                  <div className="mt-2 flex items-center gap-2 rounded-2xl bg-black/25 ring-1 ring-white/10 px-3 py-3">
                    <span className="text-white/60">🔎</span>
                    <input
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      className="w-full bg-transparent outline-none placeholder:text-white/40 text-sm"
                      placeholder="Ex.: pizza, gás, mercado, farmácia..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="text-xs text-white/70">Cidade</label>
                    <select
                      value={cidade}
                      onChange={(e) => setCidade(e.target.value)}
                      className="mt-2 w-full rounded-2xl bg-black/25 ring-1 ring-white/10 px-3 py-3 text-sm outline-none"
                    >
                      {cidades.map((c) => (
                        <option key={c} value={c} className="bg-[#061627]">
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-white/70">Categoria</label>
                    <select
                      value={categoria}
                      onChange={(e) => setCategoria(e.target.value)}
                      className="mt-2 w-full rounded-2xl bg-black/25 ring-1 ring-white/10 px-3 py-3 text-sm outline-none"
                    >
                      {categorias.map((c) => (
                        <option key={c} value={c} className="bg-[#061627]">
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <label className="mt-2 flex items-center gap-3 rounded-2xl bg-white/6 ring-1 ring-white/10 px-3 py-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={onlyToday}
                    onChange={(e) => setOnlyToday(e.target.checked)}
                    className="h-4 w-4"
                  />
                  <span className="text-sm text-white/80">Somente hoje</span>
                </label>

                <div className="mt-2 rounded-2xl bg-white/6 ring-1 ring-white/10 p-3">
                  <div className="text-xs text-white/70">Resultado</div>
                  <div className="mt-1 text-sm font-semibold">
                    {loading ? "Carregando..." : `${listaFiltrada.length} ofertas`}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Link
                      href="/servicos"
                      className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/80 ring-1 ring-white/10 hover:bg-white/15 transition"
                    >
                      🧰 Serviços
                    </Link>
                    <Link
                      href="/classificados"
                      className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/80 ring-1 ring-white/10 hover:bg-white/15 transition"
                    >
                      🧾 Classificados
                    </Link>
                    <Link
                      href="/indicar"
                      className="rounded-full bg-emerald-500/90 px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-500 transition"
                    >
                      💚 Indicar e ganhar
                    </Link>
                  </div>
                </div>

                <div className="text-[11px] text-white/55 pt-2">
                  Dica: ofertas com WhatsApp permitem compra/pedido rápido.
                </div>
              </div>
            </div>
          </aside>

          {/* Conteúdo principal */}
          <div className="md:col-span-8">
            <div className="rounded-3xl bg-white/8 ring-1 ring-white/15 backdrop-blur-xl p-4 md:p-5 shadow-2xl shadow-black/30">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-base md:text-lg font-semibold">Promoções e oportunidades</h2>
                  <p className="text-sm text-white/70">
                    Selecione e compartilhe. Clique em WhatsApp para fechar a compra.
                  </p>
                </div>

                <div className="flex gap-2">
                  <Link
                    href="/cadastro"
                    className="inline-flex items-center justify-center rounded-2xl bg-white text-[#061627] px-4 py-2 text-sm font-semibold hover:bg-white/90 transition"
                  >
                    + Virar parceiro
                  </Link>
                </div>
              </div>

              {/* Erro */}
              {erro && (
                <div className="mt-4 rounded-2xl bg-amber-500/15 ring-1 ring-amber-500/30 p-4 text-sm">
                  <div className="font-semibold">Aviso (não quebrou, só falta configurar)</div>
                  <div className="mt-1 text-white/80">
                    Não consegui carregar a tabela <b>ofertas</b> no Supabase.
                    <br />
                    Erro: <span className="text-white/90">{erro}</span>
                  </div>
                  <div className="mt-3 text-white/75">
                    Quando você quiser, eu crio o SQL certinho da tabela e a página começa a listar automaticamente.
                  </div>
                </div>
              )}

              {/* Loading */}
              {loading && !erro && (
                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="rounded-3xl bg-white/6 ring-1 ring-white/10 p-4 animate-pulse"
                    >
                      <div className="h-36 w-full rounded-2xl bg-white/10" />
                      <div className="mt-3 h-4 w-2/3 rounded bg-white/10" />
                      <div className="mt-3 h-3 w-1/2 rounded bg-white/10" />
                      <div className="mt-4 h-10 w-full rounded bg-white/10" />
                    </div>
                  ))}
                </div>
              )}

              {/* Conteúdo */}
              {!loading && !erro && (
                <>
                  {/* Chips de categoria */}
                  <div className="mt-5 flex flex-wrap gap-2">
                    {categorias.slice(0, 10).map((c) => {
                      const active = c === categoria;
                      return (
                        <button
                          key={c}
                          onClick={() => setCategoria(c)}
                          className={`rounded-full px-3 py-1 text-xs ring-1 transition ${
                            active
                              ? "bg-white/15 text-white ring-white/20"
                              : "bg-white/8 text-white/75 ring-white/10 hover:bg-white/12 hover:text-white"
                          }`}
                        >
                          {c}
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                    {listaFiltrada.map((o) => (
                      <div
                        key={o.id}
                        className="rounded-3xl bg-black/20 ring-1 ring-white/12 overflow-hidden hover:bg-black/25 transition shadow-xl shadow-black/25"
                      >
                        {/* Imagem */}
                        <div className="relative h-40 w-full bg-white/5">
                          {o.imagem_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={o.imagem_url}
                              alt={o.titulo || "Oferta"}
                              className="h-full w-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-white/60">
                              <span className="text-3xl">🏷️</span>
                            </div>
                          )}

                          <div className="absolute left-3 top-3 flex gap-2">
                            {o.categoria && (
                              <span className="rounded-full bg-black/45 px-3 py-1 text-xs text-white ring-1 ring-white/15 backdrop-blur">
                                {o.categoria}
                              </span>
                            )}
                            {o.cidade && (
                              <span className="rounded-full bg-black/45 px-3 py-1 text-xs text-white ring-1 ring-white/15 backdrop-blur">
                                {o.cidade}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Conteúdo */}
                        <div className="p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="text-base font-semibold">
                                {o.titulo || "Oferta sem título"}
                              </div>
                              <div className="mt-1 text-sm text-white/70">
                                {o.loja ? o.loja : "Loja não informada"}
                              </div>
                            </div>

                            <div className="text-right">
                              {o.preco !== null && o.preco !== undefined ? (
                                <>
                                  <div className="text-base font-semibold">
                                    {brl(o.preco)}
                                  </div>
                                  {o.preco_antigo ? (
                                    <div className="text-xs text-white/55 line-through">
                                      {brl(o.preco_antigo)}
                                    </div>
                                  ) : (
                                    <div className="text-xs text-white/50"> </div>
                                  )}
                                </>
                              ) : (
                                <div className="text-xs text-white/60">Preço sob consulta</div>
                              )}
                            </div>
                          </div>

                          {o.descricao && (
                            <p className="mt-3 text-sm text-white/75 line-clamp-3">
                              {o.descricao}
                            </p>
                          )}

                          <div className="mt-4 flex flex-wrap gap-2">
                            {o.whatsapp ? (
                              <a
                                href={waLink(
                                  o.whatsapp,
                                  `Olá! Vi a oferta "${o.titulo || "oferta"}" no Valente Conecta. Ainda está disponível?`
                                )}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center justify-center rounded-2xl bg-emerald-500/90 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 transition shadow-lg shadow-emerald-500/20"
                              >
                                WhatsApp
                              </a>
                            ) : (
                              <span className="inline-flex items-center justify-center rounded-2xl bg-white/10 px-4 py-2 text-sm font-semibold text-white/70 ring-1 ring-white/15">
                                Sem WhatsApp
                              </span>
                            )}

                            <button
                              onClick={() => {
                                const text = [
                                  o.titulo || "Oferta",
                                  o.loja ? `- ${o.loja}` : "",
                                  o.cidade ? `(${o.cidade})` : "",
                                  o.preco ? `- ${brl(o.preco)}` : "",
                                ]
                                  .filter(Boolean)
                                  .join(" ");
                                navigator.clipboard?.writeText(text);
                              }}
                              className="inline-flex items-center justify-center rounded-2xl bg-white/10 px-4 py-2 text-sm font-semibold text-white ring-1 ring-white/15 hover:bg-white/15 transition"
                            >
                              Copiar
                            </button>

                            <button
                              onClick={() => {
                                const url = typeof window !== "undefined" ? window.location.href : "";
                                const text = `${o.titulo || "Oferta"} - ${o.loja || "Valente Conecta"}`;
                                if (navigator.share) {
                                  navigator.share({ title: "Valente Conecta", text, url }).catch(() => {});
                                } else {
                                  navigator.clipboard?.writeText(`${text} ${url}`);
                                }
                              }}
                              className="inline-flex items-center justify-center rounded-2xl bg-white/10 px-4 py-2 text-sm font-semibold text-white ring-1 ring-white/15 hover:bg-white/15 transition"
                            >
                              Compartilhar
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {listaFiltrada.length === 0 && (
                    <div className="mt-6 rounded-3xl bg-white/6 ring-1 ring-white/10 p-6 text-center">
                      <div className="text-base font-semibold">Nenhuma oferta encontrada</div>
                      <div className="mt-1 text-sm text-white/70">
                        Tente mudar a categoria, cidade ou a busca.
                      </div>
                      <div className="mt-4">
                        <Link
                          href="/cadastro"
                          className="inline-flex items-center justify-center rounded-2xl bg-white text-[#061627] px-4 py-2 text-sm font-semibold hover:bg-white/90 transition"
                        >
                          Quero anunciar ofertas
                        </Link>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            <footer className="mt-6 text-center text-xs text-white/55">
              © {new Date().getFullYear()} Valente Conecta • Ofertas locais em destaque.
            </footer>
          </div>
        </section>
      </div>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-3 left-1/2 -translate-x-1/2 w-[92%] rounded-3xl bg-black/45 ring-1 ring-white/15 backdrop-blur-xl shadow-2xl shadow-black/40">
        <div className="grid grid-cols-4 gap-1 p-2">
          <BottomNavItem href="/" label="Início" icon="🏠" />
          <BottomNavItem href="/ofertas" label="Ofertas" icon="🏷️" active />
          <BottomNavItem href="/servicos" label="Serviços" icon="🧰" />
          <BottomNavItem href="/classificados" label="Classif." icon="🧾" />
        </div>
      </nav>
    </main>
  );
}

function BottomNavItem({
  href,
  label,
  icon,
  active,
}: {
  href: string;
  label: string;
  icon: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex flex-col items-center justify-center rounded-2xl px-2 py-2 text-xs transition ${
        active
          ? "bg-white/12 ring-1 ring-white/15 text-white"
          : "text-white/70 hover:text-white hover:bg-white/10"
      }`}
    >
      <span className="text-base leading-none">{icon}</span>
      <span className="mt-1">{label}</span>
    </Link>
  );
}