"use client";

// Caminho: C:\valente_conecta\app\servicos\page.tsx

import { CatalogoModuloPage } from "@/components/catalogo/CatalogoModuloPage";
import { CATEGORIAS_POR_MODULO } from "@/lib/catalogo/modulosConfig";
import { DiretorioComercios } from "@/components/comercios/DiretorioComercios";

export default function ServicosPage() {
  return (
    <>
      <div className="max-w-6xl mx-auto p-4 sm:p-6 pb-0">
        <DiretorioComercios modulo="servicos" titulo="Serviços" categorias={CATEGORIAS_POR_MODULO.servicos} />
      </div>
      <div className="border-t mt-2">
        <CatalogoModuloPage
          modulo="servicos"
          labelModulo="Outros profissionais e serviços"
          categorias={CATEGORIAS_POR_MODULO.servicos}
          descricao="Profissionais autônomos, assistência técnica, beleza, eventos e mais."
        />
      </div>
    </>
  );
}
