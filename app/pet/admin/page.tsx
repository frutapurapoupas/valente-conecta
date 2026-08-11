"use client";

// Caminho: C:\valente_conecta\app\pet\admin\page.tsx

import { LojaAdminShell } from "@/components/catalogo/LojaAdminShell";
import { CATEGORIAS_POR_MODULO } from "@/lib/catalogo/modulosConfig";

export default function PetAdminPage() {
  return <LojaAdminShell modulo="pet" labelModulo="Pet Shop" categorias={CATEGORIAS_POR_MODULO.pet} />;
}
