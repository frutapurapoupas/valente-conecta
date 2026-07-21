// ============================================
// UTILITÃRIO: CALCULAR MARGEM E LUCRO
// ============================================

export const calcularLucro = (preco: number, custo: number): number => {
  return preco - custo;
};

export const calcularMargem = (preco: number, custo: number): number => {
  if (preco === 0) return 0;
  return ((preco - custo) / preco) * 100;
};

export const calcularPrecoComDesconto = (preco: number, descontoPercentual: number): number => {
  return preco * (1 - descontoPercentual / 100);
};

export const calcularLucroPorQuantidade = (
  precoUnitario: number,
  custoUnitario: number,
  quantidade: number
): number => {
  return (precoUnitario - custoUnitario) * quantidade;
};

