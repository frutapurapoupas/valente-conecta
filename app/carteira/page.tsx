"use client";

import MenuApp from "@/components/menuApp";
import { useEffect, useMemo, useState } from "react";
import {
  getCurrentUserId,
  getUserCashbacks,
  getUserPayments,
  getUserStatement,
  getUserWallet,
} from "@/lib/conecta";

export default function CarteiraPage() {
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [wallet, setWallet] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [cashbacks, setCashbacks] = useState<any[]>([]);
  const [statement, setStatement] = useState<any[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError("");

        const currentUserId = await getCurrentUserId();
        if (!currentUserId) {
          setError("Usuário não autenticado.");
          return;
        }

        setUserId(currentUserId);

        const [walletRes, paymentsRes, cashbackRes, statementRes] =
          await Promise.all([
            getUserWallet(currentUserId),
            getUserPayments(currentUserId),
            getUserCashbacks(currentUserId),
            getUserStatement(),
          ]);

        if (walletRes.error) throw walletRes.error;
        if (paymentsRes.error) throw paymentsRes.error;
        if (cashbackRes.error) throw cashbackRes.error;
        if (statementRes.error) throw statementRes.error;

        setWallet(walletRes.data ?? null);
        setPayments(paymentsRes.data ?? []);
        setCashbacks(cashbackRes.data ?? []);
        setStatement(statementRes.data ?? []);
      } catch (err: any) {
        setError(err?.message || "Erro ao carregar carteira.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const totalCashback = useMemo(
    () => cashbacks.reduce((sum, item) => sum + Number(item.cashback_amount || 0), 0),
    [cashbacks]
  );

  const totalCompras = useMemo(
    () => payments.reduce((sum, item) => sum + Number(item.amount || 0), 0),
    [payments]
  );

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <MenuApp />

      <div className="mx-auto max-w-5xl px-4 py-6 space-y-6">
        <header className="rounded-3xl border border-cyan-500/20 bg-slate-900 p-6 shadow-2xl">
          <p className="text-cyan-300 text-sm uppercase tracking-[0.2em]">
            Carteira Conecta
          </p>
          <h1 className="mt-2 text-3xl font-bold">Minha Carteira</h1>
          <p className="mt-2 text-slate-300">
            Acompanhe seu saldo, compras realizadas e cashback recebido.
          </p>
          {userId && (
            <p className="mt-3 text-xs text-slate-400 break-all">
              Usuário: {userId}
            </p>
          )}
        </header>

        {loading && (
          <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
            Carregando carteira...
          </section>
        )}

        {!!error && !loading && (
          <section className="rounded-3xl border border-red-500/30 bg-red-950/40 p-6 text-red-200">
            {error}
          </section>
        )}

        {!loading && !error && (
          <>
            <section className="grid gap-4 md:grid-cols-3">
              <Card
                title="Saldo atual"
                value={`${Number(wallet?.balance ?? 0).toFixed(2)} CONECTAS`}
                subtitle="Disponível para usar"
              />
              <Card
                title="Total em compras"
                value={`R$ ${totalCompras.toFixed(2)}`}
                subtitle="Compras registradas"
              />
              <Card
                title="Cashback recebido"
                value={`${totalCashback.toFixed(2)} CONECTAS`}
                subtitle="Retorno acumulado"
              />
            </section>

            <section className="grid gap-6 lg:grid-cols-2">
              <Panel title="Últimas compras">
                {payments.length === 0 ? (
                  <EmptyState text="Nenhuma compra registrada ainda." />
                ) : (
                  <div className="space-y-3">
                    {payments.slice(0, 10).map((item) => (
                      <div
                        key={item.payment_id}
                        className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="font-semibold text-white">
                              {item.merchant_name || "Comerciante"}
                            </p>
                            <p className="text-sm text-slate-400">
                              {formatDate(item.created_at)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-cyan-300">
                              R$ {Number(item.amount).toFixed(2)}
                            </p>
                            <p className="text-xs text-slate-400">
                              Status: {item.status}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Panel>

              <Panel title="Cashbacks recentes">
                {cashbacks.length === 0 ? (
                  <EmptyState text="Nenhum cashback recebido ainda." />
                ) : (
                  <div className="space-y-3">
                    {cashbacks.slice(0, 10).map((item) => (
                      <div
                        key={item.id}
                        className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="font-semibold text-white">
                              {item.merchant_name || "Comerciante"}
                            </p>
                            <p className="text-sm text-slate-400">
                              {formatDate(item.created_at)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-amber-300">
                              +{Number(item.cashback_amount).toFixed(2)} CONECTAS
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Panel>
            </section>

            <Panel title="Extrato da carteira">
              {statement.length === 0 ? (
                <EmptyState text="Extrato vazio." />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="text-slate-400">
                      <tr className="border-b border-slate-800">
                        <th className="py-3 text-left">Tipo</th>
                        <th className="py-3 text-left">Valor</th>
                        <th className="py-3 text-left">Referência</th>
                        <th className="py-3 text-left">Data</th>
                      </tr>
                    </thead>
                    <tbody>
                      {statement.slice(0, 20).map((item) => (
                        <tr
                          key={item.id}
                          className="border-b border-slate-900 text-slate-200"
                        >
                          <td className="py-3">{item.transaction_type}</td>
                          <td className="py-3">
                            {Number(item.amount).toFixed(2)}
                          </td>
                          <td className="py-3">{item.reference || "-"}</td>
                          <td className="py-3">{formatDate(item.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Panel>
          </>
        )}
      </div>
    </main>
  );
}

function Card({
  title,
  value,
  subtitle,
}: {
  title: string;
  value: string;
  subtitle: string;
}) {
  return (
    <article className="rounded-3xl border border-cyan-500/20 bg-slate-900 p-5 shadow-xl">
      <p className="text-sm text-slate-400">{title}</p>
      <h2 className="mt-2 text-2xl font-bold text-white">{value}</h2>
      <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
    </article>
  );
}

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-xl">
      <h3 className="mb-4 text-xl font-semibold">{title}</h3>
      {children}
    </section>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-700 p-5 text-slate-400">
      {text}
    </div>
  );
}

function formatDate(value: string) {
  try {
    return new Date(value).toLocaleString("pt-BR");
  } catch {
    return value;
  }
}