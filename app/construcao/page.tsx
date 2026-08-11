"use client";

// Caminho: C:\valente_conecta\app\construcao\page.tsx
// Modulo novo (nao existia nenhuma rota).

import { CatalogoModuloPage } from "@/components/catalogo/CatalogoModuloPage";
import { CATEGORIAS_POR_MODULO } from "@/lib/catalogo/modulosConfig";

export default function ConstrucaoPage() {
  return (
    <CatalogoModuloPage
      modulo="construcao"
      labelModulo="Construção"
      categorias={CATEGORIAS_POR_MODULO.construcao}
      descricao="Materiais, aluguel de máquinas, mão de obra e projetos de engenharia."
    />
  );
}
