// lib/supabase.ts
// âœ… VERSÃƒO SIMPLES E DIRETA

import { createClient } from '@supabase/supabase-js'

// âœ… VARIÃVEIS COM VALIDAÃ‡ÃƒO
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// âœ… VALIDAÃ‡ÃƒO RÃPIDA
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// âœ… CRIAÃ‡ÃƒO DO CLIENTE
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
export default supabase


export interface Usuario {
  id: string;
  nome: string;
  whatsapp: string;
  email?: string;
  codigo_indicacao?: string;
  convidado_por_id?: string | null;
  trial_started_at?: string;
  trial_end_at?: string;
  is_viral_active?: boolean;
  viral_end_at?: string;
  total_earned?: number;
  role: string;
}
