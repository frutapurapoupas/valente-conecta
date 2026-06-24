// app/cozinha/catalogo/page.tsx
// 🧠 LÓGICA - Catálogo com Abas (usando CatalogoUI)

"use client";

import { useCatalogo } from '@/hooks/cozinha/useCatalogo';
import CatalogoUI from '@/components/cozinha/CatalogoUI';

export default function CatalogoPage() {
  const {
    pratos,
    sobremesas,
    loading,
    desconto,
    perfil,
    aumentar,
    diminuir,
    getQuantidade,
    limparQuantidades
  } = useCatalogo();

  return (
    <CatalogoUI
      pratos={pratos}
      sobremesas={sobremesas}
      loading={loading}
      onAumentar={aumentar}
      onDiminuir={diminuir}
      getQuantidade={getQuantidade}
      onLimparCarrinho={limparQuantidades}
      desconto={desconto}
      perfil={perfil}
    />
  );
}