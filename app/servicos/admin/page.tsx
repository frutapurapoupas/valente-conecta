"use client";

// Caminho: C:\valente_conecta\app\servicos\admin\page.tsx
// Painel do prestador de serviço (camada 2 — admin da loja/serviço).

import { LojaAdminShell } from "@/components/catalogo/LojaAdminShell";
import { CATEGORIAS_POR_MODULO } from "@/lib/catalogo/modulosConfig";

export default function ServicosAdminPage() {
  return <LojaAdminShell modulo="servicos" labelModulo="Serviços" categorias={CATEGORIAS_POR_MODULO.servicos} />;
}
