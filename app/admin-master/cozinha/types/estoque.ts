// app/admin-master/cozinha/types/estoque.ts
export interface MovimentacaoEstoque {
  id: string;
  ingredienteId: string;
  ingredienteNome?: string;
  tipo: 'entrada' | 'saida' | 'ajuste';
  quantidade: number;
  quantidadeAnterior: number;
  quantidadeNova: number;
  motivo: string;
  usuarioId: string;
  usuarioNome?: string;
  created_at: string;
}

export interface EstoqueResumo {
  ingredienteId: string;
  ingredienteNome: string;
  quantidadeAtual: number;
  estoqueMinimo: number;
  status: 'ok' | 'baixo' | 'critico';
  valorTotal: number;
}