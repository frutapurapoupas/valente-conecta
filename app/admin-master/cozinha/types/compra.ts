// app/admin-master/cozinha/types/compra.ts
export interface Compra {
  id: string;
  fornecedorId: string;
  fornecedorNome?: string;
  itens: CompraItem[];
  total: number;
  status: 'pendente' | 'aprovada' | 'entregue' | 'cancelada';
  dataPedido: string;
  dataEntrega?: string;
  observacao?: string;
  created_at: string;
}

export interface CompraItem {
  ingredienteId: string;
  ingredienteNome?: string;
  quantidade: number;
  precoUnitario: number;
  subtotal: number;
}

export interface CompraInput {
  fornecedorId: string;
  itens: Omit<CompraItem, 'ingredienteNome' | 'subtotal'>[];
  dataEntrega?: string;
  observacao?: string;
}