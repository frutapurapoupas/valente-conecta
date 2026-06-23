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