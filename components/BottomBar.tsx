"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const itemBase =
  "flex flex-col items-center justify-center text-[11px] font-semibold transition";
const activeClass = "text-green-600";
const inactiveClass = "text-slate-500";

export default function BottomBar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto grid h-[78px] max-w-[520px] grid-cols-5 items-center px-3">
        <Link
          href="/"
          className={`${itemBase} ${isActive("/") ? activeClass : inactiveClass}`}
        >
          <span className="text-lg">🏠</span>
          <span>Início</span>
        </Link>

        <Link
          href="/ofertas"
          className={`${itemBase} ${isActive("/ofertas") ? activeClass : inactiveClass}`}
        >
          <span className="text-lg">🏷️</span>
          <span>Ofertas</span>
        </Link>

        <div className="flex items-center justify-center">
          <Link
            href="/publicar"
            className="flex h-16 w-16 -translate-y-5 items-center justify-center rounded-full bg-green-600 text-center text-sm font-bold text-white shadow-lg shadow-green-600/30 transition hover:scale-[1.03] hover:bg-green-700"
          >
            Publicar
          </Link>
        </div>

        <Link
          href="/indicar"
          className={`${itemBase} ${isActive("/indicar") ? activeClass : inactiveClass}`}
        >
          <span className="text-lg">📲</span>
          <span>Indicar</span>
        </Link>

        <Link
          href="/cadastro"
          className={`${itemBase} ${isActive("/cadastro") ? activeClass : inactiveClass}`}
        >
          <span className="text-lg">👤</span>
          <span>Cadastro</span>
        </Link>
      </div>
    </div>
  );
}