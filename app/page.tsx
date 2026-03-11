import Link from "next/link";
import AppShell from "@/components/AppShell";

export default function HomePage() {
  return (
    <AppShell>
      <div className="hero-card">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold opacity-90">VALENTE CONECTA</p>
            <h1 className="mt-1 text-3xl font-extrabold leading-tight">
              O super app
              <br />
              da cidade
            </h1>
            <p className="mt-3 text-sm opacity-95">
              Ofertas, classificados, divulgação local e programa de indicação
              em um só lugar.
            </p>
          </div>

          <img
            src="/logo-valente-conecta.png"
            alt="Valente Conecta"
            className="h-16 w-16 rounded-2xl bg-white/90 p-2"
          />
        </div>
      </div>

      <div className="mt-4 card">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="section-title">Acesso rápido</h2>
            <p className="mt-1 text-sm text-slate-500">
              Escolha uma área para entrar.
            </p>
          </div>
          <span className="badge">App ativo</span>
        </div>

        <div className="quick-grid">
          <Link href="/ofertas" className="quick-tile">
            <div className="text-2xl">🏷️</div>
            <div className="mt-2 font-bold">Ofertas</div>
            <div className="mt-1 text-sm text-slate-500">
              Promoções em destaque
            </div>
          </Link>

          <Link href="/classificados" className="quick-tile">
            <div className="text-2xl">📦</div>
            <div className="mt-2 font-bold">Classificados</div>
            <div className="mt-1 text-sm text-slate-500">
              Compra, venda e anúncios
            </div>
          </Link>

          <Link href="/indicar" className="quick-tile">
            <div className="text-2xl">📲</div>
            <div className="mt-2 font-bold">Indicar</div>
            <div className="mt-1 text-sm text-slate-500">
              Gere seu link e QR Code
            </div>
          </Link>

          <Link href="/publicar" className="quick-tile">
            <div className="text-2xl">➕</div>
            <div className="mt-2 font-bold">Publicar</div>
            <div className="mt-1 text-sm text-slate-500">
              Área de gestão e cadastro
            </div>
          </Link>
        </div>
      </div>

      <div className="mt-4 grid-cards">
        <div className="card">
          <h3 className="section-title">Programa de indicação</h3>
          <p className="mt-2 text-sm text-slate-600">
            Compartilhe seu QR Code ou copie o link para enviar no WhatsApp.
          </p>
          <Link href="/indicar" className="btn-primary mt-4">
            Abrir tela de indicação
          </Link>
        </div>
      </div>
    </AppShell>
  );
}