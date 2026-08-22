"use client";

// Caminho: C:\valente_conecta\components\pdv\PdvSubNav.tsx
// Navegação rápida entre as telas do PDV do comerciante — nenhuma delas
// linkava pra outra antes, cada uma só era alcançável por URL direta.

import Link from "next/link";
import { Package, Receipt, Wallet, FileText, Eye, FileSpreadsheet } from "lucide-react";

const ABAS = [
  { href: "/pdv/estoque", label: "Estoque", icone: Package },
  { href: "/pdv/importar-estoque", label: "Importar", icone: FileSpreadsheet },
  { href: "/pdv/fiado", label: "Fiado", icone: Receipt },
  { href: "/pdv/caixa", label: "Caixa", icone: Wallet },
  { href: "/pdv/notas-fiscais", label: "Notas", icone: FileText },
  { href: "/pdv/captura-externa", label: "Captura", icone: Eye },
];

export function PdvSubNav({ ativa }: { ativa: "estoque" | "importar-estoque" | "fiado" | "caixa" | "notas-fiscais" | "captura-externa" }) {
  return (
    <div className="bg-white border-b px-4 flex gap-1 overflow-x-auto">
      {ABAS.map((aba) => {
        const key = aba.href.split("/").pop();
        const Icone = aba.icone;
        return (
          <Link
            key={aba.href}
            href={aba.href}
            className={`flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium border-b-2 -mb-px whitespace-nowrap ${
              key === ativa ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <Icone className="w-4 h-4" /> {aba.label}
          </Link>
        );
      })}
    </div>
  );
}
