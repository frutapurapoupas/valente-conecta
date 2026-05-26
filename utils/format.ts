export const formatCurrency = (value: number): string => { return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value); };
export const formatDate = (date: Date): string => { return new Intl.DateTimeFormat("pt-BR").format(date); };
export const formatPhone = (phone: string): string => { return phone.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3"); };
