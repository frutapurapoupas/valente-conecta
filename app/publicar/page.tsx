import Link from "next/link";
import AppShell from "@/components/AppShell";

export default function PublicarPage() {
  return (
    <AppShell
      title="Publicar e gerenciar"
      subtitle="Escolha qual área deseja administrar."
    >
      <div className="grid-cards">
        <Link href="/admin/ofertas" className="card block">
          <div className="text-2xl">🏷️</div>
          <h2 className="mt-2 text-lg font-bold">Gerenciar ofertas</h2>
          <p className="mt-1 text-sm text-slate-500">
            Crie, edite ou exclua promoções.
          </p>
        </Link>

        <Link href="/admin/classificados" className="card block">
          <div className="text-2xl">📦</div>
          <h2 className="mt-2 text-lg font-bold">Gerenciar classificados</h2>
          <p className="mt-1 text-sm text-slate-500">
            Publique e atualize anúncios.
          </p>
        </Link>

        <Link href="/admin/empresas" className="card block">
          <div className="text-2xl">🏢</div>
          <h2 className="mt-2 text-lg font-bold">Gerenciar empresas</h2>
          <p className="mt-1 text-sm text-slate-500">
            Cadastre parceiros e negócios locais.
          </p>
        </Link>

        <Link href="/admin/dashboard" className="card block">
          <div className="text-2xl">📊</div>
          <h2 className="mt-2 text-lg font-bold">Painel admin</h2>
          <p className="mt-1 text-sm text-slate-500">
            Veja o resumo geral em tempo real.
          </p>
        </Link>
      </div>
    </AppShell>
  );
}