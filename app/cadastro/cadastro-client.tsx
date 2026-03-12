"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function CadastroClient() {
  const searchParams = useSearchParams();

  const nomeInicial = searchParams.get("nome") || "";
  const emailInicial = searchParams.get("email") || "";
  const telefoneInicial = searchParams.get("telefone") || "";
  const codigoIndicacao = searchParams.get("codigo") || "";
  const origem = searchParams.get("origem") || "";

  const [nome, setNome] = useState(nomeInicial);
  const [email, setEmail] = useState(emailInicial);
  const [telefone, setTelefone] = useState(telefoneInicial);

  const resumo = useMemo(() => {
    return {
      codigo: codigoIndicacao || "-",
      origem: origem || "-",
    };
  }, [codigoIndicacao, origem]);

  return (
    <div className="space-y-6">
      {(codigoIndicacao || origem) && (
        <section className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5">
          <p className="text-sm uppercase tracking-[0.2em] text-emerald-200">
            Dados recebidos
          </p>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
              <p className="text-xs uppercase tracking-widest text-white/45">
                Código
              </p>
              <p className="mt-2 text-sm font-medium">{resumo.codigo}</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
              <p className="text-xs uppercase tracking-widest text-white/45">
                Origem
              </p>
              <p className="mt-2 text-sm font-medium">{resumo.origem}</p>
            </div>
          </div>
        </section>
      )}

      <section className="rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-xl">
        <h2 className="text-xl font-semibold">Formulário de cadastro</h2>
        <p className="mt-2 text-sm text-white/60">
          Esta versão foi estruturada para manter a rota estável no build de
          produção. Depois que o deploy fechar, podemos reencaixar qualquer
          lógica adicional específica do seu fluxo.
        </p>

        <form className="mt-6 grid gap-4">
          <div>
            <label className="mb-2 block text-sm text-white/70">Nome</label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Digite seu nome"
              className="w-full rounded-xl border border-white/10 bg-slate-800 px-4 py-3 outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-white/70">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Digite seu e-mail"
              className="w-full rounded-xl border border-white/10 bg-slate-800 px-4 py-3 outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-white/70">Telefone</label>
            <input
              type="tel"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              placeholder="Digite seu telefone"
              className="w-full rounded-xl border border-white/10 bg-slate-800 px-4 py-3 outline-none"
            />
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="button"
              className="rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950"
            >
              Continuar
            </button>

            <Link
              href="/status"
              className="rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold hover:bg-white/5"
            >
              Ir para status
            </Link>
          </div>
        </form>
      </section>
    </div>
  );
}