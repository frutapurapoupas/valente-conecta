export interface EstoqueType {
  id: string;
  produto: string;
  categoria: string;
  quantidade: number;
  unidade: string;
  estoque_minimo: number;
  estoque_maximo: number;
  localizacao: string;
  ultima_atualizacao: string;
  created_at: string;
  updated_at: string;
}

export interface StockMovement {
  id: string;
  produto_id: string;
  tipo: 'entrada' | 'saida';
  quantidade: number;
  motivo: string;
  created_at: string;
}

