"use client";

// Caminho: C:\valente_conecta\app\construcao\page.tsx

import { MessageSquare } from "lucide-react";
import { CatalogoModuloPage } from "@/components/catalogo/CatalogoModuloPage";
import { CATEGORIAS_POR_MODULO } from "@/lib/catalogo/modulosConfig";
import { DiretorioComercios } from "@/components/comercios/DiretorioComercios";

export default function ConstrucaoPage() {
  return (
    <>
      <div className="max-w-6xl mx-auto p-4 sm:p-6 pb-0">
        <DiretorioComercios modulo="construcao" titulo="Construção" categorias={CATEGORIAS_POR_MODULO.construcao} />
      </div>
      <div className="border-t mt-2">
        <CatalogoModuloPage
          modulo="construcao"
          labelModulo="Outros materiais e serviços"
          categorias={CATEGORIAS_POR_MODULO.construcao}
          descricao="Materiais, aluguel de máquinas, mão de obra e projetos de engenharia."
          linkExtra={{ href: "/construcao/forum", label: "Fórum", icone: <MessageSquare className="w-4 h-4" /> }}
        />
      </div>
    </>
  );
}
