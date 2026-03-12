import Link from "next/link";

const quickLinks = [
  {
    href: "/ofertas",
    emoji: "🔥",
    title: "Ofertas",
    description: "Promoções e oportunidades da cidade",
  },
  {
    href: "/classificados",
    emoji: "📦",
    title: "Classificados",
    description: "Compra, venda e anúncios locais",
  },
  {
    href: "/empresas",
    emoji: "🏢",
    title: "Empresas",
    description: "Encontre comércios e parceiros locais",
  },
  {
    href: "/servicos",
    emoji: "🔧",
    title: "Profissionais",
    description: "Eletricista, pedreiro, diarista e mais",
  },
  {
    href: "/indicar",
    emoji: "🎁",
    title: "Indicar e ganhar",
    description: "Convide pessoas e acompanhe seus créditos",
  },
  {
    href: "/carteira",
    emoji: "💰",
    title: "Carteira CONECTA",
    description: "Veja saldo, cashback e uso em parceiros",
  },
  {
    href: "/publicar",
    emoji: "📝",
    title: "Publicar",
    description: "Área de gestão e publicação de conteúdos",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="border-b border-white/10 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.18),transparent_40%),radial-gradient(circle_at_right,rgba(59,130,246,0.12),transparent_35%)]">
        <div className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-14">
          <div className="max-w-3xl">
            <p className="text-sm uppercase tracking-[0.25em] text-emerald-400">
              Valente Conecta
            </p>

            <h1 className="mt-3 text-3xl font-bold leading-tight md:text-5xl">
              A economia da cidade na palma da sua mão
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-7 text-white/75 md:text-lg">
              Encontre empresas, profissionais, ofertas, classificados e use a
              moeda digital CONECTA para fortalecer o comércio local.
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-[1fr_auto]">
            <div className="rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-4 shadow-xl">
              <p className="text-sm text-white/55">Busca rápida</p>
              <p className="mt-2 text-sm text-white/75">
                Empresas, profissionais, ofertas e serviços reunidos em um só lugar.
              </p>
            </div>

            <Link
              href="/carteira"
              className="inline-flex items-center justify-center rounded-2xl bg-emerald-500 px-5 py-4 text-sm font-semibold text-slate-950 shadow-lg"
            >
              Ver minha carteira
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8 md:px-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {quickLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-2xl border border-white/10 bg-slate-900 p-5 transition hover:border-emerald-400/40 hover:bg-slate-900/90"
            >
              <div className="text-3xl">{item.emoji}</div>
              <div className="mt-3 text-lg font-bold">{item.title}</div>
              <div className="mt-2 text-sm leading-6 text-white/60">
                {item.description}
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-8 md:px-6">
        <div className="rounded-3xl border border-amber-400/20 bg-gradient-to-r from-amber-500/10 to-yellow-500/10 p-6 shadow-xl">
          <p className="text-sm uppercase tracking-[0.25em] text-amber-300">
            Moeda digital CONECTA
          </p>

          <h2 className="mt-3 text-2xl font-bold md:text-3xl">
            Ganhe cashback e use em estabelecimentos parceiros
          </h2>

          <p className="mt-4 max-w-3xl text-sm leading-7 text-white/75 md:text-base">
            A CONECTA é o diferencial do projeto. Comprando em parceiros
            participantes, o usuário acumula benefícios e pode acompanhar tudo
            na carteira digital.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/carteira"
              className="rounded-xl bg-amber-400 px-5 py-3 text-sm font-semibold text-slate-950"
            >
              Ver minha carteira
            </Link>

            <Link
              href="/empresas"
              className="rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold hover:bg-white/5"
            >
              Ver parceiros
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-12 md:px-6">
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-slate-900 p-5">
            <p className="text-sm uppercase tracking-[0.2em] text-emerald-400">
              Empresas
            </p>
            <h3 className="mt-2 text-xl font-bold">Guia de empresas locais</h3>
            <p className="mt-3 text-sm leading-6 text-white/65">
              Descubra lojas, comércios, restaurantes, farmácias e parceiros
              participantes em Valente e região.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900 p-5">
            <p className="text-sm uppercase tracking-[0.2em] text-cyan-400">
              Profissionais
            </p>
            <h3 className="mt-2 text-xl font-bold">Serviços e mão de obra</h3>
            <p className="mt-3 text-sm leading-6 text-white/65">
              Encontre profissionais por categoria: eletricista, encanador,
              pedreiro, pintor, diarista e muito mais.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900 p-5">
            <p className="text-sm uppercase tracking-[0.2em] text-fuchsia-400">
              Gestão
            </p>
            <h3 className="mt-2 text-xl font-bold">Publicar e administrar</h3>
            <p className="mt-3 text-sm leading-6 text-white/65">
              Área voltada à publicação de conteúdo, ofertas, classificados e
              gestão do ecossistema do app.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}