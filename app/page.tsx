// app/page.tsx
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen w-full bg-[#061627] text-white">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(1100px_700px_at_20%_10%,rgba(59,130,246,0.35),transparent_60%),radial-gradient(900px_650px_at_80%_30%,rgba(249,115,22,0.25),transparent_55%),radial-gradient(900px_650px_at_50%_95%,rgba(34,197,94,0.18),transparent_55%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/60" />
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8 md:py-10">
        {/* Topbar */}
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-white/10 ring-1 ring-white/15 backdrop-blur-md flex items-center justify-center">
              <span className="text-lg font-semibold">V</span>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
                Valente Conecta
              </h1>
              <p className="text-sm text-white/70">
                Ofertas, serviços e oportunidades — tudo em um só lugar.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/80 ring-1 ring-white/15 backdrop-blur">
              Cidade
            </span>
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/90 ring-1 ring-white/15 backdrop-blur">
              Valente • BA
            </span>
            <Link
              href="/indicar"
              className="ml-auto md:ml-0 inline-flex items-center justify-center rounded-full bg-emerald-500/90 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-500 transition"
            >
              Indicar e ganhar R$1
            </Link>
          </div>
        </header>

        {/* Search + Quick chips */}
        <section className="mt-8 grid gap-4">
          <div className="rounded-3xl bg-white/8 ring-1 ring-white/15 backdrop-blur-xl p-4 md:p-5 shadow-2xl shadow-black/30">
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <div className="flex-1">
                <label className="text-xs text-white/70">Buscar no Valente Conecta</label>
                <div className="mt-2 flex items-center gap-2 rounded-2xl bg-black/25 ring-1 ring-white/10 px-3 py-3">
                  <span className="text-white/60">🔎</span>
                  <input
                    className="w-full bg-transparent outline-none placeholder:text-white/40 text-sm"
                    placeholder="Ex.: pizzaria, pedreiro, promoção, som automotivo..."
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Link
                  href="/ofertas"
                  className="inline-flex items-center justify-center rounded-2xl bg-blue-500/90 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-500 transition shadow-lg shadow-blue-500/20"
                >
                  Ver Ofertas
                </Link>
                <Link
                  href="/servicos"
                  className="inline-flex items-center justify-center rounded-2xl bg-white/10 px-4 py-3 text-sm font-semibold text-white ring-1 ring-white/15 hover:bg-white/15 transition"
                >
                  Ver Serviços
                </Link>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {[
                "🔥 Promoções do dia",
                "🍕 Food & Delivery",
                "🛠️ Pedreiro/Obras",
                "🚗 Oficina & Auto",
                "🎉 Eventos",
                "🏠 Aluguel",
                "📦 Vendas",
              ].map((t) => (
                <span
                  key={t}
                  className="rounded-full bg-white/8 px-3 py-1 text-xs text-white/75 ring-1 ring-white/10"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Main grid */}
        <section className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <HomeCard
            title="Ofertas"
            desc="Promoções do comércio local e oportunidades."
            icon="🏷️"
            href="/ofertas"
            accent="from-blue-500/30 to-cyan-400/10"
            cta="Explorar ofertas"
          />
          <HomeCard
            title="Serviços"
            desc="Profissionais por categoria, com contato rápido."
            icon="🧰"
            href="/servicos"
            accent="from-orange-500/30 to-yellow-400/10"
            cta="Encontrar profissional"
          />
          <HomeCard
            title="Classificados"
            desc="Vendas, aluguel, anúncios e achados da cidade."
            icon="🧾"
            href="/classificados"
            accent="from-emerald-500/30 to-lime-400/10"
            cta="Ver classificados"
          />
        </section>

        {/* Destaques */}
        <section className="mt-8">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h2 className="text-lg md:text-xl font-semibold">Destaques</h2>
              <p className="text-sm text-white/70">
                O que está em alta agora em Valente.
              </p>
            </div>
            <Link
              href="/cadastro"
              className="text-xs text-white/80 hover:text-white underline underline-offset-4"
            >
              Quero aparecer aqui →
            </Link>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            <HighlightCard
              title="Comércio local"
              subtitle="Ofertas do dia e cupons"
              badge="Popular"
              icon="🛒"
              href="/ofertas"
            />
            <HighlightCard
              title="Profissionais"
              subtitle="Serviços com contato rápido"
              badge="Recomendado"
              icon="👷"
              href="/servicos"
            />
            <HighlightCard
              title="Anúncios"
              subtitle="Vendas e oportunidades"
              badge="Novo"
              icon="📣"
              href="/classificados"
            />
          </div>
        </section>

        {/* Ações rápidas */}
        <section className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-3xl bg-white/8 ring-1 ring-white/15 backdrop-blur-xl p-5 shadow-2xl shadow-black/30">
            <h3 className="text-base font-semibold">Painel do Parceiro</h3>
            <p className="mt-1 text-sm text-white/70">
              Cadastre sua empresa e apareça no Valente Conecta.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href="/cadastro"
                className="inline-flex items-center justify-center rounded-2xl bg-white text-[#061627] px-4 py-2 text-sm font-semibold hover:bg-white/90 transition"
              >
                Cadastrar empresa
              </Link>
              <Link
                href="/cadastro"
                className="inline-flex items-center justify-center rounded-2xl bg-white/10 px-4 py-2 text-sm font-semibold text-white ring-1 ring-white/15 hover:bg-white/15 transition"
              >
                Entrar no painel
              </Link>
            </div>
          </div>

          <div className="rounded-3xl bg-white/8 ring-1 ring-white/15 backdrop-blur-xl p-5 shadow-2xl shadow-black/30">
            <h3 className="text-base font-semibold">Programa de Indicação</h3>
            <p className="mt-1 text-sm text-white/70">
              Indique o app e ganhe recompensas. Crescimento da cidade com você.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href="/indicar"
                className="inline-flex items-center justify-center rounded-2xl bg-emerald-500/90 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 transition shadow-lg shadow-emerald-500/20"
              >
                Indicar agora
              </Link>
              <span className="inline-flex items-center justify-center rounded-2xl bg-white/10 px-4 py-2 text-sm font-semibold text-white/80 ring-1 ring-white/15">
                Meta: 1.000 usuários
              </span>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-10 pb-6 text-center text-xs text-white/55">
          © {new Date().getFullYear()} Valente Conecta • Feito para fortalecer a economia local.
        </footer>
      </div>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-3 left-1/2 -translate-x-1/2 w-[92%] rounded-3xl bg-black/45 ring-1 ring-white/15 backdrop-blur-xl shadow-2xl shadow-black/40">
        <div className="grid grid-cols-4 gap-1 p-2">
          <BottomNavItem href="/" label="Início" icon="🏠" active />
          <BottomNavItem href="/ofertas" label="Ofertas" icon="🏷️" />
          <BottomNavItem href="/servicos" label="Serviços" icon="🧰" />
          <BottomNavItem href="/classificados" label="Classif." icon="🧾" />
        </div>
      </nav>
    </main>
  );
}

function HomeCard({
  title,
  desc,
  icon,
  href,
  accent,
  cta,
}: {
  title: string;
  desc: string;
  icon: string;
  href: string;
  accent: string;
  cta: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-3xl bg-white/8 ring-1 ring-white/15 backdrop-blur-xl p-5 shadow-2xl shadow-black/30 hover:bg-white/10 transition overflow-hidden relative"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${accent} opacity-70`} />
      <div className="relative">
        <div className="flex items-center justify-between">
          <div className="h-11 w-11 rounded-2xl bg-black/25 ring-1 ring-white/10 flex items-center justify-center">
            <span className="text-lg">{icon}</span>
          </div>
          <span className="text-xs text-white/70 group-hover:text-white transition">
            Abrir →
          </span>
        </div>

        <h3 className="mt-4 text-lg font-semibold">{title}</h3>
        <p className="mt-1 text-sm text-white/70">{desc}</p>

        <div className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-black/25 ring-1 ring-white/10 px-4 py-2 text-sm font-semibold text-white">
          {cta} <span className="text-white/70">→</span>
        </div>
      </div>
    </Link>
  );
}

function HighlightCard({
  title,
  subtitle,
  badge,
  icon,
  href,
}: {
  title: string;
  subtitle: string;
  badge: string;
  icon: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-3xl bg-white/8 ring-1 ring-white/15 backdrop-blur-xl p-5 shadow-2xl shadow-black/30 hover:bg-white/10 transition"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs text-white/80 ring-1 ring-white/10">
            <span>{badge}</span>
          </div>
          <h4 className="mt-3 text-base font-semibold">{title}</h4>
          <p className="mt-1 text-sm text-white/70">{subtitle}</p>
        </div>
        <div className="h-11 w-11 rounded-2xl bg-black/25 ring-1 ring-white/10 flex items-center justify-center">
          <span className="text-lg">{icon}</span>
        </div>
      </div>
    </Link>
  );
}

function BottomNavItem({
  href,
  label,
  icon,
  active,
}: {
  href: string;
  label: string;
  icon: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex flex-col items-center justify-center rounded-2xl px-2 py-2 text-xs transition ${
        active
          ? "bg-white/12 ring-1 ring-white/15 text-white"
          : "text-white/70 hover:text-white hover:bg-white/10"
      }`}
    >
      <span className="text-base leading-none">{icon}</span>
      <span className="mt-1">{label}</span>
    </Link>
  );
}