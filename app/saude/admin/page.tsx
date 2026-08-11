"use client";

// Caminho: C:\valente_conecta\app\saude\admin\page.tsx

import { LojaAdminShell } from "@/components/catalogo/LojaAdminShell";
import { CATEGORIAS_POR_MODULO } from "@/lib/catalogo/modulosConfig";

export default function SaudeAdminPage() {
  return <LojaAdminShell modulo="saude" labelModulo="Saúde" categorias={CATEGORIAS_POR_MODULO.saude} />;
}
