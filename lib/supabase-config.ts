// Configuração do Supabase com fallback
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

// Verificar se as variáveis de ambiente estão configuradas
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.warn('⚠️ Variáveis de ambiente do Supabase não encontradas!')
  console.warn('📝 Crie um arquivo .env.local com:')
  console.warn('NEXT_PUBLIC_SUPABASE_URL=sua_url_supabase')
  console.warn('NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon')
}

export { supabaseUrl, supabaseAnonKey }
