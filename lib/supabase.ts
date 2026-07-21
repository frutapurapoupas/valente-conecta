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

