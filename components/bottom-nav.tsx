"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNav() {
  const pathname = usePathname();

  function item(href: string, icon: string, label: string) {
    const ativo = pathname === href;

    return (
      <Link
        href={href}
        className={`flex min-w-[56px] flex-col items-center justify-center text-[11px] leading-tight ${
          ativo ? "text-emerald-600 font-semibold" : "text-slate-500"
        }`}
      >
        <span className="text-xl">{icon}</span>
        <span>{label}</span>
      </Link>
    );
  }

  const ativoNovo = pathname === "/classificados/publicar";

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex h-16 max-w-3xl items-center justify-around px-2">
        {item("/", "🏠", "Home")}

        {item("/ofertas", "🛒", "Ofertas")}

        <Link
          href="/classificados/publicar"
          aria-label="Novo anúncio"
          className="relative -mt-8 flex flex-col items-center justify-center"
        >
          <div
            className={`flex h-14 w-14 items-center justify-center rounded-full text-2xl text-white shadow-lg transition ${
              ativoNovo ? "bg-emerald-700" : "bg-emerald-600"
            }`}
          >
            +
          </div>
          <span className="mt-1 text-[11px] font-semibold text-slate-600">
            Novo
          </span>
        </Link>

        {item("/classificados", "📦", "Classificados")}

        {item("/indicar", "🤝", "Indicar")}
      </div>
    </nav>
  );
}