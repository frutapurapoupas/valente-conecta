import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-100 pb-24 px-4 pt-10">
      <div className="mx-auto max-w-3xl">

        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-900">
            Valente Conecta
          </h1>

          <p className="mt-2 text-slate-600">
            O aplicativo da cidade de Valente
          </p>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-4">

          <Link
            href="/ofertas"
            className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200 text-center hover:bg-slate-50"
          >
            <div className="text-3xl">🛒</div>
            <p className="mt-2 font-semibold text-slate-900">Ofertas</p>
          </Link>

          <Link
            href="/servicos"
            className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200 text-center hover:bg-slate-50"
          >
            <div className="text-3xl">🔧</div>
            <p className="mt-2 font-semibold text-slate-900">Serviços</p>
          </Link>

          <Link
            href="/classificados"
            className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200 text-center hover:bg-slate-50"
          >
            <div className="text-3xl">📦</div>
            <p className="mt-2 font-semibold text-slate-900">Classificados</p>
          </Link>

          <Link
            href="/indicar"
            className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200 text-center hover:bg-slate-50"
          >
            <div className="text-3xl">🤝</div>
            <p className="mt-2 font-semibold text-slate-900">
              Indique e Ganhe
            </p>
          </Link>

        </div>

      </div>
    </main>
  );
}