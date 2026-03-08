"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Indicacao = {
  id: string;
  indicador_codigo: string;
  visitante_token: string | null;
  telefone_indicado: string | null;
  indicado_email: string | null;
  status: "pendente" | "confirmado";
  bonus: number | null;
  origem: string | null;
  created_at: string;
};

function sanitizeCode(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]/g, "")
    .toUpperCase()
    .slice(0, 20);
}

function createRandomCode() {
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `VC${random}`;
}

function getUserCode() {
  const saved = localStorage.getItem("vc_ref_code");
  if (saved) return sanitizeCode(saved);

  const newCode = createRandomCode();
  localStorage.setItem("vc_ref_code", newCode);
  return newCode;
}

export default function IndicarPage() {
  const [origin, setOrigin] = useState("");
  const [codigo, setCodigo] = useState("");
  const [codigoInput, setCodigoInput] = useState("");
  const [copiado, setCopiado] = useState(false);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [salvandoCodigo, setSalvandoCodigo] = useState(false);
  const [indicacoes, setIndicacoes] = useState<Indicacao[]>([]);

  useEffect(() => {
    setOrigin(window.location.origin);

    const code = getUserCode();
    setCodigo(code);
    setCodigoInput(code);
  }, []);

  useEffect(() => {
    if (!codigo) return;
    carregarIndicacoes(codigo);
  }, [codigo]);

  async function carregarIndicacoes(cod: string) {
    setCarregando(true);
    setErro("");

    const { data, error } = await supabase
      .from("indicacoes")
      .select("*")
      .eq("indicador_codigo", cod)
      .order("created_at", { ascending: false });

    if (error) {
      setErro("Não foi possível carregar suas indicações.");
      setCarregando(false);
      return;
    }

    setIndicacoes((data || []) as Indicacao[]);
    setCarregando(false);
  }

  async function salvarCodigoPersonalizado() {
    const clean = sanitizeCode(codigoInput);

    if (!clean || clean.length < 4) {
      setErro("Use um código com pelo menos 4 caracteres.");
      return;
    }

    setErro("");
    setSalvandoCodigo(true);

    localStorage.setItem("vc_ref_code", clean);
    setCodigo(clean);
    setCodigoInput(clean);

    await carregarIndicacoes(clean);
    setSalvandoCodigo(false);
  }

  const linkIndicacao = useMemo(() => {
    if (!origin || !codigo) return "";
    return `${origin}/cadastro?ref=${encodeURIComponent(codigo)}`;
  }, [origin, codigo]);

  const confirmadas = indicacoes.filter((item) => item.status === "confirmado");
  const pendentes = indicacoes.filter((item) => item.status === "pendente");

  const creditos = confirmadas.reduce(
    (acc, item) => acc + Number(item.bonus || 0),
    0
  );

  async function copiarLink() {
    if (!linkIndicacao) {
      setErro("O link ainda não foi gerado.");
      return;
    }

    try {
      await navigator.clipboard.writeText(linkIndicacao);
      setCopiado(true);
      setErro("");
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      setErro("Não foi possível copiar o link.");
    }
  }

  function compartilharWhatsApp() {
    if (!linkIndicacao) {
      setErro("O link ainda não foi gerado.");
      return;
    }

    const texto = encodeURIComponent(
      `Cadastre-se no APP VALENTE CONECTA pelo meu link:\n\n${linkIndicacao}`
    );

    window.open(`https://wa.me/?text=${texto}`, "_blank");
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-5 flex flex-wrap gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            ← Abrir app completo
          </Link>

          <Link
            href="/indicar"
            className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-100"
          >
            Programa de indicação
          </Link>
        </div>

        <section className="rounded-[28px] bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 p-8 text-white shadow-xl">
          <p className="text-xs uppercase tracking-[0.35em] text-cyan-300">
            Programa de indicação
          </p>
          <h1 className="mt-3 text-3xl font-bold">Indique e ganhe</h1>
          <p className="mt-3 text-slate-300">
            Ganhe <strong>R$1 em crédito</strong> para cada novo cadastro
            confirmado pelo seu link.
          </p>
        </section>

        <section className="mt-6 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Seu código de indicação
              </h2>
              <p className="mt-2 text-slate-600">
                Você pode manter o código automático ou personalizar com seu
                nome.
              </p>
            </div>

            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50"
            >
              Ir para o app completo
            </Link>
          </div>

          <div className="mt-5 flex flex-col gap-3 md:flex-row">
            <input
              value={codigoInput}
              onChange={(e) => setCodigoInput(sanitizeCode(e.target.value))}
              placeholder="Ex.: ARSENIO"
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              onClick={salvarCodigoPersonalizado}
              disabled={salvandoCodigo}
              className="rounded-xl bg-slate-950 px-5 py-3 font-medium text-white hover:bg-slate-800 disabled:opacity-60"
            >
              {salvandoCodigo ? "Salvando..." : "Salvar código"}
            </button>
          </div>

          <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-slate-500">
              Seu link correto para compartilhar
            </p>
            <p className="mt-2 break-all text-base font-semibold text-slate-900">
              {linkIndicacao || "Gerando link..."}
            </p>
          </div>

          <div className="mt-4 flex flex-col gap-3 md:flex-row">
            <button
              onClick={copiarLink}
              className="rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-white hover:bg-emerald-600"
            >
              {copiado ? "Link copiado" : "Copiar link"}
            </button>

            <button
              onClick={compartilharWhatsApp}
              className="rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-900 hover:bg-slate-50"
            >
              Enviar no WhatsApp
            </button>
          </div>

          {erro && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {erro}
            </div>
          )}
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Indicações confirmadas</p>
            <p className="mt-2 text-4xl font-bold text-slate-900">
              {carregando ? "..." : confirmadas.length}
            </p>
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Faltam concluir cadastro</p>
            <p className="mt-2 text-4xl font-bold text-amber-600">
              {carregando ? "..." : pendentes.length}
            </p>
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Créditos acumulados</p>
            <p className="mt-2 text-4xl font-bold text-emerald-600">
              {carregando ? "..." : `R$${creditos}`}
            </p>
          </div>
        </section>

        <section className="mt-6 grid gap-5 lg:grid-cols-2">
          <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="text-lg font-bold text-slate-900">
                Indicados que já se cadastraram
              </h3>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                {confirmadas.length} confirmados
              </span>
            </div>

            {confirmadas.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-500">
                Nenhum cadastro confirmado ainda.
              </div>
            ) : (
              <div className="space-y-3">
                {confirmadas.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                  >
                    <p className="font-semibold text-slate-900">
                      {item.indicado_email ||
                        item.telefone_indicado ||
                        "Cadastro confirmado"}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Status: confirmado
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="text-lg font-bold text-slate-900">
                Indicados pendentes
              </h3>
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                {pendentes.length} faltando
              </span>
            </div>

            {pendentes.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-500">
                Nenhum indicado pendente no momento.
              </div>
            ) : (
              <div className="space-y-3">
                {pendentes.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                  >
                    <p className="font-semibold text-slate-900">
                      {item.telefone_indicado || "Visitante pelo link"}
                    </p>
                    <p className="mt-1 text-xs font-medium text-amber-700">
                      Ainda não concluiu o cadastro.
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}