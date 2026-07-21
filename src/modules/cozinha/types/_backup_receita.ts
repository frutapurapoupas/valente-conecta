// app/cozinha/types/receita.ts

import type { CanonicalRecipe, ReceitaCanonicaCompat } from '@/types/receita-canonica';

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

// Compatibilidade tipada para transicao ao contrato canonico.
export type ReceitaCanonica = CanonicalRecipe;
export type ReceitaCompat = ReceitaCanonicaCompat;
