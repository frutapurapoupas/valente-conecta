"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useSearchParams } from "next/navigation";

function getMensagemPorTipo(tipo: string) {
  switch (tipo) {
    case "cadastro":
      return {
        titulo: "Cadastro recebido",
        descricao:
          "Seu cadastro foi recebido com sucesso e está em análise no sistema.",
        cor: "emerald",
      };
    case "indicacao":
      return {
        titulo: "Indicação registrada",
        descricao:
          "A indicação foi registrada. Assim que houver validação, os créditos serão atualizados.",
        cor: "cyan",
      };
    case "credito":
      return {
        titulo: "Crédito atualizado",
        descricao:
          "Seu saldo ou crédito foi atualizado com sucesso no sistema.",
        cor: "amber",
      };
    default:
      return {
        titulo: "Status disponível",
        descricao:
          "As informações mais recentes da sua operação estão disponíveis abaixo.",
        cor: "emerald",
      };
  }
}

export default function StatusClient() {
  const searchParams = useSearchParams();

  const tipo = searchParams.get("tipo") || "";
  const tituloQuery = searchParams.get("titulo") || "";
  const mensagemQuery = searchParams.get("mensagem") || "";
  const codigo = searchParams.get("codigo") || "";
  const nome = searchParams.get("nome") || "";

  const status = useMemo(() => {
    const base = getMensagemPorTipo(tipo);

    return {
      titulo: tituloQuery || base.titulo,
      descricao: mensagemQuery || base.descricao,
      cor: base.cor,
    };
  }, [tipo, tituloQuery, mensagemQuery]);

  const corClasses =
    status.cor === "cyan"
      ? "border-cyan-500/20 bg-cyan-500/10 text-cyan-200"
      : status.cor === "amber"
      ? "border-amber-500/20 bg-amber-500/10 text-amber-200"
      : "border-emerald-500/20 bg-emerald-500/10 text-emerald-200";

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-xl">
        <div className={`rounded-2xl border px-5 py-4 ${corClasses}`}>
          <p className="text-sm uppercase tracking-[0.2em]">Resultado</p>
          <h2 className="mt-2 text-2xl font-bold">{status.titulo}</h2>
          <p className="mt-3 text-sm leading-6 text-white/80">
            {status.descricao}
          </p>
        </div>

        {(nome || codigo || tipo) && (
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-slate-800 p-4">
              <p className="text-xs uppercase tracking-widest text-white/45">
                Nome
              </p>
              <p className="mt-2 text-sm font-medium">{nome || "-"}</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-800 p-4">
              <p className="text-xs uppercase tracking-widest text-white/45">
                Código
              </p>
              <p className="mt-2 text-sm font-medium">{codigo || "-"}</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-800 p-4">
              <p className="text-xs uppercase tracking-widest text-white/45">
                Tipo
              </p>
              <p className="mt-2 text-sm font-medium">{tipo || "-"}</p>
            </div>
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/"
            className="rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950"
          >
            Ir para a página inicial
          </Link>

          <Link
            href="/indicar"
            className="rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold hover:bg-white/5"
          >
            Fazer nova indicação
          </Link>
        </div>
      </section>
    </div>
  );
}