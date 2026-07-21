export interface Estabelecimento {
  id: string;
  nome: string;
  descricao?: string;
  categoria: string;
  endereco: string;
  cidade: string;
  estado: string;
  cep?: string;
  telefone?: string;
  email?: string;
  site?: string;
  latitude?: number;
  longitude?: number;
  status: "pendente" | "aprovado" | "rejeitado";
  usuario_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface EstabelecimentoFiltro {
  cidade?: string;
  categoria?: string;
  status?: string;
  busca?: string;
}

export interface EstabelecimentoStats {
  total: number;
  pendentes: number;
  aprovados: number;
  rejeitados: number;
  porCategoria: Record<string, number>;
}
