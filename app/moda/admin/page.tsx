"use client";

// Caminho: C:\valente_conecta\app\moda\admin\page.tsx

import { LojaAdminShell } from "@/components/catalogo/LojaAdminShell";
import { CATEGORIAS_POR_MODULO } from "@/lib/catalogo/modulosConfig";

export default function ModaAdminPage() {
  return <LojaAdminShell modulo="moda" labelModulo="Moda" categorias={CATEGORIAS_POR_MODULO.moda} />;
}
