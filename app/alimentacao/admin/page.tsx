"use client";

import { LojaAdminShell } from "@/components/catalogo/LojaAdminShell";
import { CATEGORIAS_POR_MODULO } from "@/lib/catalogo/modulosConfig";

export default function AlimentacaoAdminPage() {
  return <LojaAdminShell modulo="alimentacao" labelModulo="Alimentação" categorias={CATEGORIAS_POR_MODULO.alimentacao} />;
}
