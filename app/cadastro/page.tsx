"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

function limparTelefone(valor: string) {
  return valor.replace(/\D/g, "");
}

export default function CadastroPage() {
  const params = useSearchParams();
  const codigoIndicador = params.get("indicador") || "";

  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cidade, setCidade] = useState("");
  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);

  const telefoneLimpo = useMemo(() => limparTelefone(telefone), [telefone]);

  async function salvarCadastro() {
    try {
      setErro(null);

      if (!nome.trim()) {
        setErro("Informe o nome.");
        return;
      }

      if (!telefoneLimpo) {
        setErro("Informe o telefone.");
        return;
      }

      setLoading(true);

      const payload = {
        nome: nome.trim(),
        telefone: telefoneLimpo,
        cidade: cidade.trim() || null,
        email: email.trim() || null,
        codigo_indicador: codigoIndicador || null,
        cadastro_concluido: true,
        status_credito: codigoIndicador ? "pendente" : null,
      };

      const { error } = await supabase.from("indicacoes").insert(payload);

      if (error) {
        throw error;
      }

      setSucesso(true);
      setNome("");
      setTelefone("");
      setCidade("");
      setEmail("");
    } catch (e: any) {
      setErro(e?.message || "Não foi possível concluir o cadastro.");
    } finally {
      setLoading(false);
    }
  }

  if (sucesso) {
    return (
      <main className="min-h-screen bg-slate-950 px-4 py-10 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl rounded-[32px] border border-white/10 bg-white/[0.04] p-8 text-center shadow-[0_10px_40px_rgba(0,0,0,0.18)]">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-3xl">
            ✓
          </div>

          <h1 className="mt-5 text-3xl font-bold">Cadastro realizado com sucesso</h1>

          <p className="mt-3 text-sm text-slate-300 sm:text-base">
            Agora você já faz parte do Valente Conecta.
          </p>

          {codigoIndicador ? (
            <p className="mt-2 text-sm text-emerald-300">
              Sua indicação foi vinculada corretamente.
            </p>
          ) : null}

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/"
              className="rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-400"
            >
              Ir para o início
            </Link>

            <Link
              href="/classificados"
              className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/10"
            >
              Ver classificados
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-6 shadow-[0_10px_40px_rgba(0,0,0,0.18)] sm:p-8">
          <div className="inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300">
            Cadastro Valente Conecta
          </div>

          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Faça seu cadastro
          </h1>

          <p className="mt-3 text-sm text-slate-300 sm:text-base">
            Preencha seus dados para entrar na plataforma.
          </p>

          {codigoIndicador ? (
            <div className="mt-4 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
              Você está entrando por uma indicação válida.
            </div>
          ) : null}

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm text-slate-300">Nome</label>
              <input
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Seu nome completo"
                className="h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white placeholder:text-slate-400 outline-none focus:border-emerald-400/50 focus:bg-white/10"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">Telefone</label>
              <input
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                placeholder="Seu WhatsApp"
                className="h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white placeholder:text-slate-400 outline-none focus:border-emerald-400/50 focus:bg-white/10"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">Cidade</label>
              <input
                value={cidade}
                onChange={(e) => setCidade(e.target.value)}
                placeholder="Sua cidade"
                className="h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white placeholder:text-slate-400 outline-none focus:border-emerald-400/50 focus:bg-white/10"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm text-slate-300">Email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Seu email"
                className="h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white placeholder:text-slate-400 outline-none focus:border-emerald-400/50 focus:bg-white/10"
              />
            </div>
          </div>

          {erro ? (
            <div className="mt-4 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {erro}
            </div>
          ) : null}

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={salvarCadastro}
              disabled={loading}
              className="rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Salvando..." : "Concluir cadastro"}
            </button>

            <Link
              href="/"
              className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/10"
            >
              Voltar
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}