"use client";

// Caminho: C:\valente_conecta\app\mercados\page.tsx

import { CatalogoModuloPage } from "@/components/catalogo/CatalogoModuloPage";
import { CATEGORIAS_POR_MODULO } from "@/lib/catalogo/modulosConfig";
import { DiretorioComercios } from "@/components/comercios/DiretorioComercios";

export default function MercadosPage() {
  return (
    <>
      <div className="max-w-6xl mx-auto p-4 sm:p-6 pb-0">
        <DiretorioComercios modulo="mercados" titulo="Mercados" categorias={CATEGORIAS_POR_MODULO.mercados} />
      </div>
      <div className="border-t mt-2">
        <CatalogoModuloPage
          modulo="mercados"
          labelModulo="Outros mercados"
          categorias={CATEGORIAS_POR_MODULO.mercados}
          descricao="Mercearias, hortifrutis, açougues, padarias e bebidas perto de você."
        />
      </div>
    </>
  );
}
