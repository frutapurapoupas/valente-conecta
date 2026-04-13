import { supabase } from '@/lib/supabase'

export async function enviarNotificacaoPush(usuarioId: string, titulo: string, mensagem: string) {
  // Supondo que tokens de push estejam salvos na tabela 'push_tokens'
  const { data, error } = await supabase.from('push_tokens').select('token').eq('usuarioId', usuarioId)
  if (error) throw error
  const tokens = data?.map((d: any) => d.token) || []
  // Aqui você integraria com FCM ou outro serviço de push real
  // Exemplo: chamar endpoint backend que dispara push para os tokens
  // fetch('/api/send-push', { method: 'POST', body: JSON.stringify({ tokens, titulo, mensagem }) })
  return tokens.length > 0
}
