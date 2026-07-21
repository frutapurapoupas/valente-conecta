export interface PratoType {
  id: string;
  nome: string;
  descricao: string;
  categoria: string;
  preco: number;
  tempo_preparo: number;
  ingredientes: string[];
  status: 'ativo' | 'inativo';
  imagem: string;
  created_at: string;
  updated_at: string;
}

export interface CardapioItem {
  id: string;
  prato_id: string;
  prato_nome?: string;
  dia_semana: string;
  periodo: 'cafe' | 'almoco' | 'jantar';
  disponivel: boolean;
  created_at: string;
  updated_at: string;
}


