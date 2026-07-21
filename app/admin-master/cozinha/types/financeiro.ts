// app/admin-master/cozinha/types/financeiro.ts
export interface LancamentoFinanceiroCozinha {
  id: string;
  tipo: 'receita' | 'despesa';
  categoria: string;
  descricao: string;
  valor: number;
  data: string;
  formaPagamento?: 'dinheiro' | 'pix' | 'cartao' | 'transferencia';
  referenciaId?: string; // ID da receita, compra, etc
  referenciaTipo?: 'receita' | 'compra' | 'producao';
  observacao?: string;
  created_at: string;
}

export interface ResumoFinanceiroCozinha {
  totalReceitas: number;
  totalDespesas: number;
  saldo: number;
  receitasPorCategoria: Record<string, number>;
  despesasPorCategoria: Record<string, number>;
  ultimosLancamentos: LancamentoFinanceiroCozinha[];
}