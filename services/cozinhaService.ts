export const calcularValores = (precoVenda: number) => {
  const insumos = precoVenda * 0.40;
  const chef = precoVenda * 0.30;
  const parceiro = precoVenda * 0.30;
  return {
    insumos: Number(insumos.toFixed(2)),
    chef: Number(chef.toFixed(2)),
    parceiro: Number(parceiro.toFixed(2)),
    total: Number((insumos + chef + parceiro).toFixed(2))
  };
};
