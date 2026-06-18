export function formatCurrency(value: number | string | null | undefined) {
  const num = Number(value ?? 0);

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(num);
}