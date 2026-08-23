// Caminho: C:\valente_conecta\lib\pdv\importacaoEstoqueTypes.ts
//
// Tipos compartilhados entre o wizard de importação de planilha
// (app/pdv/importar-estoque/*) e o endpoint que processa em lote
// (app/api/pdv/importar-estoque/lote/route.ts).

import type { ModuloId } from '@/lib/catalogo/marketplaceTypes';

export interface LinhaPlanilha {
  nome: string;
  ean?: string;
  preco: number;
  quantidade?: number;
  categoria?: string;
}

export interface CampoMapeavel {
  campo: 'nome' | 'ean' | 'preco' | 'quantidade' | 'categoria';
  label: string;
  obrigatorio: boolean;
}

export const CAMPOS_MAPEAVEIS: CampoMapeavel[] = [
  { campo: 'nome', label: 'Nome do produto', obrigatorio: true },
  { campo: 'ean', label: 'Código de barras (EAN)', obrigatorio: false },
  { campo: 'preco', label: 'Preço', obrigatorio: true },
  { campo: 'quantidade', label: 'Quantidade em estoque', obrigatorio: false },
  { campo: 'categoria', label: 'Categoria', obrigatorio: false },
];

// Índice da coluna na planilha (0-based) pra cada campo do sistema, ou null
// quando o lojista não tem essa coluna / escolheu "Nenhuma".
export type MapeamentoColunas = Record<CampoMapeavel['campo'], number | null>;

export type OrigemFoto = 'catalogo_interno' | 'kodebar' | 'placeholder';

export interface ResultadoLinha {
  linha_index: number;
  status: 'publicado' | 'erro';
  item_id?: string;
  foto_origem?: OrigemFoto;
  foto_ficticia?: boolean;
  erro?: string;
}

export interface PayloadLote {
  donoId: string;
  modulo: ModuloId | string;
  linhas: LinhaPlanilha[];
}

export interface RespostaLote {
  success: boolean;
  resultados: ResultadoLinha[];
}

export const TAMANHO_LOTE = 25;
