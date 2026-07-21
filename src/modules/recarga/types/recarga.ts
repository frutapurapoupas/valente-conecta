export interface Recarga {
  id: string;
  usuario_id: string;
  valor: number;
  metodo: "pix" | "cartao" | "boleto" | "transferencia";
  status: "pendente" | "confirmado" | "cancelado" | "falha";
  transacao_id?: string;
  comprovante?: string;
  data_confirmacao?: string;
  created_at?: string;
  updated_at?: string;
}

export interface RecargaFiltro {
  status?: string;
  dataInicio?: string;
  dataFim?: string;
  metodo?: string;
}

export interface RecargaStats {
  total: number;
  totalValor: number;
  pendentes: number;
  confirmados: number;
  cancelados: number;
}
