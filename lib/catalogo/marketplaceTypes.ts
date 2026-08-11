// Caminho: C:\valente_conecta\lib\catalogo\marketplaceTypes.ts
//
// Tipos compartilhados do marketplace (catalogo_itens / interesses / etc).
// Ver VALENTE_CONECTA_MODULO_MARKETPLACE_MONETIZACAO.md, secao 2.
// Usado por todos os modulos verticais (agua-gas, servicos, mercados,
// imoveis, emprego, construcao, saude, pet), conforme o principio de
// "interface unica reutilizavel" do VALENTE_CONECTA_MASTER_SPEC.md, secao 2.
//
// Nome separado de ./types.ts de proposito: aquele arquivo ja pertence ao
// wizard de publicacao do catalogo (Produto/Categoria/Pergunta, SKU
// dinamico por categoria) e nao deve ser confundido com este modelo.

export type ModuloId =
  | 'agua-gas'
  | 'servicos'
  | 'mercados'
  | 'imoveis'
  | 'emprego'
  | 'construcao'
  | 'saude'
  | 'pet';

export type Arquetipo = 'catalogo-carrinho' | 'agenda-profissional' | 'anuncio-contato';

export const ARQUETIPO_POR_MODULO: Record<ModuloId, Arquetipo> = {
  'agua-gas': 'catalogo-carrinho',
  mercados: 'catalogo-carrinho',
  pet: 'catalogo-carrinho',
  servicos: 'anuncio-contato',
  imoveis: 'anuncio-contato',
  emprego: 'anuncio-contato',
  construcao: 'anuncio-contato',
  saude: 'agenda-profissional',
};

export type StatusItem = 'ativo' | 'pausado' | 'removido';

export interface MidiaItem {
  tipo: 'imagem' | 'video';
  url: string;
  thumb_url?: string;
  ordem: number;
}

export interface CatalogoItem {
  id: string;
  dono_id: string;
  modulo: ModuloId | string;
  categoria: string;
  titulo: string;
  descricao_publica: string | null;
  preco: number | null;
  midia: MidiaItem[];
  latitude: number | null;
  longitude: number | null;
  status: StatusItem;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export type NovoCatalogoItem = Omit<CatalogoItem, 'id' | 'created_at' | 'updated_at' | 'status' | 'metadata'> & {
  status?: StatusItem;
  metadata?: Record<string, any>;
};

export type StatusLiberacao = 'pendente_pagamento' | 'liberado' | 'isento_assinatura';

export interface Interesse {
  id: string;
  item_id: string;
  comprador_id: string;
  fornecedor_id: string;
  status_comprador: StatusLiberacao;
  status_fornecedor: StatusLiberacao;
  valor_taxa_comprador: number;
  valor_taxa_fornecedor: number;
  mensagem: string | null;
  created_at: string;
}

export interface PerfilFornecedor {
  id: string;
  usuario_id: string;
  nome_exibicao: string;
  telefone: string;
  whatsapp: string | null;
  endereco: string | null;
  latitude: number | null;
  longitude: number | null;
  plano: 'gratis' | 'profissional' | 'loja' | 'premium';
  created_at: string;
  updated_at: string;
}

export interface ResultadoVitrine {
  id: string;
  modulo: string;
  categoria: string;
  titulo: string;
  descricao_publica: string | null;
  preco: number | null;
  midia: MidiaItem[];
  distancia_km: number | null;
  interesses_recentes: number;
  menor_preco_categoria: boolean;
}

export interface FiltrosBusca {
  termo?: string;
  modulo?: ModuloId | string;
  categoria?: string;
  latUsuario?: number;
  lngUsuario?: number;
  limite?: number;
  offset?: number;
}

export const LABEL_MODULO: Record<ModuloId, string> = {
  'agua-gas': 'Gás e Água',
  servicos: 'Serviços',
  mercados: 'Mercados',
  imoveis: 'Imóveis',
  emprego: 'Emprego',
  construcao: 'Construção',
  saude: 'Saúde',
  pet: 'Pet Shop',
};
