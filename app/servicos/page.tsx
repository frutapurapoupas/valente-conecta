"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

type Empresa = {
  id: string;
  nome: string | null;
  categoria: string | null;
  cidade: string | null;
  whatsapp: string | null;
  endereco: string | null;
  descricao: string | null;
  created_at?: string | null;
};

function onlyDigits(v: string) {
  return (v || "").replace(/\D+/g, "");
}

function waLink(brNumber: string, text?: string) {
  // Espera número já com DDD (ex: 75999999999)
  const n = onlyDigits(brNumber);
  const msg = encodeURIComponent(text || "Olá! Encontrei você no Valente Conecta e gostaria de um orçamento.");
  return `https://wa.me/55${n}?text=${msg}`;
}

export default function ServicosPage() {
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [q, setQ] = useState("");
  const [cidade, setCidade] = useState("Valente");
  const [categoria, setCategoria] = useState("Todas");

  const categorias = useMemo(() => {
    const set = new Set<string>();
    for (const e of empresas) {
      const c = (e.categoria || "").trim();
      if (c) set.add(c);
    }
    return ["Todas", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [empresas]);

  const cidades = useMemo(() => {
    const set = new Set<string>();
    for (const e of empresas) {
      const c = (e.cidade || "").trim();
      if (c) set.add(c);
    }
    // Garante Valente primeiro se existir
    const arr = Array.from(set).sort((a, b) => a.localeCompare(b));
    if (arr.includes("Valente")) {
      return ["Valente", ...arr.filter((x) => x !== "Valente")];
    }
    return arr.length ? arr : ["Valente"];
  }, [empresas]);

  const listaFiltrada = useMemo(() => {
    const needle = q.trim().toLowerCase();

    return empresas.filter((e) => {
      const okCidade = !cidade || (e.cidade || "").toLowerCase() === cidade.toLowerCase();
      const okCategoria = categoria === "Todas" || (e.categoria || "") === categoria;

      if (!okCidade || !okCategoria) return false;

      if (!needle) return true;

      const hay = [
        e.nome,
        e.categoria,
        e.cidade,
        e.endereco,
        e.descricao,
        e.whatsapp,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return hay.includes(needle);
    });
  }, [empresas, q, cidade, categoria]);

  useEffect(() => {
    let alive = true;

    async function load() {
      setLoading(true);
      setErro(null);

      const { data, error } = await supabase
        .from("empresas")
        .select("id,nome,categoria,cidade,whatsapp,endereco,descricao,created_at")
        .order("created_at", { ascending: false })
        .limit(200);

      if (!alive) return;

      if (error) {
        setErro(error.message);
        setEmpresas([]);
      } else {
        setEmpresas((data || []) as Empresa[]);
      }

      setLoading(false);
    }

    load();
    return () => {
      alive = false;
    };
  }, []);

  // Ajusta cidade se não existir no dataset
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
                Serviços em {cidade}
              </h1>
              <p className="text-sm text-white/70">
                Encontre profissionais por categoria e fale direto no WhatsApp.
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

        {/* Layout: Sidebar + Conteúdo */}
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
                  <label className="text-xs text-white/70">Buscar</label>
                  <div className="mt-2 flex items-center gap-2 rounded-2xl bg-black/25 ring-1 ring-white/10 px-3 py-3">
                    <span className="text-white/60">🔎</span>
                    <input
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      className="w-full bg-transparent outline-none placeholder:text-white/40 text-sm"
                      placeholder="Ex.: pedreiro, eletricista, reforma..."
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

                <div className="mt-2 rounded-2xl bg-white/6 ring-1 ring-white/10 p-3">
                  <div className="text-xs text-white/70">Resultado</div>
                  <div className="mt-1 text-sm font-semibold">
                    {loading ? "Carregando..." : `${listaFiltrada.length} encontrados`}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Link
                      href="/ofertas"
                      className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/80 ring-1 ring-white/10 hover:bg-white/15 transition"
                    >
                      🏷️ Ofertas
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
                  Dica: clique em WhatsApp para pedir orçamento rápido.
                </div>
              </div>
            </div>
          </aside>

          {/* Conteúdo principal */}
          <div className="md:col-span-8">
            <div className="rounded-3xl bg-white/8 ring-1 ring-white/15 backdrop-blur-xl p-4 md:p-5 shadow-2xl shadow-black/30">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-base md:text-lg font-semibold">Profissionais e empresas</h2>
                  <p className="text-sm text-white/70">
                    Selecione uma categoria e fale direto com o profissional.
                  </p>
                </div>

                <div className="flex gap-2">
                  <Link
                    href="/cadastro"
                    className="inline-flex items-center justify-center rounded-2xl bg-white text-[#061627] px-4 py-2 text-sm font-semibold hover:bg-white/90 transition"
                  >
                    + Cadastrar empresa
                  </Link>
                </div>
              </div>

              {/* Estados */}
              {erro && (
                <div className="mt-4 rounded-2xl bg-red-500/15 ring-1 ring-red-500/30 p-4 text-sm">
                  <div className="font-semibold">Erro ao carregar do Supabase</div>
                  <div className="mt-1 text-white/80">{erro}</div>
                </div>
              )}

              {loading && !erro && (
                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="rounded-3xl bg-white/6 ring-1 ring-white/10 p-4 animate-pulse"
                    >
                      <div className="h-4 w-2/3 rounded bg-white/10" />
                      <div className="mt-3 h-3 w-1/2 rounded bg-white/10" />
                      <div className="mt-3 h-10 w-full rounded bg-white/10" />
                    </div>
                  ))}
                </div>
              )}

              {!loading && !erro && (
                <>
                  {/* Chips de categoria (rápido) */}
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

                  {/* Lista */}
                  <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                    {listaFiltrada.map((e) => (
                      <div
                        key={e.id}
                        className="rounded-3xl bg-black/20 ring-1 ring-white/12 p-4 hover:bg-black/25 transition shadow-xl shadow-black/25"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="text-base font-semibold">
                              {e.nome || "Sem nome"}
                            </div>
                            <div className="mt-1 text-sm text-white/70">
                              {e.categoria || "Categoria não informada"} •{" "}
                              {e.cidade || "Cidade não informada"}
                            </div>
                          </div>
                          <div className="h-10 w-10 rounded-2xl bg-white/10 ring-1 ring-white/15 flex items-center justify-center">
                            <span className="text-lg">🧰</span>
                          </div>
                        </div>

                        {e.descricao && (
                          <p className="mt-3 text-sm text-white/75 line-clamp-3">
                            {e.descricao}
                          </p>
                        )}

                        {e.endereco && (
                          <div className="mt-3 text-xs text-white/60">
                            📍 {e.endereco}
                          </div>
                        )}

                        <div className="mt-4 flex flex-wrap gap-2">
                          {e.whatsapp ? (
                            <a
                              href={waLink(
                                e.whatsapp,
                                `Olá! Vi seu anúncio no Valente Conecta (${e.categoria || "serviços"}). Pode me passar um orçamento?`
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
                                e.nome || "",
                                e.categoria ? `(${e.categoria})` : "",
                                e.cidade ? `- ${e.cidade}` : "",
                              ]
                                .filter(Boolean)
                                .join(" ");
                              navigator.clipboard?.writeText(text);
                            }}
                            className="inline-flex items-center justify-center rounded-2xl bg-white/10 px-4 py-2 text-sm font-semibold text-white ring-1 ring-white/15 hover:bg-white/15 transition"
                          >
                            Copiar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {listaFiltrada.length === 0 && (
                    <div className="mt-6 rounded-3xl bg-white/6 ring-1 ring-white/10 p-6 text-center">
                      <div className="text-base font-semibold">Nada encontrado</div>
                      <div className="mt-1 text-sm text-white/70">
                        Tente mudar a categoria, cidade ou o texto de busca.
                      </div>
                      <div className="mt-4">
                        <Link
                          href="/cadastro"
                          className="inline-flex items-center justify-center rounded-2xl bg-white text-[#061627] px-4 py-2 text-sm font-semibold hover:bg-white/90 transition"
                        >
                          Cadastrar meu serviço
                        </Link>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            <footer className="mt-6 text-center text-xs text-white/55">
              © {new Date().getFullYear()} Valente Conecta • Serviços locais valorizados.
            </footer>
          </div>
        </section>
      </div>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-3 left-1/2 -translate-x-1/2 w-[92%] rounded-3xl bg-black/45 ring-1 ring-white/15 backdrop-blur-xl shadow-2xl shadow-black/40">
        <div className="grid grid-cols-4 gap-1 p-2">
          <BottomNavItem href="/" label="Início" icon="🏠" />
          <BottomNavItem href="/ofertas" label="Ofertas" icon="🏷️" />
          <BottomNavItem href="/servicos" label="Serviços" icon="🧰" active />
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