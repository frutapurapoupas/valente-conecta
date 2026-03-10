"use client";

import MenuApp from "@/components/menuApp";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  getMerchantStatement,
  getMerchantWallet,
  listEmpresas,
} from "@/lib/conecta";

export default function PainelComerciantePage() {
  const [empresas, setEmpresas] = useState<any[]>([]);
  const [merchantId, setMerchantId] = useState("");
  const [wallet, setWallet] = useState<any>(null);
  const [statement, setStatement] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const empresasRes = await listEmpresas();
      setEmpresas(empresasRes.data || []);
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

  const quantidadeVendas = statement.length;

  const lojaAtual = useMemo(() => {
    return empresas.find((e) => e.id === merchantId) || null;
  }, [empresas, merchantId]);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <MenuApp />

      <div className="mx-auto max-w-6xl px-4 py-6 space-y-6">
        <header className="rounded-3xl border border-amber-500/20 bg-slate-900 p-6 shadow-2xl">
          <p className="text-sm uppercase tracking-[0.2em] text-amber-300">
            Painel do comerciante
          </p>
          <h1 className="mt-2 text-3xl font-bold">Painel Conecta</h1>
          <p className="mt-2 text-slate-300">
            Consulte o saldo da loja, acompanhe transações, publique ofertas e
            gerencie a presença da empresa no app.
          </p>
        </header>

        {loading ? (
          <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
            Carregando painel...
          </section>
        ) : (
          <>
            <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
              <label className="block">
                <span className="mb-2 block text-sm text-slate-300">
                  Selecione a loja
                </span>
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
              </label>

              {merchantId && (
                <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  <ActionCard
                    title="Publicar oferta"
                    description="Criar uma nova promoção para a loja"
                    href={`/comerciante/ofertas?merchantId=${merchantId}`}
                  />
                  <ActionCard
                    title="Gerenciar ofertas"
                    description="Ver e acompanhar as ofertas publicadas"
                    href={`/comerciante/ofertas?merchantId=${merchantId}`}
                  />
                  <ActionCard
                    title="Ver loja pública"
                    description="Abrir a página visível ao cliente"
                    href={`/loja/${merchantId}`}
                  />
                  <InfoCard
                    title="Plano atual"
                    value={lojaAtual?.plan_type || "gratuito"}
                  />
                </div>
              )}
            </section>

            <section className="grid gap-4 md:grid-cols-3">
              <Card
                title="Saldo da loja"
                value={`${Number(wallet?.balance ?? 0).toFixed(2)} CONECTAS`}
              />
              <Card
                title="Total recebido"
                value={`R$ ${totalRecebido.toFixed(2)}`}
              />
              <Card
                title="Quantidade de vendas"
                value={String(quantidadeVendas)}
              />
            </section>

            <section className="rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-xl">
              <h2 className="mb-4 text-xl font-semibold">
                Histórico de recebimentos
              </h2>

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
                        <tr
                          key={item.payment_id}
                          className="border-b border-slate-900"
                        >
                          <td className="py-3 break-all">{item.user_id}</td>
                          <td className="py-3">
                            R$ {Number(item.amount).toFixed(2)}
                          </td>
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

function Card({ title, value }: { title: string; value: string }) {
  return (
    <article className="rounded-3xl border border-amber-500/20 bg-slate-900 p-5 shadow-xl">
      <p className="text-sm text-slate-400">{title}</p>
      <h2 className="mt-2 text-2xl font-bold text-white">{value}</h2>
    </article>
  );
}

function InfoCard({ title, value }: { title: string; value: string }) {
  return (
    <article className="rounded-2xl border border-slate-700 bg-slate-950/60 p-4">
      <p className="text-sm text-slate-400">{title}</p>
      <p className="mt-2 text-base font-semibold text-white">{value}</p>
    </article>
  );
}

function ActionCard({
  title,
  description,
  href,
}: {
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-2xl border border-cyan-500/20 bg-cyan-950/20 p-4 transition hover:border-cyan-400/40 hover:bg-cyan-950/30"
    >
      <p className="text-base font-semibold text-cyan-200">{title}</p>
      <p className="mt-2 text-sm text-slate-300">{description}</p>
      <p className="mt-3 text-sm font-medium text-cyan-300">Abrir →</p>
    </Link>
  );
}

function formatDate(value: string) {
  try {
    return new Date(value).toLocaleString("pt-BR");
  } catch {
    return value;
  }
}