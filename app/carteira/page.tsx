"use client";

import { useEffect, useMemo, useState } from "react";
import AppShell from "@/components/AppShell";
import {
  getCurrentUserId,
  getUserCashbacks,
  getUserPayments,
  getUserStatement,
  getUserWallet,
} from "@/lib/conecta";

type WalletData = {
  balance?: number | string | null;
};

type PaymentItem = {
  payment_id?: string;
  merchant_name?: string | null;
  created_at?: string | null;
  amount?: number | string | null;
  status?: string | null;
};

type CashbackItem = {
  id?: string;
  merchant_name?: string | null;
  created_at?: string | null;
  cashback_amount?: number | string | null;
};

type StatementItem = {
  id?: string;
  transaction_type?: string | null;
  amount?: number | string | null;
  reference?: string | null;
  created_at?: string | null;
};

export default function CarteiraPage() {
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [cashbacks, setCashbacks] = useState<CashbackItem[]>([]);
  const [statement, setStatement] = useState<StatementItem[]>([]);
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

        if (walletRes?.error) throw walletRes.error;
        if (paymentsRes?.error) throw paymentsRes.error;
        if (cashbackRes?.error) throw cashbackRes.error;
        if (statementRes?.error) throw statementRes.error;

        setWallet((walletRes?.data as WalletData) ?? null);
        setPayments((paymentsRes?.data as PaymentItem[]) ?? []);
        setCashbacks((cashbackRes?.data as CashbackItem[]) ?? []);
        setStatement((statementRes?.data as StatementItem[]) ?? []);
      } catch (err: any) {
        setError(err?.message || "Erro ao carregar carteira.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const saldoAtual = useMemo(() => {
    return Number(wallet?.balance ?? 0);
  }, [wallet]);

  const totalCashback = useMemo(() => {
    return cashbacks.reduce(
      (sum, item) => sum + Number(item.cashback_amount || 0),
      0
    );
  }, [cashbacks]);

  const totalCompras = useMemo(() => {
    return payments.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  }, [payments]);

  return (
    <AppShell
      title="Carteira Conecta"
      subtitle="Acompanhe saldo, compras, cashback e extrato da sua conta."
    >
      <div className="grid-cards">
        <div className="hero-card">
          <p className="text-sm font-semibold opacity-90">MOEDA CONECTA</p>
          <h2 className="mt-1 text-3xl font-extrabold">
            {saldoAtual.toFixed(2)} CONECTAS
          </h2>
          <p className="mt-2 text-sm opacity-95">
            Saldo disponível para utilização dentro da rede.
          </p>

          {userId ? (
            <p className="mt-3 break-all text-xs opacity-80">
              Usuário: {userId}
            </p>
          ) : null}
        </div>

        {loading && <div className="card">Carregando carteira...</div>}

        {!!error && !loading && (
          <div className="card border border-red-200 bg-red-50 text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="grid gap-4 md:grid-cols-3">
              <InfoCard
                title="Saldo atual"
                value={`${saldoAtual.toFixed(2)} CONECTAS`}
                subtitle="Disponível agora"
              />

              <InfoCard
                title="Total em compras"
                value={`R$ ${totalCompras.toFixed(2)}`}
                subtitle="Compras registradas"
              />

              <InfoCard
                title="Cashback recebido"
                value={`${totalCashback.toFixed(2)} CONECTAS`}
                subtitle="Acumulado"
              />
            </div>

            <SectionPanel title="Últimas compras">
              {payments.length === 0 ? (
                <EmptyState text="Nenhuma compra registrada ainda." />
              ) : (
                <div className="grid gap-3">
                  {payments.slice(0, 10).map((item, index) => (
                    <div
                      key={item.payment_id || `payment-${index}`}
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-bold text-slate-900">
                            {item.merchant_name || "Comerciante"}
                          </p>
                          <p className="mt-1 text-sm text-slate-500">
                            {formatDate(item.created_at)}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="font-bold text-green-700">
                            R$ {Number(item.amount || 0).toFixed(2)}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            Status: {item.status || "-"}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </SectionPanel>

            <SectionPanel title="Cashbacks recentes">
              {cashbacks.length === 0 ? (
                <EmptyState text="Nenhum cashback recebido ainda." />
              ) : (
                <div className="grid gap-3">
                  {cashbacks.slice(0, 10).map((item, index) => (
                    <div
                      key={item.id || `cashback-${index}`}
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-bold text-slate-900">
                            {item.merchant_name || "Comerciante"}
                          </p>
                          <p className="mt-1 text-sm text-slate-500">
                            {formatDate(item.created_at)}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="font-bold text-amber-600">
                            +{Number(item.cashback_amount || 0).toFixed(2)} CONECTAS
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </SectionPanel>

            <SectionPanel title="Extrato da carteira">
              {statement.length === 0 ? (
                <EmptyState text="Extrato vazio." />
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-left text-slate-500">
                        <th className="py-3 pr-4">Tipo</th>
                        <th className="py-3 pr-4">Valor</th>
                        <th className="py-3 pr-4">Referência</th>
                        <th className="py-3">Data</th>
                      </tr>
                    </thead>
                    <tbody>
                      {statement.slice(0, 20).map((item, index) => (
                        <tr
                          key={item.id || `statement-${index}`}
                          className="border-b border-slate-100 text-slate-800"
                        >
                          <td className="py-3 pr-4">
                            {item.transaction_type || "-"}
                          </td>
                          <td className="py-3 pr-4">
                            {Number(item.amount || 0).toFixed(2)}
                          </td>
                          <td className="py-3 pr-4">{item.reference || "-"}</td>
                          <td className="py-3">{formatDate(item.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </SectionPanel>
          </>
        )}
      </div>
    </AppShell>
  );
}

function InfoCard({
  title,
  value,
  subtitle,
}: {
  title: string;
  value: string;
  subtitle: string;
}) {
  return (
    <div className="card">
      <p className="text-sm text-slate-500">{title}</p>
      <h3 className="mt-2 text-2xl font-extrabold text-slate-900">{value}</h3>
      <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
    </div>
  );
}

function SectionPanel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="card">
      <h2 className="section-title mb-4">{title}</h2>
      {children}
    </section>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 p-5 text-slate-500">
      {text}
    </div>
  );
}

function formatDate(value?: string | null) {
  if (!value) return "-";

  try {
    return new Date(value).toLocaleString("pt-BR");
  } catch {
    return value;
  }
}