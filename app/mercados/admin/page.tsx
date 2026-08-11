"use client";

// Caminho: C:\valente_conecta\app\mercados\admin\page.tsx

import { LojaAdminShell } from "@/components/catalogo/LojaAdminShell";
import { CATEGORIAS_POR_MODULO } from "@/lib/catalogo/modulosConfig";

export default function MercadosAdminPage() {
  return <LojaAdminShell modulo="mercados" labelModulo="Mercados" categorias={CATEGORIAS_POR_MODULO.mercados} />;
}
