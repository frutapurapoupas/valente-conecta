"use client";

import MenuApp from "@/components/menuApp";
import Link from "next/link";

const cards = [
  {
    title: "Ofertas da cidade",
    description: "Veja promoções publicadas pelos comerciantes.",
    href: "/ofertas",
    color: "cyan",
  },
  {
    title: "Minha Carteira",
    description: "Saldo, extrato, compras e cashback recebido.",
    href: "/carteira",
    color: "emerald",
  },
  {
    title: "Pagar com Conecta",
    description: "Realize pagamentos com a moeda Conecta.",
    href: "/pagar",
    color: "green",
  },
  {
    title: "Convide e Compre",
    description: "Convide uma loja e envie o link direto pelo WhatsApp.",
    href: "/convide-e-compre",
    color: "blue",
  },
  {
    title: "Caixa do Comerciante",
    description: "Receba pagamentos e registre transações da loja.",
    href: "/comerciante/caixa",
    color: "amber",
  },
  {
    title: "Painel do Comerciante",
    description: "Saldo, vendas, ofertas e página pública da loja.",
    href: "/comerciante/painel",
    color: "orange",
  },
];

export default function ConectaPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <MenuApp />

      <div className="mx-auto max-w-7xl px-4 py-6 space-y-6">
        <header className="rounded-3xl border border-cyan-500/20 bg-slate-900 p-6 shadow-2xl">
          <p className="text-sm uppercase tracking-[0.2em] text-cyan-300">
            Valente Conecta
          </p>
          <h1 className="mt-2 text-3xl font-bold">Central Conecta</h1>
          <p className="mt-2 max-w-3xl text-slate-300">
            Acesse os módulos principais do teste: ofertas, carteira, pagamento,
            convites e operação do comerciante.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {cards.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-xl transition hover:-translate-y-0.5 hover:border-slate-600"
            >
              <p className="text-sm text-slate-400">{card.title}</p>
              <h2 className="mt-2 text-xl font-bold text-white">{card.title}</h2>
              <p className="mt-3 text-sm text-slate-300">{card.description}</p>
              <div className="mt-5 text-sm font-semibold text-cyan-300">
                Abrir módulo →
              </div>
            </Link>
          ))}
        </section>
      </div>
    </main>
  );
}