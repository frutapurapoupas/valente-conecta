"use client";

// Caminho: C:\valente_conecta\app\alimentacao\page.tsx

import { CatalogoModuloPage } from "@/components/catalogo/CatalogoModuloPage";
import { CATEGORIAS_POR_MODULO } from "@/lib/catalogo/modulosConfig";
import { DiretorioComercios } from "@/components/comercios/DiretorioComercios";

export default function AlimentacaoPage() {
  return (
    <>
      <div className="max-w-6xl mx-auto p-4 sm:p-6 pb-0">
        <DiretorioComercios modulo="alimentacao" titulo="Alimentação" categorias={CATEGORIAS_POR_MODULO.alimentacao} />
      </div>
      <div className="border-t mt-2">
        <CatalogoModuloPage
          modulo="alimentacao"
          labelModulo="Outros restaurantes e lanchonetes"
          categorias={CATEGORIAS_POR_MODULO.alimentacao}
          descricao="Restaurantes, lanchonetes, pizzarias e bares perto de você."
        />
      </div>
    </>
  );
}
