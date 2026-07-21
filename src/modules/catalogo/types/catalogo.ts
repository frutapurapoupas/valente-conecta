// ==================================================
// CATALOGO MODULE - TYPES
// ==================================================

export interface Produto {
  id: string;
  nome: string;
  descricao?: string;
  preco: number;
  categoria_id?: string;
  categoria?: Categoria;
  imagem?: string;
  imagens?: string[];
  disponivel: boolean;
  destaque?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Categoria {
  id: string;
  nome: string;
  descricao?: string;
  icone?: string;
  ordem?: number;
  created_at?: string;
}

export interface ProdutoFiltro {
  categoria?: string;
  busca?: string;
  disponivel?: boolean;
  destaque?: boolean;
  precoMin?: number;
  precoMax?: number;
}

export interface ProdutoResponse {
  produtos: Produto[];
  total: number;
  pagina: number;
  totalPaginas: number;
}
