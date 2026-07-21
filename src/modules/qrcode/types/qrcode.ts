export interface QRCode {
  id: string;
  codigo: string;
  tipo: "estabelecimento" | "produto" | "promocao" | "usuario";
  referencia_id: string;
  metadata?: Record<string, any>;
  ativo: boolean;
  expiracao?: string;
  visualizacoes: number;
  created_at?: string;
  updated_at?: string;
}

export interface QRCodeStats {
  total: number;
  ativos: number;
  visualizacoesTotal: number;
}
