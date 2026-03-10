"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function MenuApp() {
  const pathname = usePathname();

  const items = [
    { href: "/conecta", label: "Conecta" },
    { href: "/ofertas", label: "Ofertas" },
    { href: "/carteira", label: "Carteira" },
    { href: "/pagar", label: "Pagar" },
    { href: "/convide-e-compre", label: "Convite" },
    { href: "/comerciante/caixa", label: "Caixa" },
    { href: "/comerciante/painel", label: "Painel" },
  ];

  return (
    <nav className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-3 py-3">
        {items.map((item) => {
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={
                active
                  ? "whitespace-nowrap rounded-xl border border-cyan-400 bg-cyan-500/20 px-4 py-2 text-sm font-medium text-cyan-300 transition"
                  : "whitespace-nowrap rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-slate-500 hover:text-white"
              }
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}