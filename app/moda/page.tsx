"use client";

// Caminho: C:\valente_conecta\app\moda\page.tsx

import { CatalogoModuloPage } from "@/components/catalogo/CatalogoModuloPage";
import { CATEGORIAS_POR_MODULO } from "@/lib/catalogo/modulosConfig";
import { DiretorioComercios } from "@/components/comercios/DiretorioComercios";

export default function ModaPage() {
  return (
    <>
      <div className="max-w-6xl mx-auto p-4 sm:p-6 pb-0">
        <DiretorioComercios modulo="moda" titulo="Moda" categorias={CATEGORIAS_POR_MODULO.moda} />
      </div>
      <div className="border-t mt-2">
        <CatalogoModuloPage
          modulo="moda"
          labelModulo="Outras lojas de moda"
          categorias={CATEGORIAS_POR_MODULO.moda}
          descricao="Roupas, calçados e acessórios femininos, masculinos e infantis perto de você."
        />
      </div>
    </>
  );
}
