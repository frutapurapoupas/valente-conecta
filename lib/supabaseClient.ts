// lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Tipo correto para a tabela usuarios (baseado na estrutura real)
export type Usuario = {
  id: string;  // UUID
  nome: string;
  whatsapp: string;
  email?: string;
  telefone?: string;
  wallet: number;
  role: 'user' | 'admin';
  plano?: string;
  trial_started_at: string;
  trial_end_at: string;
  is_viral_active: boolean;
  viral_activated_at: string | null;
  viral_end_at: string | null;
  pix_key: string | null;
  total_earned: number;
  last_popup_shown: string | null;
  codigo_indicacao: string | null;
  convidado_por_id: string | null;
  created_at: string;
  updated_at?: string;
  cidade?: string;
  bairro?: string;
  nivel?: string;
  status_academia?: string;
};