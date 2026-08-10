// lib/catalogo/types.ts

// ============================================================================
// TIPOS PRINCIPAIS
// ============================================================================

export interface Categoria {
  id: string;
  nome: string;
  icone: string;
  cor: string;
  slug: string;
  perguntas: Pergunta[];
  created_at: string;
  updated_at: string;
}

export interface Pergunta {
  id: string;
  categoria_id: string;
  ordem: number;
  label: string;
  placeholder?: string;
  tipo: 'texto' | 'select' | 'numero' | 'cor' | 'medida';
  opcoes?: string[];
  obrigatorio: boolean;
  codigo: string; // usado para montar o SKU
  created_at: string;
}

export interface Produto {
  id: string;
  sku: string;
  nome: string;
  descricao: string;
  preco: number;
  preco_promocional?: number;
  categoria_id: string;
  categoria_nome: string;
  atributos: Record<string, any>;
  imagens: ImagemProduto[];
  video_url?: string;
  estoque: number;
  status: 'rascunho' | 'publicado' | 'inativo';
  destaque: boolean;
  visualizacoes: number;
  created_at: string;
  updated_at: string;
  criado_por: string;
}

export interface ImagemProduto {
  id: string;
  produto_id: string;
  url: string;
  url_thumbnail: string;
  url_medium: string;
  url_large: string;
  ordem: number;
  created_at: string;
}

export interface VideoProduto {
  id: string;
  produto_id: string;
  url: string;
  thumbnail: string;
  created_at: string;
}

// ============================================================================
// WIZARD - QUESTIONÁRIO DINÂMICO
// ============================================================================

export interface WizardState {
  step: number;
  categoria_id: string;
  respostas: Record<string, any>;
  imagens: File[];
  video?: File;
  produto: Partial<Produto>;
}

export interface WizardConfig {
  categorias: Categoria[];
  passos: number;
  titulo: string;
  subtitulo: string;
}

