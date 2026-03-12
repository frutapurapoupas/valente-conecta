import Link from "next/link";

export default function CarteiraPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-amber-300">
              Carteira digital
            </p>
            <h1 className="mt-2 text-3xl font-bold">Moeda CONECTA</h1>
            <p className="mt-2 text-white/70">
              Acompanhe saldo, cashback e benefícios da economia local.
            </p>
          </div>

          <Link
            href="/"
            className="inline-flex items-center rounded-xl border border-white/10 px-4 py-3 text-sm hover:bg-white/5"
          >
            Voltar à home
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <section className="rounded-3xl border border-amber-400/20 bg-gradient-to-r from-amber-500/10 to-yellow-500/10 p-6 shadow-xl">
            <p className="text-sm uppercase tracking-[0.2em] text-amber-200">
              Saldo atual
            </p>
            <div className="mt-3 text-4xl font-bold">R$ 0,00</div>
            <p className="mt-4 text-sm leading-6 text-white/75">
              Valor ilustrativo. Aqui o usuário visualiza o saldo disponível da
              moeda digital CONECTA.
            </p>
          </section>

          <section className="rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-xl">
            <p className="text-sm uppercase tracking-[0.2em] text-emerald-400">
              Cashback
            </p>
            <h2 className="mt-2 text-2xl font-bold">
              Ganhe comprando em parceiros
            </h2>
            <p className="mt-4 text-sm leading-7 text-white/70">
              O usuário compra em estabelecimentos parceiros, acumula vantagens
              e depois pode usar esses benefícios dentro do ecossistema local.
            </p>
          </section>
        </div>

        <section className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-slate-900 p-5">
            <p className="text-sm uppercase tracking-[0.2em] text-white/45">
              Uso
            </p>
            <p className="mt-3 text-sm text-white/70">
              Utilize a moeda CONECTA em estabelecimentos participantes.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900 p-5">
            <p className="text-sm uppercase tracking-[0.2em] text-white/45">
              Histórico
            </p>
            <p className="mt-3 text-sm text-white/70">
              Consulte entradas, saídas e movimentações da carteira digital.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900 p-5">
            <p className="text-sm uppercase tracking-[0.2em] text-white/45">
              Parceiros
            </p>
            <p className="mt-3 text-sm text-white/70">
              Descubra onde acumular e onde utilizar os benefícios da CONECTA.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}