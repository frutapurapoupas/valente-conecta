"use client";

// Caminho: C:\valente_conecta\app\imoveis\admin\page.tsx

import { LojaAdminShell } from "@/components/catalogo/LojaAdminShell";
import { CATEGORIAS_POR_MODULO } from "@/lib/catalogo/modulosConfig";

export default function ImoveisAdminPage() {
  return <LojaAdminShell modulo="imoveis" labelModulo="Imóveis" categorias={CATEGORIAS_POR_MODULO.imoveis} />;
}
