export interface ProducaoType {
  id: string;
  prato_id: string;
  prato_nome?: string;
  data_producao: string;
  quantidade_prevista: number;
  quantidade_produzida: number;
  status: 'planejado' | 'em_producao' | 'concluido' | 'cancelado';
  observacoes: string;
  created_at: string;
  updated_at: string;
}

