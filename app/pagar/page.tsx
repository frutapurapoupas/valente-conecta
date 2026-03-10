"use client";

import MenuApp from "@/components/menuApp";
import { useEffect, useState } from "react";
import {
  conectaPayWithCashback,
  getCurrentUserId,
  getUserWallet,
  listEmpresas,
} from "@/lib/conecta";

export default function PagarPage() {
  const [userId, setUserId] = useState("");
  const [saldo, setSaldo] = useState<number>(0);
  const [empresas, setEmpresas] = useState<any[]>([]);
  const [merchantId, setMerchantId] = useState("");
  const [amount, setAmount] = useState("");
  const [cashbackPercent, setCashbackPercent] = useState("5");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setMessage("");

      const currentUserId = await getCurrentUserId();
      if (!currentUserId) {
        setMessage("Usuário não autenticado.");
        setLoading(false);
        return;
      }

      setUserId(currentUserId);

      const [walletRes, empresasRes] = await Promise.all([
        getUserWallet(currentUserId),
        listEmpresas(),
      ]);

      if (walletRes.data) {
        setSaldo(Number(walletRes.data.balance || 0));
      }

      setEmpresas(empresasRes.data || []);
      setLoading(false);
    }

    load();
  }, []);

  async function refreshWallet(currentUserId: string) {
    const walletRes = await getUserWallet(currentUserId);
    if (walletRes.data) {
      setSaldo(Number(walletRes.data.balance || 0));
    }
  }

  async function handlePay(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    if (!userId || !merchantId || !amount) {
      setMessage("Selecione a loja e informe o valor.");
      return;
    }

    const parsedAmount = Number(amount);
    const parsedCashback = Number(cashbackPercent || 5);

    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      setMessage("Informe um valor válido.");
      return;
    }

    if (parsedAmount > saldo) {
      setMessage("Saldo insuficiente.");
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

    const payload: any = res.data;

    if (payload?.status !== "success") {
      setMessage(payload?.message || "Pagamento não concluído.");
      setProcessing(false);
      return;
    }

    setMessage(
      `Pagamento concluído. Cashback recebido: ${Number(
        payload.cashback || 0
      ).toFixed(2)} CONECTAS`
    );

    setAmount("");
    await refreshWallet(userId);
    setProcessing(false);
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <MenuApp />

      <div className="mx-auto max-w-3xl px-4 py-6 space-y-6">
        <header className="rounded-3xl border border-emerald-500/20 bg-slate-900 p-6 shadow-2xl">
          <p className="text-sm uppercase tracking-[0.2em] text-emerald-300">
            Pagamento digital
          </p>
          <h1 className="mt-2 text-3xl font-bold">Pagar com Conecta</h1>
          <p className="mt-2 text-slate-300">
            Escolha a loja, informe o valor e confirme seu pagamento.
          </p>
        </header>

        {loading ? (
          <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
            Carregando pagamento...
          </section>
        ) : (
          <>
            <section className="grid gap-4 md:grid-cols-2">
              <Card title="Seu saldo atual" value={`${saldo.toFixed(2)} CONECTAS`} />
              <Card title="Cashback padrão" value={`${cashbackPercent}%`} />
            </section>

            <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
              <h2 className="mb-4 text-xl font-semibold">Confirmar pagamento</h2>

              <form onSubmit={handlePay} className="space-y-4">
                <Field label="Usuário pagador">
                  <input
                    value={userId}
                    readOnly
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
                      placeholder="20.00"
                      className="w-full rounded-2xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm outline-none"
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
                  className="w-full rounded-2xl bg-emerald-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-60"
                >
                  {processing ? "Processando..." : "Confirmar pagamento"}
                </button>

                {!!message && (
                  <div className="rounded-2xl border border-cyan-500/20 bg-cyan-950/30 px-4 py-3 text-sm text-cyan-100">
                    {message}
                  </div>
                )}
              </form>
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
    <article className="rounded-3xl border border-emerald-500/20 bg-slate-900 p-5 shadow-xl">
      <p className="text-sm text-slate-400">{title}</p>
      <h2 className="mt-2 text-2xl font-bold text-white">{value}</h2>
    </article>
  );
}