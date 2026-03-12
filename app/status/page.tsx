import { Suspense } from "react";
import Link from "next/link";
import StatusClient from "./status-client";

export default function StatusPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-emerald-400">
              Valente Conecta
            </p>
            <h1 className="mt-2 text-3xl font-bold">Status</h1>
            <p className="mt-2 text-white/70">
              Acompanhe aqui o retorno do seu cadastro, indicação ou operação.
            </p>
          </div>

          <Link
            href="/"
            className="inline-flex items-center rounded-xl border border-white/10 px-4 py-3 text-sm hover:bg-white/5"
          >
            Voltar ao início
          </Link>
        </div>

        <Suspense
          fallback={
            <div className="rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-xl">
              <p className="text-white/70">Carregando status...</p>
            </div>
          }
        >
          <StatusClient />
        </Suspense>
      </div>
    </main>
  );
}