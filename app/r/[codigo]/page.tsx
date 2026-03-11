import Link from "next/link";

type Props = {
  params: Promise<{
    codigo: string;
  }>;
};

export default async function RotaCodigoPage({ params }: Props) {
  const { codigo } = await params;

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-white">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/"
          className="mb-6 inline-block rounded-lg border border-white/15 px-4 py-2 text-sm hover:bg-white/5"
        >
          Voltar ao início
        </Link>

        <div className="rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-xl">
          <p className="text-sm uppercase tracking-widest text-emerald-400">
            Redirecionamento
          </p>

          <h1 className="mt-3 text-3xl font-bold">
            Código recebido: {codigo}
          </h1>

          <p className="mt-4 text-white/70">
            Esta é uma página temporária para manter o build estável. Na próxima
            etapa, podemos ligar esta rota à lógica real de indicação,
            redirecionamento ou consulta no Supabase.
          </p>
        </div>
      </div>
    </main>
  );
}