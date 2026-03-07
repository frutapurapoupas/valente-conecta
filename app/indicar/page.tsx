"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Indicacao = {
  id: string;
  indicador_codigo: string;
  telefone_indicado: string | null;
  indicado_email: string | null;
  status: "pendente" | "confirmado";
  bonus: number | null;
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
  const [copiado, setCopiado] = useState(false);
  const [indicacoes, setIndicacoes] = useState<Indicacao[]>([]);

  useEffect(() => {

    setOrigin(window.location.origin);

    const code = getUserCode();

    setCodigo(code);

    carregarIndicacoes(code);

  }, []);

  async function carregarIndicacoes(cod: string) {

    const { data } = await supabase
      .from("indicacoes")
      .select("*")
      .eq("indicador_codigo", cod)
      .order("created_at", { ascending: false });

    if (data) setIndicacoes(data as Indicacao[]);

  }

  const linkIndicacao = useMemo(() => {

    if (!origin || !codigo) return "";

    return `${origin}/cadastro?ref=${codigo}`;

  }, [origin, codigo]);

  async function copiarLink() {

    await navigator.clipboard.writeText(linkIndicacao);

    setCopiado(true);

    setTimeout(() => setCopiado(false), 2000);

  }

  function compartilharWhatsApp() {

    const texto = encodeURIComponent(
      `Cadastre-se no APP VALENTE CONECTA - o classificado da cidade:\n\n${linkIndicacao}`
    );

    window.open(`https://wa.me/?text=${texto}`, "_blank");

  }

  const confirmadas = indicacoes.filter(i => i.status === "confirmado");

  const pendentes = indicacoes.filter(i => i.status === "pendente");

  const creditos = confirmadas.length;

  return (

    <main className="min-h-screen bg-slate-100 px-4 py-10">

      <div className="mx-auto max-w-5xl">

        <Link href="/" className="text-sm text-slate-700">
          ← Voltar
        </Link>

        <section className="mt-4 rounded-3xl bg-slate-900 p-8 text-white">

          <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">
            Programa de indicação
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            Indique e ganhe
          </h1>

          <p className="mt-2 text-slate-300">
            Ganhe <strong>R$1 em crédito</strong> por cadastro confirmado.
          </p>

        </section>

        <section className="mt-6 bg-white rounded-3xl p-6 shadow">

          <h2 className="font-bold text-lg">
            Seu código de indicação
          </h2>

          <div className="mt-4 p-4 bg-slate-100 rounded-xl break-all">

            {linkIndicacao}

          </div>

          <div className="mt-4 flex gap-3">

            <button
              onClick={copiarLink}
              className="bg-emerald-500 text-white px-5 py-3 rounded-xl font-semibold"
            >
              {copiado ? "Link copiado" : "Copiar link"}
            </button>

            <button
              onClick={compartilharWhatsApp}
              className="border px-5 py-3 rounded-xl font-semibold"
            >
              Enviar no WhatsApp
            </button>

          </div>

        </section>

        <section className="mt-6 grid grid-cols-3 gap-4">

          <div className="bg-white rounded-2xl p-6 shadow text-center">

            <p className="text-sm text-slate-500">
              Indicações confirmadas
            </p>

            <p className="text-3xl font-bold">
              {confirmadas.length}
            </p>

          </div>

          <div className="bg-white rounded-2xl p-6 shadow text-center">

            <p className="text-sm text-slate-500">
              Pendentes
            </p>

            <p className="text-3xl font-bold text-amber-500">
              {pendentes.length}
            </p>

          </div>

          <div className="bg-white rounded-2xl p-6 shadow text-center">

            <p className="text-sm text-slate-500">
              Créditos
            </p>

            <p className="text-3xl font-bold text-emerald-600">
              R${creditos}
            </p>

          </div>

        </section>

      </div>

    </main>

  );

}