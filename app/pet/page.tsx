"use client";

// Caminho: C:\valente_conecta\app\pet\page.tsx
// Modulo novo (nao existia nenhuma rota).

import { CatalogoModuloPage } from "@/components/catalogo/CatalogoModuloPage";
import { CATEGORIAS_POR_MODULO } from "@/lib/catalogo/modulosConfig";

export default function PetPage() {
  return (
    <CatalogoModuloPage
      modulo="pet"
      labelModulo="Pet Shop"
      categorias={CATEGORIAS_POR_MODULO.pet}
      descricao="Ração, banho e tosa, veterinários e adestramento para seu bichinho."
    />
  );
}
