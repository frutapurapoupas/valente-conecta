"use client";

import { useEffect, useMemo, useState } from "react";
import {
  conectaPayWithCashback,
  getCurrentUserId,
  getMerchantStatement,
  getMerchantWallet,
  listEmpresas,
  MerchantStatement,
  MerchantWalletBalance,
} from "@/lib/conecta";

type EmpresaOption = {
  id: string;
  nome: string;
  whatsapp?: string | null;
  is_provisional?: boolean | null;
  plan_type?: string | null;
  status?: string | null;
};

export default function CaixaComerciantePage() {
  const [empresas, setEmpresas] = useState<EmpresaOption[]>([]);
  const [merchantId, setMerchantId] = useState("");
  const [wallet, setWallet] = useState<MerchantWalletBalance | null>(null);
  const [statement, setStatement] = useState<MerchantStatement[]>([]);
  const [userId, setUserId] = useState("");
  const [amount, setAmount] = useState("");
  const [cashbackPercent, setCashbackPercent] = useState("5");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      const currentUserId = await getCurrentUserId();
      if (currentUserId) setUserId(currentUserId);

      const empresasRes = await listEmpresas();
      setEmpresas((empresasRes.data as EmpresaOption[]) || []);
      setLoading(false);
    }

    load();
  }, []);

  useEffect(() => {
    async function loadMerchantData() {
      if (!merchantId) {
        setWallet(null);
        setStatement([]);
        return;
      }

      const [walletRes, statementRes] = await Promise.all([
        getMerchantWallet(merchantId),
        getMerchantStatement(merchantId),
      ]);

      setWallet(walletRes.data ?? null);
      setStatement(statementRes.data ?? []);
    }

    loadMerchantData();
  }, [merchantId]);

  const totalRecebido = useMemo(
    () => statement.reduce((sum, item) => sum + Number(item.amount || 0), 0),
    [statement]
  );

  async function handlePay(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    if (!userId || !merchantId || !amount) {
      setMessage("Preencha usuário, comerciante e valor.");
      return;
    }

    const parsedAmount = Number(amount);
    const parsedCashback = Number(cashbackPercent || 5);

    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      setMessage("Informe um valor válido.");
      return;
    }

    setProcessing(true);

    const res = await conectaPayWithCashback({
      userId,
      merchantId,
      amount: parsedAmount,
      cashbackPercent: parsedCashback,
    });

    if (res.error) {
      setMessage(res.error.message || "Erro ao processar pagamento.");
      setProcessing(false);
      return;
    }

    if (res.data?.status !== "success") {
      setMessage(res.data?.message || "Pagamento não concluído.");
      setProcessing(false);
      return;
    }

    setMessage(
      `Pagamento concluído com sucesso. Cashback: ${Number(
        res.data.cashback || 0
      ).toFixed(2)} CONECTAS`
    );
    setAmount("");

    const [walletRes, statementRes] = await Promise.all([
      getMerchantWallet(merchantId),
      getMerchantStatement(merchantId),
    ]);

    setWallet(walletRes.data ?? null);
    setStatement(statementRes.data ?? []);
    setProcessing(false);
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white px-4 py-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="rounded-3xl border border-amber-500/20 bg-slate-900 p-6 shadow-2xl">
          <p className="text-amber-300 text-sm uppercase tracking-[0.2em]">
            Comerciante
          </p>
          <h1 className="mt-2 text-3xl font-bold">Caixa Conecta</h1>
          <p className="mt-2 text-slate-300">
            Receba pagamentos com CONECTA e acompanhe o histórico da loja.
          </p>
        </header>

        {loading ? (
          <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
            Carregando empresas...
          </section>
        ) : (
          <>
            <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <section className="rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-xl">
                <h2 className="mb-4 text-xl font-semibold">Receber pagamento</h2>

                <form onSubmit={handlePay} className="space-y-4">
                  <Field label="Usuário pagador (ID)">
                    <input
                      value={userId}
                      onChange={(e) => setUserId(e.target.value)}
                      className="w-full rounded-2xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm outline-none"
                    />
                  </Field>

                  <Field label="Loja / comerciante">
                    <select
                      value={merchantId}
                      onChange={(e) => setMerchantId(e.target.value)}
                      className="w-full rounded-2xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm outline-none"
                    >
                      <option value="">Selecione</option>
                      {empresas.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.nome}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Valor da compra">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full rounded-2xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm outline-none"
                        placeholder="20.00"
                      />
                    </Field>

                    <Field label="Cashback (%)">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={cashbackPercent}
                        onChange={(e) => setCashbackPercent(e.target.value)}
                        className="w-full rounded-2xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm outline-none"
                      />
                    </Field>
                  </div>

                  <button
                    type="submit"
                    disabled={processing}
                    className="w-full rounded-2xl bg-amber-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-amber-400 disabled:opacity-60"
                  >
                    {processing ? "Processando..." : "Receber com Conecta"}
                  </button>

                  {!!message && (
                    <div className="rounded-2xl border border-cyan-500/20 bg-cyan-950/30 px-4 py-3 text-sm text-cyan-100">
                      {message}
                    </div>
                  )}
                </form>
              </section>

              <section className="space-y-4">
                <Card
                  title="Saldo da loja"
                  value={`${Number(wallet?.balance ?? 0).toFixed(2)} CONECTAS`}
                />
                <Card
                  title="Total recebido"
                  value={`R$ ${totalRecebido.toFixed(2)}`}
                />
                <Card
                  title="Transações"
                  value={String(statement.length)}
                />
              </section>
            </section>

            <section className="rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-xl">
              <h2 className="mb-4 text-xl font-semibold">Histórico da loja</h2>

              {statement.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-700 p-5 text-slate-400">
                  Nenhum recebimento encontrado para esta loja.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="text-slate-400">
                      <tr className="border-b border-slate-800">
                        <th className="py-3 text-left">Cliente</th>
                        <th className="py-3 text-left">Valor</th>
                        <th className="py-3 text-left">Conecta</th>
                        <th className="py-3 text-left">Status</th>
                        <th className="py-3 text-left">Data</th>
                      </tr>
                    </thead>
                    <tbody>
                      {statement.map((item) => (
                        <tr key={item.payment_id} className="border-b border-slate-900">
                          <td className="py-3 break-all">{item.user_id}</td>
                          <td className="py-3">R$ {Number(item.amount).toFixed(2)}</td>
                          <td className="py-3">
                            {Number(item.conecta_used).toFixed(2)}
                          </td>
                          <td className="py-3">{item.status}</td>
                          <td className="py-3">{formatDate(item.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm text-slate-300">{label}</span>
      {children}
    </label>
  );
}

function Card({ title, value }: { title: string; value: string }) {
  return (
    <article className="rounded-3xl border border-amber-500/20 bg-slate-900 p-5 shadow-xl">
      <p className="text-sm text-slate-400">{title}</p>
      <h3 className="mt-2 text-2xl font-bold text-white">{value}</h3>
    </article>
  );
}

function formatDate(value: string) {
  try {
    return new Date(value).toLocaleString("pt-BR");
  } catch {
    return value;
  }
}