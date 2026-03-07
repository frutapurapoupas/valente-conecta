"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#020817] text-white">
      <header className="border-b border-white/10 px-5 py-7 md:px-8 md:py-8">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-xl font-bold shadow-lg">
              V
            </div>

            <div>
              <h1 className="text-3xl font-bold tracking-tight md:text-5xl">
                Valente Conecta
              </h1>
              <p className="mt-1 text-sm text-slate-300 md:text-lg">
                Ofertas, serviços e oportunidades — tudo em um só lugar.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 md:px-5 md:py-2.5">
              Cidade
            </span>

            <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 md:px-5 md:py-2.5">
              Valente - BA
            </span>

            <Link
              href="/indicar"
              className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-400 md:px-6 md:py-3.5 md:text-base"
            >
              Indicar e ganhar R$1
            </Link>
          </div>
        </div>
      </header>

      <section className="px-5 py-8 md:px-8 md:py-10">
        <div className="mx-auto w-full max-w-7xl rounded-[30px] border border-white/10 bg-white/5 p-5 shadow-2xl backdrop-blur md:p-6 lg:p-7">
          <p className="mb-4 text-sm text-slate-300 md:text-base">
            Buscar no Valente Conecta
          </p>

          <div className="flex flex-col gap-4 xl:flex-row">
            <div className="flex min-h-[64px] flex-1 items-center rounded-2xl border border-white/10 bg-[#0b1220] px-5 text-slate-400 shadow-inner md:min-h-[70px] md:text-base">
              🔎 Ex.: pizzaria, pedreiro, promoção, som automotivo...
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/ofertas"
                className="inline-flex min-h-[64px] items-center justify-center rounded-2xl bg-blue-500 px-7 text-base font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:bg-blue-400 md:min-h-[70px] md:text-lg"
              >
                Ver Ofertas
              </Link>

              <Link
                href="/servicos"
                className="inline-flex min-h-[64px] items-center justify-center rounded-2xl border border-white/10 bg-white/10 px-7 text-base font-semibold text-white transition hover:bg-white/15 md:min-h-[70px] md:text-lg"
              >
                Ver Serviços
              </Link>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2.5">
            <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200">
              🔥 Promoções do dia
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200">
              🍔 Food & Delivery
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200">
              🛠️ Pedreiro/Obras
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200">
              🚗 Oficina & Auto
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200">
              🎉 Eventos
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200">
              🏠 Aluguel
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200">
              📦 Vendas
            </span>
          </div>
        </div>
      </section>

      <section className="px-5 pb-10 md:px-8 md:pb-14">
        <div className="mx-auto grid w-full max-w-7xl gap-6 lg:grid-cols-3">
          <Link
            href="/ofertas"
            className="group rounded-[30px] border border-blue-500/20 bg-gradient-to-br from-blue-900/40 to-cyan-900/20 p-7 shadow-xl transition hover:-translate-y-1 hover:border-blue-400/40 hover:bg-blue-900/50"
          >
            <div className="mb-8 flex items-center justify-between">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-black/20 text-2xl">
                🏷️
              </div>
              <span className="text-sm text-slate-300 md:text-base">Abrir →</span>
            </div>

            <h3 className="text-3xl font-bold md:text-4xl">Ofertas</h3>
            <p className="mt-4 text-base text-slate-300 md:text-lg">
              Promoções do comércio local e oportunidades especiais.
            </p>

            <div className="mt-10 inline-flex items-center rounded-full border border-white/10 bg-black/20 px-5 py-3 text-sm font-semibold text-white transition group-hover:bg-black/30 md:text-base">
              Explorar ofertas →
            </div>
          </Link>

          <Link
            href="/servicos"
            className="group rounded-[30px] border border-amber-500/20 bg-gradient-to-br from-amber-900/30 to-slate-800/40 p-7 shadow-xl transition hover:-translate-y-1 hover:border-amber-400/40 hover:bg-amber-900/30"
          >
            <div className="mb-8 flex items-center justify-between">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-black/20 text-2xl">
                🧰
              </div>
              <span className="text-sm text-slate-300 md:text-base">Abrir →</span>
            </div>

            <h3 className="text-3xl font-bold md:text-4xl">Serviços</h3>
            <p className="mt-4 text-base text-slate-300 md:text-lg">
              Profissionais por categoria, com contato rápido.
            </p>

            <div className="mt-10 inline-flex items-center rounded-full border border-white/10 bg-black/20 px-5 py-3 text-sm font-semibold text-white transition group-hover:bg-black/30 md:text-base">
              Encontrar profissional →
            </div>
          </Link>

          <Link
            href="/classificados"
            className="group rounded-[30px] border border-emerald-500/20 bg-gradient-to-br from-emerald-900/30 to-teal-900/20 p-7 shadow-xl transition hover:-translate-y-1 hover:border-emerald-400/40 hover:bg-emerald-900/30"
          >
            <div className="mb-8 flex items-center justify-between">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-black/20 text-2xl">
                📄
              </div>
              <span className="text-sm text-slate-300 md:text-base">Abrir →</span>
            </div>

            <h3 className="text-3xl font-bold md:text-4xl">Classificados</h3>
            <p className="mt-4 text-base text-slate-300 md:text-lg">
              Vendas, aluguel, anúncios e achados da cidade.
            </p>

            <div className="mt-10 inline-flex items-center rounded-full border border-white/10 bg-black/20 px-5 py-3 text-sm font-semibold text-white transition group-hover:bg-black/30 md:text-base">
              Ver classificados →
            </div>
          </Link>
        </div>
      </section>

      <section className="px-5 pb-14 md:px-8 md:pb-16">
        <div className="mx-auto w-full max-w-7xl">
          <h2 className="text-3xl font-bold md:text-4xl">Destaques</h2>
          <p className="mt-2 text-slate-300 md:text-lg">
            O que está em alta agora em Valente.
          </p>

          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <p className="text-sm font-semibold text-cyan-300 md:text-base">
                Oferta em destaque
              </p>
              <h3 className="mt-3 text-xl font-bold md:text-2xl">
                Promoções locais
              </h3>
              <p className="mt-3 text-sm text-slate-300 md:text-base">
                Espaço ideal para divulgar os melhores preços e campanhas da cidade.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <p className="text-sm font-semibold text-amber-300 md:text-base">
                Serviço em alta
              </p>
              <h3 className="mt-3 text-xl font-bold md:text-2xl">
                Profissionais da região
              </h3>
              <p className="mt-3 text-sm text-slate-300 md:text-base">
                Reúna pedreiros, eletricistas, pintores, mecânicos e muitos outros.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <p className="text-sm font-semibold text-emerald-300 md:text-base">
                Classificado recente
              </p>
              <h3 className="mt-3 text-xl font-bold md:text-2xl">
                Oportunidades da comunidade
              </h3>
              <p className="mt-3 text-sm text-slate-300 md:text-base">
                Espaço para vendas, aluguel e anúncios úteis para toda a cidade.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}