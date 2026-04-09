export function sugerirAjustePreco(vendas: number, buscas: number, estoque: number) {
  if (buscas > (vendas * 3) && estoque < 10) {
    return { acao: "AUMENTAR", percentual: 5, motivo: "Alta Procura / Baixo Estoque" };
  }
  if (vendas === 0 && buscas < 5) {
    return { acao: "PROMOÇÃO", percentual: 15, motivo: "Baixa Visitação" };
  }
  return null;
}