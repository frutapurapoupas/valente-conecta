export interface Indicacao {
  id: string;
  nome_indicante: string;
  nome_indicado: string;
  telefone_indicado: string;
  email_indicado?: string;
  status: "pendente" | "aceito" | "concluido" | "cancelado";
  bonus?: number;
  user_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface IndicacaoFiltro {
  status?: string;
  dataInicio?: string;
  dataFim?: string;
  busca?: string;
}

export interface IndicacaoStats {
  total: number;
  pendentes: number;
  aceitos: number;
  concluidos: number;
  bonusTotal: number;
}
