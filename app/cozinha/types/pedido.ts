export type PedidoStatus = 'pendente' | 'confirmado' | 'preparando' | 'pronto' | 'entregue' | 'cancelado';

export interface PedidoItemDetalhe {
  quantidade: number;
  produtoNome: string;
  subtotal: number;
}

export interface Pedido {
  id: string;
  status: PedidoStatus;
  created_at: string;
  usuarioId: string;
  usuarioNome?: string;
  total: number;
  observacao?: string;
  items: PedidoItemDetalhe[];
}