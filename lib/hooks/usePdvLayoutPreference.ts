// Caminho: C:\valente_conecta\lib\hooks\usePdvLayoutPreference.ts
//
// Preferência do lojista entre a frente de caixa versão celular (padrão
// pra quem não tem PC) ou computador (grade + carrinho lado a lado).
// Default automático pela largura da tela na primeira visita; depois disso
// fica salvo e não muda sozinho, mesmo que a janela seja redimensionada —
// é o lojista quem decide, via botão de alternância.

import { useEffect, useState } from "react";

export type LayoutPdv = "mobile" | "desktop";

const CHAVE = "pdv_layout_preferido";

export function usePdvLayoutPreference() {
  const [layout, setLayoutState] = useState<LayoutPdv>("mobile");
  const [carregado, setCarregado] = useState(false);

  useEffect(() => {
    const salvo = localStorage.getItem(CHAVE) as LayoutPdv | null;
    if (salvo === "mobile" || salvo === "desktop") {
      setLayoutState(salvo);
    } else {
      setLayoutState(window.innerWidth >= 768 ? "desktop" : "mobile");
    }
    setCarregado(true);
  }, []);

  const setLayout = (novo: LayoutPdv) => {
    setLayoutState(novo);
    localStorage.setItem(CHAVE, novo);
  };

  return { layout, setLayout, carregado };
}
