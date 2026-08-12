"use client";

// Caminho: C:\valente_conecta\app\mercados\page.tsx
// Modulo novo (nao existia rota dedicada — so as abas mockadas de app/comercio).

import { CatalogoModuloPage } from "@/components/catalogo/CatalogoModuloPage";
import { CATEGORIAS_POR_MODULO } from "@/lib/catalogo/modulosConfig";

export default function MercadosPage() {
  return (
    <CatalogoModuloPage
      modulo="mercados"
      labelModulo="Mercados"
      categorias={CATEGORIAS_POR_MODULO.mercados}
      descricao="Mercearias, hortifrutis, açougues, padarias e bebidas perto de você."
    />
  );
}
