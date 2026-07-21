// app/cozinha/types/cardapio.ts
export interface CardapioItem {
  id: string;
  dia: string; // 'segunda', 'terca', etc.
  produtoId: string;
  produto?: Produto;
  precoEspecial?: number;
  ativo: boolean;
}

export interface CardapioInput {
  dia: string;
  produtoId: string;
  precoEspecial?: number;
  ativo?: boolean;
}

export type DiaSemana = 
  | 'segunda'
  | 'terca'
  | 'quarta'
  | 'quinta'
  | 'sexta'
  | 'sabado'
  | 'domingo';