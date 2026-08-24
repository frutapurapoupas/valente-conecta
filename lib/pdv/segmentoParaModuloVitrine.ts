// Caminho: C:\valente_conecta\lib\pdv\segmentoParaModuloVitrine.ts
//
// Mapeia o segmento do catálogo interno do PDV (pdv_produtos_catalogo.segmento)
// pro módulo da vitrine pública (catalogo_itens.modulo — lib/catalogo/marketplaceTypes.ts).
// Os dois vocabulários não batem 1-pra-1: só "mercado"→"mercados" e
// "moda"→"moda" têm correspondência direta. Decisão com o dono do produto:
// os demais (farmácia, açougue, papelaria, auto peças, geral) caem em
// "mercados" — mais perto de aparecer em algum lugar do que não publicar.

export const SEGMENTO_PARA_MODULO_VITRINE: Record<string, string> = {
  mercado: "mercados",
  farmacia: "mercados",
  acougue: "mercados",
  papelaria: "mercados",
  auto_pecas: "mercados",
  geral: "mercados",
  moda: "moda",
};

export function moduloVitrineParaSegmento(segmento: string): string {
  return SEGMENTO_PARA_MODULO_VITRINE[segmento] || "mercados";
}
