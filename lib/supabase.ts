// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Variáveis de ambiente do Supabase não configuradas');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Tipos para o banco de dados
export type Usuario = {
  id: number;
  nome: string;
  whatsapp: string;
  email?: string;
  codigo_indicacao: string;
  convidado_por_id: number | null;
  trial_started_at: string;
  trial_end_at: string;
  is_viral_active: boolean;
  viral_activated_at: string | null;
  viral_end_at: string | null;
  pix_key: string | null;
  total_earned: number;
  last_popup_shown: string | null;
  role: 'user' | 'admin';
  created_at: string;
};

export type Indicacao = {
  id: number;
  usuario_id: number;
  indicado_id: number;
  created_at: string;
};

export type IndicacaoEstabelecimento = {
  id: number;
  usuario_id: number;
  nome_estabelecimento: string;
  tipo: 'comercio' | 'servico';
  telefone: string;
  endereco: string | null;
  status: 'pendente' | 'aprovado' | 'rejeitado' | 'pago';
  itens_cadastrados: number;
  itens_necessarios: number;
  created_at: string;
  pago_em: string | null;
  valor_pago: number;
};

export type AdminConfig = {
  id: number;
  chave: string;
  valor: string;
  descricao: string | null;
  updated_at: string;
};