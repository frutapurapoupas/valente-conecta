import Link from "next/link";

const empresas = [
  { nome: "Mercado Central Ilustrativo", categoria: "Supermercado" },
  { nome: "Farmácia Popular Ilustrativa", categoria: "Farmácia" },
  { nome: "Loja Moda Centro Ilustrativa", categoria: "Vestuário" },
  { nome: "Pizzaria Sabor Local Ilustrativa", categoria: "Alimentação" },
  { nome: "Auto Peças Cidade Ilustrativa", categoria: "Autopeças" },
  { nome: "Casa do Material Ilustrativa", categoria: "Construção" },
];

export default function EmpresasPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-emerald-400">
              Guia de empresas
            </p>
            <h1 className="mt-2 text-3xl font-bold">Empresas locais</h1>
            <p className="mt-2 text-white/70">
              Encontre comércios e estabelecimentos parceiros do Valente Conecta.
            </p>
          </div>

          <Link
            href="/"
            className="inline-flex items-center rounded-xl border border-white/10 px-4 py-3 text-sm hover:bg-white/5"
          >
            Voltar à home
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {empresas.map((empresa) => (
            <div
              key={empresa.nome}
              className="rounded-2xl border border-white/10 bg-slate-900 p-5 shadow-xl"
            >
              <p className="text-xs uppercase tracking-widest text-emerald-400">
                {empresa.categoria}
              </p>
              <h2 className="mt-2 text-xl font-bold">{empresa.nome}</h2>
              <p className="mt-3 text-sm text-white/60">Cadastro ilustrativo</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}