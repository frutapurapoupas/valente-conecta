"use client";

// Caminho: C:\valente_conecta\app\servicos\page.tsx
//
// Antes: abas com dados mockados fixos (profissionais/veiculos/imoveis) sem
// nenhuma persistencia real. Agora usa a fundacao unica do catalogo
// (catalogo_itens, modulo='servicos'), integrada a busca inteligente.

import { CatalogoModuloPage } from "@/components/catalogo/CatalogoModuloPage";
import { CATEGORIAS_POR_MODULO } from "@/lib/catalogo/modulosConfig";

export default function ServicosPage() {
  return (
    <CatalogoModuloPage
      modulo="servicos"
      labelModulo="Serviços"
      categorias={CATEGORIAS_POR_MODULO.servicos}
      descricao="Profissionais autônomos, assistência técnica, beleza, eventos e mais."
    />
  );
}
