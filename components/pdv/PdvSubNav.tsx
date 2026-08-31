"use client";

// Caminho: C:\valente_conecta\components\pdv\PdvSubNav.tsx
// Navegação rápida entre as telas do PDV do comerciante — nenhuma delas
// linkava pra outra antes, cada uma só era alcançável por URL direta.

import Link from "next/link";
import { ShoppingCart, Package, Receipt, Wallet, FileText, Eye, FileSpreadsheet, Tag, Users, BarChart3 } from "lucide-react";
import { temPermissao, type OperadorAtivo } from "@/lib/pdv/operadorPdv";
import type { ChavePermissaoPdv } from "@/lib/pdv/permissoesFuncionario";

const ABAS: { href: string; chave: string; label: string; icone: typeof ShoppingCart; permissao?: ChavePermissaoPdv; soDono?: boolean }[] = [
  { href: "/pdv", chave: "vender", label: "Vender", icone: ShoppingCart },
  { href: "/pdv/estoque", chave: "estoque", label: "Estoque", icone: Package, permissao: "estoque" },
  { href: "/pdv/importar-estoque", chave: "importar-estoque", label: "Importar", icone: FileSpreadsheet, permissao: "importar-estoque" },
  { href: "/pdv/etiquetas", chave: "etiquetas", label: "Etiquetas", icone: Tag, permissao: "etiquetas" },
  { href: "/pdv/fiado", chave: "fiado", label: "Fiado", icone: Receipt, permissao: "fiado" },
  { href: "/pdv/caixa", chave: "caixa", label: "Caixa", icone: Wallet, permissao: "caixa" },
  { href: "/pdv/notas-fiscais", chave: "notas-fiscais", label: "Notas", icone: FileText, permissao: "notas-fiscais" },
  { href: "/pdv/relatorios", chave: "relatorios", label: "Relatórios", icone: BarChart3, permissao: "relatorios" },
  { href: "/pdv/captura-externa", chave: "captura-externa", label: "Captura", icone: Eye, permissao: "captura-externa" },
  { href: "/pdv/equipe", chave: "equipe", label: "Equipe", icone: Users, soDono: true },
];

export function PdvSubNav({
  ativa,
  operador,
}: {
  ativa: "vender" | "estoque" | "importar-estoque" | "etiquetas" | "fiado" | "caixa" | "notas-fiscais" | "relatorios" | "captura-externa" | "equipe";
  operador?: OperadorAtivo | null;
}) {
  const abasVisiveis = ABAS.filter((aba) => {
    if (aba.soDono) return !operador || operador.ehDono;
    if (!aba.permissao) return true;
    return temPermissao(operador ?? null, aba.permissao);
  });
  return (
    <div className="bg-white border-b px-4 flex gap-1 overflow-x-auto">
      {abasVisiveis.map((aba) => {
        const Icone = aba.icone;
        return (
          <Link
            key={aba.href}
            href={aba.href}
            className={`flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium border-b-2 -mb-px whitespace-nowrap ${
              aba.chave === ativa ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <Icone className="w-4 h-4" /> {aba.label}
          </Link>
        );
      })}
    </div>
  );
}
