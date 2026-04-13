import { supabase } from '@/lib/supabase'

export async function gerarLinkConvite(clienteId: string): Promise<string> {
  // Gera um token único e salva no Supabase
  const token = Math.random().toString(36).substring(2, 10) + Date.now().toString(36)
  const { error } = await supabase.from('convites').insert({ clienteId, token })
  if (error) throw error
  // Retorna o link para o cliente
  return `${window.location.origin}/invite/${token}`
}

export async function validarConvite(token: string): Promise<{ valido: boolean; clienteId?: string }> {
  const { data, error } = await supabase.from('convites').select('clienteId').eq('token', token).single()
  if (error || !data) return { valido: false }
  return { valido: true, clienteId: data.clienteId }
}
