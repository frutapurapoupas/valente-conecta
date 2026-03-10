"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Item = {
  href: string;
  label: string;
  icon: string;
};

const items: Item[] = [
  { href: "/", label: "Início", icon: "🏠" },
  { href: "/ofertas", label: "Ofertas", icon: "🏷️" },
  { href: "/classificados", label: "Classif.", icon: "📦" },
  { href: "/servicos", label: "Serviços", icon: "🛠️" },
  { href: "/indicar", label: "Conta", icon: "👤" },
];

export default function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <>
      <div className="h-24 md:hidden" />

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-slate-950/92 backdrop-blur-xl md:hidden">
        <div className="mx-auto flex max-w-3xl items-end justify-between px-3 pb-[max(10px,env(safe-area-inset-bottom))] pt-2">
          {items.slice(0, 2).map((item) => {
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex min-w-[64px] flex-col items-center justify-center rounded-2xl px-3 py-2 text-[11px] transition ${
                  active ? "text-emerald-400" : "text-slate-300"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="mt-1">{item.label}</span>
              </Link>
            );
          })}

          <Link
            href="/classificados/publicar"
            className="relative -mt-7 flex h-16 w-16 items-center justify-center rounded-full border border-emerald-300/30 bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-[0_12px_40px_rgba(16,185,129,0.35)] transition active:scale-95"
            aria-label="Publicar anúncio"
          >
            <span className="text-3xl leading-none">＋</span>
          </Link>

          {items.slice(2).map((item) => {
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex min-w-[64px] flex-col items-center justify-center rounded-2xl px-3 py-2 text-[11px] transition ${
                  active ? "text-emerald-400" : "text-slate-300"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="mt-1">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}