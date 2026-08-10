/**
 * Formata uma quantidade e sua unidade, convertendo 'g' para 'kg' e 'ml' para 'L'
 * se a quantidade for >= 1000. Também arredonda o valor para 3 casas decimais.
 *
 * @param quantity - A quantidade numérica.
 * @param unit - A unidade de medida (ex: 'g', 'ml', 'un').
 * @returns Um objeto com a nova quantidade e unidade.
 */
export function formatQuantity(
  quantity: number,
  unit: string
): { quantity: number; unit: string } {
  const lowerCaseUnit = unit.toLowerCase();

  if (lowerCaseUnit === 'g' && quantity >= 1000) {
    return {
      quantity: parseFloat((quantity / 1000).toFixed(3)),
      unit: 'kg',
    };
  }

  if (lowerCaseUnit === 'ml' && quantity >= 1000) {
    return {
      quantity: parseFloat((quantity / 1000).toFixed(3)),
      unit: 'L',
    };
  }

  return { quantity: parseFloat(quantity.toFixed(3)), unit };
}

