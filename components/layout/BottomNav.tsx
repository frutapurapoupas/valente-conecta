"use client";

// Caminho: C:\valente_conecta\components\layout\BottomNav.tsx
//
// Barra de navegacao persistente do app do consumidor -- antes so existia
// dentro de app/page.tsx (so' aparecia na home). Extraida daqui pra virar
// componente unico, montado direto em app/layout.tsx, pra existir em toda
// tela do consumidor e nao so' na primeira. Ver diagnostico de UX (achado
// "nao existe navegacao persistente fora da home").

import { usePathname, useRouter } from "next/navigation";
import { Home as HomeIcon, CreditCard, Wallet, User } from "lucide-react";

const ITENS = [
  { href: "/", label: "Início", Icone: HomeIcon },
  { href: "/planos", label: "Planos", Icone: CreditCard },
  { href: "/carteira", label: "Carteira", Icone: Wallet },
  { href: "/profile", label: "Perfil", Icone: User },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-2 flex justify-between items-center z-50 shadow-lg">
      {ITENS.map(({ href, label, Icone }) => {
        const ativo = href === "/" ? pathname === "/" : pathname?.startsWith(href);
        return (
          <button
            key={href}
            onClick={() => router.push(href)}
            className={`flex flex-col items-center ${ativo ? "text-blue-600" : "text-slate-500 hover:text-slate-700"}`}
          >
            <Icone size={20} />
            <span className={`text-[13px] mt-1 ${ativo ? "font-bold" : "font-medium"}`}>{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
