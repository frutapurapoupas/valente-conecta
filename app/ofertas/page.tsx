"use client";

import Link from "next/link";

export default function OfertasPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#041022] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.16),transparent_28%),radial-gradient(circle_at_right,rgba(249,115,22,0.14),transparent_22%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.14),transparent_26%)]" />

      <div className="relative z-10 min-h-screen">
        <header className="border-b border-white/10 bg-black/10 px-4 py-6 sm:px-6 md:px-8 lg:px-10 xl:px-12">
          <div className="mx-auto w-full max-w-[1700px]">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
              <div className="max-w-5xl">
                <div className="inline-flex items-center gap-3 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-medium text-cyan-200 sm:text-sm">
                  <span className="h-2.5 w-2.5 rounded-full bg-cyan-300" />
                  Valente Conecta
                </div>

                <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl xl:text-6xl">
                  Ofertas em destaque
                </h1>

                <p className="mt-4 max-w-4xl text-sm leading-7 text-slate-200 sm:text-base md:text-lg xl:text-xl">
                  Promoções do comércio local, campanhas especiais e oportunidades
                  da cidade em uma vitrine digital elegante, vibrante e organizada.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <span className="rounded-full border border-sky-400/20 bg-sky-400/10 px-4 py-2 text-xs text-sky-100 sm:text-sm">
                  Comércio local
                </span>

                <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-4 py-2 text-xs text-amber-100 sm:text-sm">
                  Promoções ativas
                </span>

                <Link
                  href="/"
                  className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/15"
                >
                  Voltar
                </Link>
              </div>
            </div>
          </div>
        </header>

        <section className="px-4 py-4 sm:px-6 sm:py-5 md:px-8 md:py-6 lg:px-10 xl:px-12">
          <div className="mx-auto w-full max-w-[1700px]">
            <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(135deg,rgba(10,26,52,0.96),rgba(8,18,36,0.98)_45%,rgba(14,39,61,0.95))] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.38)] sm:p-5 md:p-6 xl:p-8">
              <div className="grid gap-5 xl:grid-cols-[1.18fr_0.82fr] xl:items-stretch">
                <div className="flex flex-col gap-5">
                  <div className="rounded-[24px] border border-white/10 bg-[linear-gradient(135deg,rgba(14,165,233,0.12),rgba(59,130,246,0.08),rgba(249,115,22,0.08))] p-5 sm:p-6 md:p-7 xl:p-8">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300 sm:text-sm">
                      módulo principal
                    </p>

                    <h2 className="mt-3 text-2xl font-bold sm:text-3xl md:text-4xl xl:text-5xl">
                      Vitrine digital da cidade
                    </h2>

                    <p className="mt-4 max-w-5xl text-sm leading-7 text-slate-200 sm:text-base md:text-lg xl:text-xl">
                      Esta página foi pensada para crescer com elegância. Em vez
                      de abrir demais para os lados, ela mantém uma composição mais
                      proporcional e ganha presença também na vertical.
                    </p>

                    <div className="mt-6 flex flex-wrap gap-2.5 sm:gap-3">
                      <span className="rounded-full border border-cyan-400/15 bg-cyan-400/10 px-3 py-2 text-xs text-cyan-100 sm:text-sm">
                        Destaques do dia
                      </span>
                      <span className="rounded-full border border-blue-400/15 bg-blue-400/10 px-3 py-2 text-xs text-blue-100 sm:text-sm">
                        Empresas parceiras
                      </span>
                      <span className="rounded-full border border-orange-400/15 bg-orange-400/10 px-3 py-2 text-xs text-orange-100 sm:text-sm">
                        Visual premium
                      </span>
                    </div>
                  </div>

                  <div className="grid gap-5 lg:grid-cols-2">
                    <div className="min-h-[260px] rounded-[24px] border border-cyan-400/15 bg-[linear-gradient(180deg,rgba(14,165,233,0.16),rgba(255,255,255,0.03))] p-6 shadow-xl xl:min-h-[300px]">
                      <div className="mb-6 flex items-center justify-between">
                        <div className="flex h-14 w-14 items-center justify-center rounded-3xl border border-white/10 bg-black/20 text-2xl sm:h-16 sm:w-16 sm:text-3xl">
                          🛒
                        </div>
                        <span className="text-xs text-cyan-200 sm:text-sm">01</span>
                      </div>

                      <h3 className="text-xl font-bold sm:text-2xl xl:text-3xl">
                        Supermercados
                      </h3>

                      <p className="mt-4 text-sm leading-7 text-slate-100 sm:text-base sm:leading-8">
                        Promoções de alimentos, bebidas, limpeza e itens do lar com
                        forte apelo comercial.
                      </p>
                    </div>

                    <div className="min-h-[260px] rounded-[24px] border border-blue-400/15 bg-[linear-gradient(180deg,rgba(59,130,246,0.16),rgba(255,255,255,0.03))] p-6 shadow-xl xl:min-h-[300px]">
                      <div className="mb-6 flex items-center justify-between">
                        <div className="flex h-14 w-14 items-center justify-center rounded-3xl border border-white/10 bg-black/20 text-2xl sm:h-16 sm:w-16 sm:text-3xl">
                          🍔
                        </div>
                        <span className="text-xs text-blue-200 sm:text-sm">02</span>
                      </div>

                      <h3 className="text-xl font-bold sm:text-2xl xl:text-3xl">
                        Alimentação
                      </h3>

                      <p className="mt-4 text-sm leading-7 text-slate-100 sm:text-base sm:leading-8">
                        Área ideal para combos, delivery, pratos do dia e promoções
                        rápidas de bares e restaurantes.
                      </p>
                    </div>

                    <div className="min-h-[250px] rounded-[24px] border border-orange-400/15 bg-[linear-gradient(180deg,rgba(249,115,22,0.16),rgba(255,255,255,0.03))] p-6 shadow-xl lg:col-span-2 xl:min-h-[280px]">
                      <div className="mb-6 flex items-center justify-between">
                        <div className="flex h-14 w-14 items-center justify-center rounded-3xl border border-white/10 bg-black/20 text-2xl sm:h-16 sm:w-16 sm:text-3xl">
                          🏬
                        </div>
                        <span className="text-xs text-orange-200 sm:text-sm">03</span>
                      </div>

                      <h3 className="text-xl font-bold sm:text-2xl xl:text-3xl">
                        Lojas locais
                      </h3>

                      <p className="mt-4 max-w-4xl text-sm leading-7 text-slate-100 sm:text-base sm:leading-8">
                        Campanhas sazonais, descontos especiais e vitrines para
                        valorizar as empresas da cidade sem perder a sofisticação do layout.
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-5 xl:grid-cols-2">
                    <div className="min-h-[180px] rounded-[22px] border border-white/10 bg-white/5 p-6">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300 sm:text-sm">
                        integração futura
                      </p>

                      <p className="mt-4 text-sm leading-7 text-slate-200 sm:text-base sm:leading-8 md:text-lg">
                        As ofertas reais serão carregadas do Supabase com filtros,
                        destaques automáticos e organização por categoria.
                      </p>
                    </div>

                    <div className="min-h-[180px] rounded-[22px] border border-white/10 bg-white/5 p-6">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300 sm:text-sm">
                        experiência visual
                      </p>

                      <p className="mt-4 text-sm leading-7 text-slate-200 sm:text-base sm:leading-8 md:text-lg">
                        O crescimento acontece com mais altura e melhor distribuição,
                        preservando a elegância e a leitura da tela.
                      </p>
                    </div>
                  </div>
                </div>

                <aside className="flex flex-col gap-5">
                  <div className="rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-6 xl:min-h-[320px]">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-300 sm:text-sm">
                      painel lateral
                    </p>

                    <h3 className="mt-3 text-xl font-bold sm:text-2xl md:text-3xl">
                      Estrutura da área
                    </h3>

                    <div className="mt-5 space-y-4">
                      <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                        <p className="text-xs text-slate-400 sm:text-sm">Foco principal</p>
                        <p className="mt-2 text-base font-semibold sm:text-lg">
                          Promoções e campanhas
                        </p>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                        <p className="text-xs text-slate-400 sm:text-sm">Experiência</p>
                        <p className="mt-2 text-base font-semibold sm:text-lg">
                          Tela ampla sem distorcer
                        </p>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                        <p className="text-xs text-slate-400 sm:text-sm">Próximo encaixe</p>
                        <p className="mt-2 text-base font-semibold sm:text-lg">
                          Dados reais do banco
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 rounded-[24px] border border-white/10 bg-[linear-gradient(135deg,rgba(14,165,233,0.14),rgba(59,130,246,0.10),rgba(249,115,22,0.10))] p-6 xl:min-h-[380px]">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-300 sm:text-sm">
                      destaque visual
                    </p>

                    <h3 className="mt-3 text-xl font-bold sm:text-2xl md:text-3xl">
                      Página mais proporcional
                    </h3>

                    <p className="mt-4 text-sm leading-7 text-slate-100 sm:text-base sm:leading-8 md:text-lg">
                      Aqui a largura cresce com controle, mas a sensação de força
                      visual vem também dos blocos mais altos e da distribuição mais nobre.
                    </p>

                    <div className="mt-6 grid gap-4">
                      <div className="rounded-2xl border border-cyan-400/15 bg-cyan-400/10 p-5">
                        <p className="text-xs text-cyan-100 sm:text-sm">
                          Mais presença sem esticar demais
                        </p>
                      </div>

                      <div className="rounded-2xl border border-blue-400/15 bg-blue-400/10 p-5">
                        <p className="text-xs text-blue-100 sm:text-sm">
                          Melhor leitura em notebook
                        </p>
                      </div>

                      <div className="rounded-2xl border border-orange-400/15 bg-orange-400/10 p-5">
                        <p className="text-xs text-orange-100 sm:text-sm">
                          Elegância mantida no mobile
                        </p>
                      </div>
                    </div>
                  </div>
                </aside>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}