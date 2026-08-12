"use client";

// Caminho: C:\valente_conecta\app\moda\page.tsx
// Modulo novo — antes o botao "Moda" da home caia no generico /servicos.

import { CatalogoModuloPage } from "@/components/catalogo/CatalogoModuloPage";
import { CATEGORIAS_POR_MODULO } from "@/lib/catalogo/modulosConfig";

export default function ModaPage() {
  return (
    <CatalogoModuloPage
      modulo="moda"
      labelModulo="Moda"
      categorias={CATEGORIAS_POR_MODULO.moda}
      descricao="Roupas, calçados e acessórios femininos, masculinos e infantis perto de você."
    />
  );
}
