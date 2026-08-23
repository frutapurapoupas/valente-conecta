// Caminho: C:\valente_conecta\lib\pdv\agruparPorCatalogo.ts
//
// Agrupa ProdutoPDV por catalogoId -- usado pra detectar quando um produto
// tem mais de uma variante (grade de tamanho/cor, ver 069_pdv_estoque_variante.sql)
// nos 3 pontos onde a frente de caixa mostra produtos pro lojista escolher
// (grade mobile, busca por nome e leitura de codigo de barras no desktop).
// So' uma leitura derivada do array -- nao muda o formato de ProdutoPDV[]
// que o carrinho/RPC de venda ja esperam (cada variante continua sendo uma
// linha propria e independente).

import type { ProdutoPDV } from "./frenteCaixaTypes";

export function agruparPorCatalogo(produtos: ProdutoPDV[]): Map<string, ProdutoPDV[]> {
  const grupos = new Map<string, ProdutoPDV[]>();
  for (const produto of produtos) {
    // catalogoId nulo nao deveria acontecer (todo item de estoque referencia
    // um catalogo), mas se acontecer trata como grupo isolado em vez de
    // quebrar o agrupamento.
    const chave = produto.catalogoId || `sem-catalogo:${produto.estoqueId}`;
    const grupo = grupos.get(chave);
    if (grupo) grupo.push(produto);
    else grupos.set(chave, [produto]);
  }
  return grupos;
}

// Qual codigo imprimir/escanear pra um item especifico. O EAN fica no
// catalogo, compartilhado entre variantes (ver 069_pdv_estoque_variante.sql)
// -- so' e' seguro usar o EAN quando o produto NAO tem variacao (grupo com
// 1 linha so'). Com variacao, duas etiquetas com o mesmo EAN identificariam
// o produto errado na hora de escanear; o id da propria linha de estoque
// (unico por variante) resolve isso sem precisar de EAN por variante, que
// esse sistema nao tem.
export function codigoParaEtiqueta(produto: ProdutoPDV, tamanhoGrupo: number): string {
  return produto.ean && tamanhoGrupo === 1 ? produto.ean : produto.estoqueId;
}
