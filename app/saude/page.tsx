"use client";

// Caminho: C:\valente_conecta\app\saude\page.tsx
//
// Modulo novo. Arquetipo Agenda+Profissional (MASTER_SPEC secao 3) — nesta
// primeira etapa usa a mesma vitrine+interesse dos demais modulos; agenda
// com horarios reais e fila de espera em tempo real (secao 10) ficam para
// uma proxima passada, ja com dados reais de profissionais cadastrados.

import { CatalogoModuloPage } from "@/components/catalogo/CatalogoModuloPage";
import { CATEGORIAS_POR_MODULO } from "@/lib/catalogo/modulosConfig";

export default function SaudePage() {
  return (
    <CatalogoModuloPage
      modulo="saude"
      labelModulo="Saúde"
      categorias={CATEGORIAS_POR_MODULO.saude}
      descricao="Consultas, odontologia, fisioterapia, psicologia e exames na sua região."
    />
  );
}
