"use client";

// Caminho: C:\valente_conecta\app\pet\page.tsx

import { CatalogoModuloPage } from "@/components/catalogo/CatalogoModuloPage";
import { CATEGORIAS_POR_MODULO } from "@/lib/catalogo/modulosConfig";
import { DiretorioComercios } from "@/components/comercios/DiretorioComercios";

export default function PetPage() {
  return (
    <>
      <div className="max-w-6xl mx-auto p-4 sm:p-6 pb-0">
        <DiretorioComercios modulo="pet" titulo="Pet Shop" categorias={CATEGORIAS_POR_MODULO.pet} />
      </div>
      <div className="border-t mt-2">
        <CatalogoModuloPage
          modulo="pet"
          labelModulo="Outros produtos e serviços pet"
          categorias={CATEGORIAS_POR_MODULO.pet}
          descricao="Ração, banho e tosa, veterinários e adestramento para seu bichinho."
        />
      </div>
    </>
  );
}
