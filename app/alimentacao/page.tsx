"use client";

import { CatalogoModuloPage } from "@/components/catalogo/CatalogoModuloPage";
import { CATEGORIAS_POR_MODULO } from "@/lib/catalogo/modulosConfig";

export default function AlimentacaoPage() {
  return (
    <CatalogoModuloPage
      modulo="alimentacao"
      labelModulo="Alimentação"
      categorias={CATEGORIAS_POR_MODULO.alimentacao}
      descricao="Restaurantes, lanchonetes, pizzarias e bares perto de você."
    />
  );
}
