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
        className={`flex flex-col items-center justify-center text-xs ${
          ativo ? "text-emerald-600 font-semibold" : "text-slate-500"
        }`}
      >
        <span className="text-xl">{icon}</span>
        <span>{label}</span>
      </Link>
    );
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t border-slate-200 bg-white h-16 flex items-center justify-around z-50">

      {item("/", "🏠", "Home")}

      {item("/ofertas", "🛒", "Ofertas")}

      {item("/servicos", "🔧", "Serviços")}

      {item("/classificados", "📦", "Classificados")}

      {item("/indicar", "🤝", "Indicar")}

    </nav>
  );
}