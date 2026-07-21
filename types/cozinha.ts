// types/cozinha.ts

import type {
  CanonicalRecipe,
  CanonicalRecipeIngredient,
  ReceitaCanonica,
  ReceitaCanonicaCompat,
} from './receita-canonica';

// ============================================================
// INTERFACE: COMPRA ITEM
// ============================================================

export interface CompraItem {
  id: string;
  nome: string;
  unidade: string;
  quantidade: number;
  preco_estimado?: number;
  preco_real?: number;
  fornecedor?: string;
  comprado: boolean;
  prioridade?: 'alta' | 'media' | 'baixa';
  data_compra?: Date;
  categoria?: string;
  receita_origem?: string;
  observacao?: string;
  created_at?: string;
  updated_at?: string;
}

// ============================================================
// INTERFACE: DASHBOARD STATS
// ============================================================

export interface DashboardStats {
  // Métricas de Pratos
  pratosAtivos: number;
  pratosInativos: number;
  totalPratos: number;
  
  // Métricas de Insumos
  totalInsumos: number;
  insumosBaixos: number;
  insumosCriticos: number;
  
  // Métricas de Produção
  producaoHoje: number;
  producaoPendente: number;
  producaoConcluida: number;
  
  // Métricas Financeiras
  receitaMes: number;
  despesaMes: number;
  lucroMes: number;
  margem: number;
  custoTotal: number;
  precoTotal: number;
  
  // Métricas de Vendas
  vendasHoje: number;
  vendasMes: number;
  ticketMedio: number;
}

// ============================================================
// INTERFACE: RECEITA
// ============================================================

export interface Receita {
  id: string;
  nome: string;
  descricao: string;
  categoria: string;
  porcoes: number;
  preco_sugerido: number;
  custo_total: number;
  ingredientes: IngredienteReceita[];
  historico?: any[];
  ativo: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface IngredienteReceita {
  id?: string;
  ingrediente_nome: string;
  ingrediente_id: string;
  quantidade: number;
  unidade: string;
  custo_total: number;
}

export interface TotaisReceita {
  custoTotal: number;
  custoPorPorcao: number;
  precoTotal: number;
  lucroTotal: number;
  margem: number;
}

export interface DashboardStatsCalculated extends DashboardStats {
  timestamp: Date;
}

// ============================================================
// INTERFACE: PRATO (NOVO)
// ============================================================

export interface Prato {
  id: string;
  nome: string;
  descricao: string;
  categoria: 'Prato Principal' | 'Sobremesa' | 'Entrada' | 'Bebida' | 'Salgado' | 'Bolo' | string;
  preco: number;
  custo: number;
  margem: number;
  tempo_preparo: number;
  porcoes: number;
  ingredientes: IngredienteReceita[];
  imagem_url?: string;
  ativo: boolean;
  destaque: boolean;
  created_at: Date;
  updated_at: Date;
}

// ============================================================
// INTERFACE: PRATO FORM DATA (NOVO)
// ============================================================

export interface PratoFormData {
  nome: string;
  descricao: string;
  categoria: string;
  preco: number;
  custo: number;
  tempo_preparo: number;
  porcoes: number;
  ingredientes: IngredienteReceita[];
  imagem_url?: string;
  ativo: boolean;
  destaque: boolean;
}

// ============================================================
// IMAGENS PLACEHOLDER POR CATEGORIA (NOVO)
// ============================================================

export const IMAGENS_PLACEHOLDER: Record<string, string> = {
  'Prato Principal': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop',
  'Sobremesa': 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&h=300&fit=crop',
  'Entrada': 'https://images.unsplash.com/photo-1625938142826-4df46be508d4?w=400&h=300&fit=crop',
  'Bebida': 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&h=300&fit=crop',
  'Salgado': 'https://images.unsplash.com/photo-1604467450356-2e57bbf3b9a4?w=400&h=300&fit=crop',
  'Bolo': 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop',
  'default': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop'
};

// ============================================================
// CONTRATO CANONICO DE RECEITA (FASE 2B.1)
// ============================================================

export type { ReceitaCanonica, CanonicalRecipe, ReceitaCanonicaCompat };
export type ReceitaIngredienteCanonica = CanonicalRecipeIngredient;


