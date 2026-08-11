"use client";

// Caminho: C:\valente_conecta\app\construcao\admin\page.tsx

import { LojaAdminShell } from "@/components/catalogo/LojaAdminShell";
import { CATEGORIAS_POR_MODULO } from "@/lib/catalogo/modulosConfig";

export default function ConstrucaoAdminPage() {
  return <LojaAdminShell modulo="construcao" labelModulo="Construção" categorias={CATEGORIAS_POR_MODULO.construcao} />;
}
