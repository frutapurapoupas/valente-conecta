"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getMerchantStatement, listEmpresas } from "@/lib/conecta";

type MerchantStatement = Awaited<ReturnType<typeof getMerchantStatement>>;
type WalletLike = Record<string, any> | null;

type EmpresaOption = {
  id: string;
  nome: string;
};

export default function ComercianteCaixaPage() {
  const [empresas, setEmpresas] = useState<EmpresaOption[]>([]);
  const [empresaId, setEmpresaId] = useState("");
  const [statement, setStatement] = useState<MerchantStatement | null>(null);
  const [wallet, setWallet] = useState<WalletLike>(null);
  const [loading, setLoading] = useState(true);
  const [loadingExtrato, setLoadingExtrato] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let active = true;

    async function carregarEmpresas() {
      setLoading(true);
      setErro("");

      try {
        const data = await listEmpresas();

        if (!active) return;

        const lista = Array.isArray(data)
          ? data.map((item: any) => ({
              id: String(item?.id ?? ""),
              nome: String(
                item?.nome_fantasia ??
                  item?.nome ??
                  item?.empresa ??
                  "Empresa sem nome"
              ),
            }))
          : [];

        setEmpresas(lista);

        if (lista.length > 0) {
          setEmpresaId(lista[0].id);
        }
      } catch (e: any) {
        if (!active) return;
        setErro(e?.message || "Não foi possível carregar as empresas.");
      } finally {
        if (active) setLoading(false);
      }
    }

    carregarEmpresas();

    return () => {
      active = false;
    };
  }, []);

  async function carregarExtrato() {
    if (!empresaId) {
      setErro("Selecione uma empresa.");
      return;
    }

    setLoadingExtrato(true);
    setErro("");

    try {
      const data = await getMerchantStatement(empresaId);
      setStatement(data);

      const saldoDetectado =
        (data as any)?.wallet ??
        (data as any)?.balance ??
        (data as any)?.saldo ??
        null;

      setWallet(saldoDetectado);
    } catch (e: any) {
      setErro(e?.message || "Não foi possível carregar o extrato.");
    } finally {
      setLoadingExtrato(false);
    }
  }

  useEffect(() => {
    if (empresaId) {
      carregarExtrato();
    }
  }, [empresaId]);

  const movimentos = useMemo(() => {
    const raw =
      (statement as any)?.items ??
      (statement as any)?.transactions ??
      (statement as any)?.movimentos ??
      (statement as any)?.extrato ??
      [];

    return Array.isArray(raw) ? raw : [];
  }, [statement]);

  const saldoTexto = useMemo(() => {
    const valor =
      (wallet as any)?.available ??
      (wallet as any)?.balance ??
      (wallet as any)?.saldo ??
      (statement as any)?.balance ??
      (statement as any)?.saldo ??
      0;

    return Number(valor || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }, [statement, wallet]);

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-emerald-400">
              Comerciante
            </p>
            <h1 className="mt-2 text-3xl font-bold">Caixa</h1>
            <p className="mt-2 text-white/70">
              Consulta de saldo e extrato do comerciante.
            </p>
          </div>

          <Link
            href="/admin/dashboard"
            className="inline-flex items-center rounded-xl border border-white/10 px-4 py-3 text-sm hover:bg-white/5"
          >
            Voltar ao painel
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
          <section className="rounded-2xl border border-white/10 bg-slate-900 p-5 shadow-xl">
            <h2 className="text-lg font-semibold">Selecionar empresa</h2>

            <div className="mt-4">
              <label className="mb-2 block text-sm text-white/70">
                Empresa
              </label>

              <select
                value={empresaId}
                onChange={(e) => setEmpresaId(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-slate-800 px-4 py-3 outline-none"
                disabled={loading || empresas.length === 0}
              >
                {empresas.length === 0 ? (
                  <option value="">Nenhuma empresa disponível</option>
                ) : (
                  empresas.map((empresa) => (
                    <option key={empresa.id} value={empresa.id}>
                      {empresa.nome}
                    </option>
                  ))
                )}
              </select>
            </div>

            <button
              type="button"
              onClick={carregarExtrato}
              disabled={loadingExtrato || !empresaId}
              className="mt-4 w-full rounded-xl bg-emerald-500 px-4 py-3 font-semibold text-slate-950 disabled:opacity-60"
            >
              {loadingExtrato ? "Atualizando..." : "Atualizar extrato"}
            </button>

            {erro ? (
              <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {erro}
              </div>
            ) : null}

            <div className="mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5">
              <p className="text-sm text-emerald-200/80">Saldo disponível</p>
              <p className="mt-2 text-3xl font-bold">{saldoTexto}</p>
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-slate-900 p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Extrato</h2>
              <span className="text-sm text-white/50">
                {movimentos.length} registro(s)
              </span>
            </div>

            {loading ? (
              <p className="text-white/60">Carregando empresas...</p>
            ) : loadingExtrato ? (
              <p className="text-white/60">Carregando extrato...</p>
            ) : movimentos.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-slate-800/60 p-6 text-white/60">
                Nenhum lançamento encontrado para esta empresa.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] border-separate border-spacing-y-2">
                  <thead>
                    <tr className="text-left text-sm text-white/50">
                      <th className="px-3 py-2">Data</th>
                      <th className="px-3 py-2">Descrição</th>
                      <th className="px-3 py-2">Tipo</th>
                      <th className="px-3 py-2 text-right">Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {movimentos.map((item: any, index: number) => {
                      const data =
                        item?.created_at ??
                        item?.data ??
                        item?.date ??
                        item?.timestamp ??
                        "-";

                      const descricao =
                        item?.descricao ??
                        item?.description ??
                        item?.titulo ??
                        item?.title ??
                        "Lançamento";

                      const tipo =
                        item?.tipo ??
                        item?.type ??
                        item?.natureza ??
                        "-";

                      const valor = Number(
                        item?.valor ?? item?.amount ?? item?.total ?? 0
                      );

                      return (
                        <tr
                          key={`${index}-${data}-${descricao}`}
                          className="rounded-2xl bg-slate-800"
                        >
                          <td className="rounded-l-2xl px-3 py-3 text-sm">
                            {String(data)}
                          </td>
                          <td className="px-3 py-3 text-sm">{String(descricao)}</td>
                          <td className="px-3 py-3 text-sm">{String(tipo)}</td>
                          <td className="rounded-r-2xl px-3 py-3 text-right text-sm font-semibold">
                            {valor.toLocaleString("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            })}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}