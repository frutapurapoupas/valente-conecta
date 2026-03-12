import Link from "next/link";

const profissionais = [
  { nome: "Eletricista Ilustrativo", categoria: "Elétrica" },
  { nome: "Pedreiro Ilustrativo", categoria: "Construção" },
  { nome: "Pintor Ilustrativo", categoria: "Pintura" },
  { nome: "Encanador Ilustrativo", categoria: "Hidráulica" },
  { nome: "Diarista Ilustrativa", categoria: "Limpeza" },
  { nome: "Técnico de Refrigeração Ilustrativo", categoria: "Refrigeração" },
];

export default function ServicosPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-cyan-400">
              Serviços e profissionais
            </p>
            <h1 className="mt-2 text-3xl font-bold">Profissionais da cidade</h1>
            <p className="mt-2 text-white/70">
              Encontre mão de obra e prestadores de serviço locais.
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
          {profissionais.map((item) => (
            <div
              key={item.nome}
              className="rounded-2xl border border-white/10 bg-slate-900 p-5 shadow-xl"
            >
              <p className="text-xs uppercase tracking-widest text-cyan-400">
                {item.categoria}
              </p>
              <h2 className="mt-2 text-xl font-bold">{item.nome}</h2>
              <p className="mt-3 text-sm text-white/60">Cadastro ilustrativo</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}