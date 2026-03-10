"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

const QRCode = dynamic(() => import("react-qr-code"), { ssr: false });

type IndicacaoRow = {
  id: string;
  nome: string | null;
  telefone: string | null;
  email: string | null;
  cidade: string | null;
  created_at: string | null;
  status_credito: string | null;
  cadastro_concluido: boolean | null;
};

type PerfilIndicador = {
  id: string;
  nome: string | null;
  telefone: string | null;
  codigo_indicacao: string | null;
};

function normalizarCodigo(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]/g, "")
    .toUpperCase()
    .slice(0, 20);
}

function gerarCodigoLocal() {
  const base = `VC${Date.now().toString(36)}${Math.random()
    .toString(36)
    .slice(2, 6)}`;
  return normalizarCodigo(base);
}

function formatarData(data?: string | null) {
  if (!data) return "-";
  const d = new Date(data);
  if (Number.isNaN(d.getTime())) return "-";
  return (
    d.toLocaleDateString("pt-BR") +
    " " +
    d.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    })
  );
}

function getBaseUrl() {
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }

  const envUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_VERCEL_URL ||
    "";

  if (envUrl) {
    return envUrl.startsWith("http") ? envUrl : `https://${envUrl}`;
  }

  return "http://localhost:3000";
}

export default function IndicarPage() {
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);

  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [perfil, setPerfil] = useState<PerfilIndicador | null>(null);
  const [indicacoes, setIndicacoes] = useState<IndicacaoRow[]>([]);

  const carregarTudo = async (nomeValor?: string, telefoneValor?: string) => {
    try {
      setLoading(true);
      setErro(null);

      const telefoneLimpo = (telefoneValor ?? telefone).replace(/\D/g, "");
      const nomeLimpo = (nomeValor ?? nome).trim();

      if (!telefoneLimpo && !nomeLimpo) {
        setLoading(false);
        return;
      }

      let perfilEncontrado: PerfilIndicador | null = null;

      if (telefoneLimpo) {
        const { data, error } = await supabase
          .from("indicadores")
          .select("id, nome, telefone, codigo_indicacao")
          .eq("telefone", telefoneLimpo)
          .limit(1)
          .maybeSingle();

        if (error) throw error;
        if (data) perfilEncontrado = data as PerfilIndicador;
      }

      if (!perfilEncontrado && nomeLimpo) {
        const { data, error } = await supabase
          .from("indicadores")
          .select("id, nome, telefone, codigo_indicacao")
          .ilike("nome", nomeLimpo)
          .limit(1)
          .maybeSingle();

        if (error) throw error;
        if (data) perfilEncontrado = data as PerfilIndicador;
      }

      if (!perfilEncontrado) {
        const novoCodigo = gerarCodigoLocal();

        const { data: criado, error: erroCriacao } = await supabase
          .from("indicadores")
          .insert({
            nome: nomeLimpo || null,
            telefone: telefoneLimpo || null,
            codigo_indicacao: novoCodigo,
          })
          .select("id, nome, telefone, codigo_indicacao")
          .single();

        if (erroCriacao) throw erroCriacao;
        perfilEncontrado = criado as PerfilIndicador;
      }

      if (!perfilEncontrado.codigo_indicacao) {
        const novoCodigo = gerarCodigoLocal();

        const { data: perfilAtualizado, error: erroCodigo } = await supabase
          .from("indicadores")
          .update({ codigo_indicacao: novoCodigo })
          .eq("id", perfilEncontrado.id)
          .select("id, nome, telefone, codigo_indicacao")
          .single();

        if (erroCodigo) throw erroCodigo;
        perfilEncontrado = perfilAtualizado as PerfilIndicador;
      }

      setPerfil(perfilEncontrado);

      const { data: listaIndicacoes, error: erroIndicacoes } = await supabase
        .from("indicacoes")
        .select(
          "id, nome, telefone, email, cidade, created_at, status_credito, cadastro_concluido"
        )
        .eq("codigo_indicador", perfilEncontrado.codigo_indicacao)
        .order("created_at", { ascending: false });

      if (erroIndicacoes) throw erroIndicacoes;

      setIndicacoes((listaIndicacoes || []) as IndicacaoRow[]);
    } catch (e: any) {
      setErro(e?.message || "Não foi possível carregar seus dados.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const nomeSalvo = localStorage.getItem("vc_indicador_nome") || "";
    const telefoneSalvo = localStorage.getItem("vc_indicador_telefone") || "";

    setNome(nomeSalvo);
    setTelefone(telefoneSalvo);

    if (nomeSalvo || telefoneSalvo) {
      void carregarTudo(nomeSalvo, telefoneSalvo);
    } else {
      setLoading(false);
    }
  }, []);

  const salvarIdentificacao = async () => {
    try {
      setErro(null);
      setSalvando(true);

      const telefoneLimpo = telefone.replace(/\D/g, "");
      const nomeLimpo = nome.trim();

      if (!nomeLimpo && !telefoneLimpo) {
        setErro("Informe pelo menos nome ou telefone.");
        return;
      }

      localStorage.setItem("vc_indicador_nome", nomeLimpo);
      localStorage.setItem("vc_indicador_telefone", telefoneLimpo);

      await carregarTudo(nomeLimpo, telefoneLimpo);
    } finally {
      setSalvando(false);
    }
  };

  const linkIndicacao = useMemo(() => {
    if (!perfil?.codigo_indicacao) return "";
    return `${getBaseUrl()}/cadastro?indicador=${encodeURIComponent(
      perfil.codigo_indicacao
    )}`;
  }, [perfil?.codigo_indicacao]);

  const resumo = useMemo(() => {
    const total = indicacoes.length;
    const concluidos = indicacoes.filter((i) =>
      Boolean(i.cadastro_concluido)
    ).length;
    const pendentes = total - concluidos;
    const creditados = indicacoes.filter(
      (i) => (i.status_credito || "").toLowerCase() === "creditado"
    ).length;

    return { total, concluidos, pendentes, creditados };
  }, [indicacoes]);

  const copiarLink = async () => {
    if (!linkIndicacao) return;

    try {
      await navigator.clipboard.writeText(linkIndicacao);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    } catch {
      setErro("Não consegui copiar automaticamente.");
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 pb-24 text-white">
      <section className="border-b border-white/10 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.18),transparent_42%),linear-gradient(180deg,#020617_0%,#020617_100%)]">
        <div className="mx-auto max-w-6xl px-4 pb-8 pt-6 sm:px-6 lg:px-8">
          <div className="inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300">
            Indique e acompanhe seus cadastros
          </div>

          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Seu painel de indicações
          </h1>

          <p className="mt-3 max-w-2xl text-sm text-slate-300 sm:text-base">
            Compartilhe seu link, acompanhe quem já concluiu o cadastro e
            mostre o QR Code para a pessoa escanear direto do seu celular.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1.05fr_1.45fr]">
          <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5 shadow-[0_10px_40px_rgba(0,0,0,0.18)]">
            <h2 className="text-lg font-semibold">
              Identificação do indicador
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Informe seu nome ou telefone para abrir seu painel.
            </p>

            <div className="mt-5 space-y-4">
              <div>
                <label className="mb-2 block text-sm text-slate-300">
                  Nome
                </label>
                <input
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Seu nome"
                  className="h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white placeholder:text-slate-400 outline-none focus:border-emerald-400/50 focus:bg-white/10"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-slate-300">
                  Telefone
                </label>
                <input
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  placeholder="Seu WhatsApp"
                  className="h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white placeholder:text-slate-400 outline-none focus:border-emerald-400/50 focus:bg-white/10"
                />
              </div>

              <button
                onClick={salvarIdentificacao}
                disabled={salvando}
                className="flex h-12 w-full items-center justify-center rounded-2xl bg-emerald-500 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {salvando ? "Abrindo painel..." : "Abrir meu painel"}
              </button>

              {erro ? (
                <div className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {erro}
                </div>
              ) : null}
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5 shadow-[0_10px_40px_rgba(0,0,0,0.18)]">
            {loading ? (
              <div className="space-y-4">
                <div className="h-6 w-44 animate-pulse rounded bg-white/10" />
                <div className="h-28 animate-pulse rounded-3xl bg-white/10" />
                <div className="h-52 animate-pulse rounded-3xl bg-white/10" />
              </div>
            ) : !perfil ? (
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 text-center">
                <div className="text-lg font-semibold">
                  Nenhum painel encontrado ainda
                </div>
                <p className="mt-2 text-sm text-slate-400">
                  Preencha seu nome ou telefone para localizar seus dados de
                  indicação.
                </p>
              </div>
            ) : (
              <div>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold">
                      {perfil.nome || "Indicador"}
                    </h2>
                    <p className="mt-1 text-sm text-slate-400">
                      Código de indicação:{" "}
                      <span className="font-medium text-emerald-300">
                        {perfil.codigo_indicacao || "-"}
                      </span>
                    </p>
                  </div>

                  <Link
                    href={linkIndicacao || "#"}
                    className="rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-sm font-medium text-emerald-300 transition hover:bg-emerald-400/20"
                  >
                    Abrir página de cadastro
                  </Link>
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
                    <div className="text-xs uppercase tracking-wide text-slate-400">
                      Total indicados
                    </div>
                    <div className="mt-2 text-3xl font-bold">
                      {resumo.total}
                    </div>
                  </div>

                  <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
                    <div className="text-xs uppercase tracking-wide text-slate-400">
                      Cadastros concluídos
                    </div>
                    <div className="mt-2 text-3xl font-bold text-emerald-400">
                      {resumo.concluidos}
                    </div>
                  </div>

                  <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
                    <div className="text-xs uppercase tracking-wide text-slate-400">
                      Ainda pendentes
                    </div>
                    <div className="mt-2 text-3xl font-bold text-amber-300">
                      {resumo.pendentes}
                    </div>
                  </div>

                  <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
                    <div className="text-xs uppercase tracking-wide text-slate-400">
                      Créditos gerados
                    </div>
                    <div className="mt-2 text-3xl font-bold text-sky-300">
                      {resumo.creditados}
                    </div>
                  </div>
                </div>

                <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                  <div className="rounded-[28px] border border-white/10 bg-slate-900/60 p-5">
                    <h3 className="text-lg font-semibold">
                      Seu link de convite
                    </h3>
                    <p className="mt-1 text-sm text-slate-400">
                      Envie pelo WhatsApp ou copie para compartilhar.
                    </p>

                    <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm break-all text-slate-200">
                      {linkIndicacao || "Link ainda não disponível"}
                    </div>

                    <div className="mt-4 flex flex-wrap gap-3">
                      <button
                        onClick={copiarLink}
                        className="rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400"
                      >
                        {copiado ? "Link copiado" : "Copiar link"}
                      </button>

                      <a
                        href={
                          linkIndicacao
                            ? `https://wa.me/?text=${encodeURIComponent(
                                `Faça seu cadastro por este link: ${linkIndicacao}`
                              )}`
                            : "#"
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10"
                      >
                        Enviar por WhatsApp
                      </a>
                    </div>
                  </div>

                  <div className="rounded-[28px] border border-white/10 bg-slate-900/60 p-5">
                    <h3 className="text-lg font-semibold">QR Code do convite</h3>
                    <p className="mt-1 text-sm text-slate-400">
                      A outra pessoa pode apontar a câmera para o seu celular e
                      abrir o cadastro direto.
                    </p>

                    <div className="mt-5 flex items-center justify-center rounded-[28px] border border-white/10 bg-white p-4">
                      {linkIndicacao ? (
                        <div className="flex min-h-[240px] w-full max-w-[240px] items-center justify-center">
                          <QRCode
                            value={linkIndicacao}
                            size={220}
                            bgColor="#FFFFFF"
                            fgColor="#000000"
                            style={{
                              width: "100%",
                              height: "auto",
                              display: "block",
                            }}
                          />
                        </div>
                      ) : (
                        <div className="flex h-[220px] w-[220px] items-center justify-center text-center text-sm text-slate-500">
                          QR indisponível
                        </div>
                      )}
                    </div>

                    <p className="mt-3 text-center text-xs text-slate-400">
                      Abra a câmera do celular convidado e aponte para este QR.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {perfil ? (
          <div className="mt-6 rounded-[28px] border border-white/10 bg-white/[0.04] p-5 shadow-[0_10px_40px_rgba(0,0,0,0.18)]">
            <div>
              <h2 className="text-lg font-semibold">Lista dos seus indicados</h2>
              <p className="mt-1 text-sm text-slate-400">
                Veja quem já concluiu o cadastro e quem ainda precisa finalizar.
              </p>
            </div>

            {indicacoes.length === 0 ? (
              <div className="mt-5 rounded-3xl border border-white/10 bg-white/[0.03] p-6 text-center text-sm text-slate-400">
                Você ainda não possui indicados cadastrados.
              </div>
            ) : (
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {indicacoes.map((item) => {
                  const concluido = Boolean(item.cadastro_concluido);
                  const credito = (item.status_credito || "").toLowerCase();

                  return (
                    <div
                      key={item.id}
                      className="rounded-[26px] border border-white/10 bg-slate-900/55 p-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="text-base font-semibold">
                            {item.nome || "Sem nome informado"}
                          </div>
                          <div className="mt-1 text-sm text-slate-400">
                            {[item.telefone, item.email]
                              .filter(Boolean)
                              .join(" • ") || "Sem contato informado"}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              concluido
                                ? "bg-emerald-400/90 text-slate-950"
                                : "bg-amber-300/90 text-slate-950"
                            }`}
                          >
                            {concluido
                              ? "Cadastro concluído"
                              : "Ainda não concluiu"}
                          </span>

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              credito === "creditado"
                                ? "bg-sky-300/90 text-slate-950"
                                : "bg-white/10 text-slate-200"
                            }`}
                          >
                            {credito === "creditado"
                              ? "Crédito gerado"
                              : "Sem crédito"}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 grid gap-3 sm:grid-cols-3">
                        <div className="rounded-2xl bg-white/5 p-3">
                          <div className="text-[11px] uppercase tracking-wide text-slate-400">
                            Cidade
                          </div>
                          <div className="mt-1 text-sm font-medium text-white">
                            {item.cidade || "-"}
                          </div>
                        </div>

                        <div className="rounded-2xl bg-white/5 p-3">
                          <div className="text-[11px] uppercase tracking-wide text-slate-400">
                            Data
                          </div>
                          <div className="mt-1 text-sm font-medium text-white">
                            {formatarData(item.created_at)}
                          </div>
                        </div>

                        <div className="rounded-2xl bg-white/5 p-3">
                          <div className="text-[11px] uppercase tracking-wide text-slate-400">
                            Status crédito
                          </div>
                          <div className="mt-1 text-sm font-medium text-white">
                            {item.status_credito || "-"}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : null}
      </section>
    </main>
  );
}