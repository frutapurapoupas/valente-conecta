import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

// Evita build “silencioso” sem variáveis no ambiente
if (!supabaseUrl || !supabaseAnonKey) {
  // No Vercel, isso ajuda MUITO a identificar falta de ENV
  // (o erro fica bem explícito nos logs)
  console.warn(
    "[Supabase] Variáveis de ambiente ausentes. Verifique NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);