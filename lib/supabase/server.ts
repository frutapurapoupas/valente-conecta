import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  
  return createSupabaseClient(supabaseUrl, supabaseKey);
}

// Versão para uso com cookies (Server Components)
export function createServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createSupabaseClient(supabaseUrl, supabaseKey);
}

// Service role -- so' pra rotas admin-master que precisam escrever em
// `usuarios` de verdade (a tabela tem RLS restrita em UPDATE de proposito,
// por causa dos campos financeiros como wallet/pix_key -- a chave anon
// nao consegue mudar plano_geral de outro usuario, e nao deveria mesmo).
// Nunca usar isso em rota publica.
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  return createSupabaseClient(supabaseUrl, serviceRoleKey);
}

