// lib/supabase.ts
// ✅ VERSÃO SIMPLES E DIRETA

import { createClient } from '@supabase/supabase-js'

// ✅ VARIÁVEIS COM VALIDAÇÃO
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// ✅ VALIDAÇÃO RÁPIDA
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// ✅ CRIAÇÃO DO CLIENTE
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
export default supabase


export interface Usuario {
  id: string;
  nome: string;
  whatsapp: string;
  cidade_base?: string;
  email?: string;
  codigo_indicacao?: string;
  convidado_por_id?: string | null;
  trial_started_at?: string;
  trial_end_at?: string;
  is_viral_active?: boolean;
  viral_end_at?: string;
  acesso_campanha_viral?: boolean;
  aceitou_politica_conteudo_versao?: number | null;
  aceitou_politica_conteudo_em?: string | null;
  aceitou_privacidade_versao?: number | null;
  aceitou_privacidade_em?: string | null;
  total_earned?: number;
  role: string;
}
