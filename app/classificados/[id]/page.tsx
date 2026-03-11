import Link from "next/link";

type Props = {
  params: {
    id: string;
  };
};

export default function ClassificadoDetalhePage({ params }: Props) {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-white">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/classificados"
          className="mb-6 inline-block rounded-lg border border-white/15 px-4 py-2 text-sm hover:bg-white/5"
        >
          Voltar para classificados
        </Link>

        <div className="rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-xl">
          <p className="text-sm uppercase tracking-widest text-emerald-400">
            Classificado
          </p>

          <h1 className="mt-3 text-3xl font-bold">
            Detalhe do classificado #{params.id}
          </h1>

          <p className="mt-4 text-white/70">
            Esta é uma página de detalhe temporária para garantir o funcionamento
            do build. Na próxima etapa, podemos ligar esta rota ao Supabase e
            exibir os dados reais do anúncio.
          </p>
        </div>
      </div>
    </main>
  );
}