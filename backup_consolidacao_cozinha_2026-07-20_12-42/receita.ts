// app/cozinha/types/receita.ts

export interface Receita {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  imagem?: string;
  categoria?: string;
  ingredientes?: Array<{ nome: string; quantidade: number; unidade: string }>;
}

export type ReceitaInput = Omit<Receita, 'id'>;
